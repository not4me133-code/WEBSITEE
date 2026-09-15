import { NextResponse } from 'next/server';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { SUBJECTS, SAMPLE_QUESTIONS, buildFullTest } from '@/lib/mockData';
import { getDb } from '@/lib/server/db';
import { HttpError, SESSION_COOKIE, STATE_COOKIE, hash, randomToken, newUser, currentUser, requireUser, checkOrigin, requestOrigin, cookieOptions, hashPassword, verifyPassword, attachSession, revokeSession, rateLimit } from '@/lib/server/auth';
import { workspaceFor } from '@/lib/server/workspace';
import { managedLoginUrl, exchangeManagedSession } from '@/lib/server/managed-google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const emailSchema = z.string().trim().email().max(254).transform(s => s.toLowerCase());
const passwordSchema = z.string().min(10, 'Use at least 10 characters for your password.').max(200);
async function readBody(request) {
  const raw = await request.text();
  if (raw.length > 32000) throw new HttpError(413, 'Request is too large.');
  try { return JSON.parse(raw); } catch { throw new HttpError(400, 'Please send valid JSON.'); }
}
function fail(error) {
  if (error instanceof z.ZodError) return json({ error: error.issues[0]?.message || 'Please check your details.' }, 400);
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error.code === 11000) return json({ error: 'This email is already registered. Sign in with your existing method.' }, 409);
  console.error('Account API failure:', error.name, error.code || 'internal');
  return json({ error: 'We could not complete that request. Please try again shortly.' }, 500);
}

export async function GET(request, { params }) {
  try {
    const { path = [] } = await params;
    const route = path.join('/');
    if (route === 'health') return json({ ok: true, service: 'apexprep', mode: 'accounts-with-sample-practice' });
    if (route === 'auth/me') {
      const user = await currentUser(request);
      return json(user ? await workspaceFor(user) : { user: null, sessions: [], subjectStats: {} });
    }
    if (route === 'workspace' || route === 'practice/sessions') {
      const user = await requireUser(request);
      const data = await workspaceFor(user);
      return json(route === 'workspace' ? data : { sessions: data.sessions });
    }
    if (path[0] === 'practice' && path[1] === 'sessions' && path.length === 3) {
      const user = await requireUser(request);
      const session = await (await getDb()).collection('apex_practice_sessions').findOne({ id: path[2], userId: user.id }, { projection: { _id: 0, userId: 0, answers: 0 } });
      if (!session) throw new HttpError(404, 'Practice session not found.');
      return json({ session });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (error) { return fail(error); }
}

export async function POST(request, { params }) {
  try {
    checkOrigin(request);
    const { path = [] } = await params;
    const route = path.join('/');
    if (route === 'auth/logout') {
      await revokeSession(request);
      const response = json({ ok: true });
      response.cookies.set(SESSION_COOKIE, '', cookieOptions(request, 0));
      response.cookies.set(STATE_COOKIE, '', cookieOptions(request, 0));
      return response;
    }
    if (route === 'auth/google/start') {
      await rateLimit(request, 'google-start');
      const state = randomToken();
      const id = randomUUID();
      await (await getDb()).collection('apex_oauth_states').insertOne({ _id: id, stateHash: hash(state), expiresAt: new Date(Date.now() + 600000) });
      const callback = new URL('/auth/callback', requestOrigin(request));
      callback.searchParams.set('state', state);
      const response = json({ url: managedLoginUrl(callback.toString()) });
      response.cookies.set(STATE_COOKIE, state, cookieOptions(request, 600));
      return response;
    }
    if (route === 'auth/google/callback') {
      const { session_id, state } = z.object({ session_id: z.string().regex(/^[A-Za-z0-9._~-]{8,512}$/), state: z.string().length(43) }).strict().parse(await readBody(request));
      const cookie = request.cookies.get(STATE_COOKIE)?.value || '';
      if (cookie.length !== state.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(state))) throw new HttpError(401, 'Google sign-in expired. Please start again.');
      const db = await getDb();
      const transaction = await db.collection('apex_oauth_states').findOneAndDelete({ stateHash: hash(state), expiresAt: { $gt: new Date() } });
      if (!transaction) throw new HttpError(401, 'This sign-in link has already been used or has expired.');
      if (await db.collection('apex_oauth_used').findOne({ sessionHash: hash(session_id) })) throw new HttpError(401, 'This sign-in link has already been used.');
      const identity = await exchangeManagedSession(session_id);
      try { await db.collection('apex_oauth_used').insertOne({ _id: randomUUID(), sessionHash: hash(session_id), createdAt: new Date() }); } catch (error) { if (error.code === 11000) throw new HttpError(401, 'This sign-in link has already been used.'); throw error; }
      let user = await db.collection('apex_users').findOne({ providerId: identity.providerId });
      if (!user) {
        const existing = await db.collection('apex_users').findOne({ email: identity.email });
        if (existing) throw new HttpError(409, 'An account with this email already exists. Please use your email and password to sign in. Google is not linked automatically.');
        user = newUser(identity);
        await db.collection('apex_users').insertOne(user);
      }
      const response = json(await workspaceFor(user));
      response.cookies.set(STATE_COOKIE, '', cookieOptions(request, 0));
      return await attachSession(response, request, user.id);
    }
    if (route === 'auth/register') {
      const data = z.object({ name: z.string().trim().min(1, 'Please enter your name.').max(80), email: emailSchema, password: passwordSchema }).strict().parse(await readBody(request));
      await rateLimit(request, `register:${data.email}`);
      const db = await getDb();
      if (await db.collection('apex_users').findOne({ email: data.email })) throw new HttpError(409, 'This email is already registered. Sign in with your existing method.');
      const user = newUser({ name: data.name, email: data.email, passwordHash: await hashPassword(data.password), emailVerified: false });
      await db.collection('apex_users').insertOne(user);
      return await attachSession(json(await workspaceFor(user), 201), request, user.id);
    }
    if (route === 'auth/login') {
      const data = z.object({ email: emailSchema, password: z.string().min(1).max(200) }).strict().parse(await readBody(request));
      await rateLimit(request, `login:${data.email}`);
      const user = await (await getDb()).collection('apex_users').findOne({ email: data.email });
      if (!user?.passwordHash || !await verifyPassword(data.password, user.passwordHash)) throw new HttpError(401, 'Invalid email or password. If you joined with Google, use Continue with Google.');
      return await attachSession(json(await workspaceFor(user)), request, user.id);
    }
    if (route === 'practice/sessions') {
      const user = await requireUser(request);
      const data = z.object({ attemptId: z.string().uuid(), subjectId: z.string(), type: z.enum(['drill', 'full_test']), answers: z.record(z.enum(['A', 'B', 'C', 'D'])), durationSec: z.number().int().min(0).max(86400) }).strict().parse(await readBody(request));
      const subject = SUBJECTS.find(s => s.id === data.subjectId);
      if (!subject || !(user.activeSubjects || []).includes(subject.id)) throw new HttpError(400, 'Choose this subject in your account before practicing.');
      const questions = data.type === 'full_test' ? buildFullTest(subject.id) : (SAMPLE_QUESTIONS[subject.id] || []).slice(0, 5);
      if (!questions.length || questions.some(q => !data.answers[q.id]) || Object.keys(data.answers).length !== questions.length) throw new HttpError(400, 'Answer every question before saving this session.');
      const correct = questions.filter(q => data.answers[q.id] === q.correct_answer).length;
      const db = await getDb();
      const existing = await db.collection('apex_practice_sessions').findOne({ userId: user.id, attemptId: data.attemptId });
      let id = existing?.id || randomUUID();
      if (!existing) {
        const row = { _id: id, id, userId: user.id, attemptId: data.attemptId, subjectId: subject.id, type: data.type, title: data.type === 'full_test' ? `${subject.name} · Full Practice Test` : `${subject.short} · Mixed Drill`, total: questions.length, correct, score: Math.round(correct / questions.length * 100), durationMin: Math.max(1, Math.round(data.durationSec / 60)), completedAt: new Date(), questionIds: [...new Set(questions.map(q => q.id.split('_full_')[0]))] };
        try { await db.collection('apex_practice_sessions').insertOne(row); } catch (error) { if (error.code !== 11000) throw error; id = (await db.collection('apex_practice_sessions').findOne({ userId: user.id, attemptId: data.attemptId })).id; }
      }
      const workspace = await workspaceFor(user);
      return json({ ...workspace, result: workspace.sessions.find(s => s.id === id) }, existing ? 200 : 201);
    }
    return json({ error: 'Not found.' }, 404);
  } catch (error) { return fail(error); }
}

export async function PATCH(request, { params }) {
  try {
    checkOrigin(request);
    const { path = [] } = await params;
    if (path.join('/') !== 'workspace') return json({ error: 'Not found.' }, 404);
    const user = await requireUser(request);
    const data = z.object({ activeSubjects: z.array(z.string()).min(1).max(SUBJECTS.length) }).strict().parse(await readBody(request));
    if (data.activeSubjects.some(id => !SUBJECTS.some(s => s.id === id))) throw new HttpError(400, 'Please choose a supported subject.');
    const activeSubjects = [...new Set(data.activeSubjects)];
    await (await getDb()).collection('apex_users').updateOne({ id: user.id }, { $set: { activeSubjects, onboardingComplete: true, updatedAt: new Date() } });
    return json(await workspaceFor({ ...user, activeSubjects, onboardingComplete: true }));
  } catch (error) { return fail(error); }
}
