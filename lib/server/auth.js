import { createHash, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getDb } from './db';

const scrypt = promisify(scryptCb);
export const SESSION_COOKIE = 'apex_session';
export const STATE_COOKIE = 'apex_oauth_state';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const randomToken = () => randomBytes(32).toString('base64url');
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

export function requestOrigin(request) {
  const configured = new URL(process.env.NEXT_PUBLIC_BASE_URL);
  const incoming = request.headers.get('origin');
  if (incoming) {
    let url;
    try { url = new URL(incoming); } catch { throw new HttpError(403, 'Invalid request origin.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new HttpError(403, 'Request origin not allowed.');
    return url.origin;
  }
  // No Origin header (e.g. same-origin navigation): derive from the forwarded host so
  // preview, deployed and custom domains all resolve to the domain the user is actually on.
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0].trim();
  if (host) {
    const proto = (request.headers.get('x-forwarded-proto')?.split(',')[0] || 'https').trim();
    return `${proto}://${host}`;
  }
  return configured.origin;
}
export function checkOrigin(request) {
  // CSRF protection: browsers set sec-fetch-site=cross-site for requests originating from
  // another site. Same-origin/same-site/none requests are allowed. Preview, deployed and
  // custom domains vary, so we intentionally do not require an exact host match.
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403, 'Cross-site requests are not allowed.');
  requestOrigin(request);
}
export function cookieOptions(request, maxAge) {
  const secure = request.headers.get('x-forwarded-proto')?.split(',')[0] === 'https' || request.nextUrl.protocol === 'https:' || request.headers.get('origin')?.startsWith('https://') || process.env.NODE_ENV === 'production';
  return { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge };
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, salt, hex] = (encoded || '').split('$');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const actual = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(actual, Buffer.from(hex, 'hex'));
}
export function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, activeSubjects: user.activeSubjects || [], onboardingComplete: !!user.onboardingComplete, subscription: 'free', authProvider: user.providerId ? 'google' : 'password' };
}
export function newUser({ name, email, ...extra }) {
  const id = randomUUID();
  return { _id: id, id, name, email, activeSubjects: [], onboardingComplete: false, createdAt: new Date(), ...extra };
}
export async function currentUser(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw || raw.length > 256) return null;
  const db = await getDb();
  const session = await db.collection('apex_auth_sessions').findOne({ tokenHash: hash(raw), expiresAt: { $gt: new Date() } });
  return session ? db.collection('apex_users').findOne({ id: session.userId }) : null;
}
export async function requireUser(request) {
  const user = await currentUser(request);
  if (!user) throw new HttpError(401, 'Please sign in to access your account.');
  return user;
}
export async function revokeSession(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (raw) await (await getDb()).collection('apex_auth_sessions').deleteOne({ tokenHash: hash(raw) });
}
export async function attachSession(response, request, userId) {
  await revokeSession(request);
  const raw = randomToken();
  const id = randomUUID();
  const maxAge = 30 * 86400;
  await (await getDb()).collection('apex_auth_sessions').insertOne({ _id: id, id, userId, tokenHash: hash(raw), createdAt: new Date(), expiresAt: new Date(Date.now() + maxAge * 1000) });
  response.cookies.set(SESSION_COOKIE, raw, cookieOptions(request, maxAge));
  return response;
}
export async function rateLimit(request, identity) {
  const db = await getDb();
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0];
  const bucket = Math.floor(Date.now() / 600000);
  const key = hash(`${ip}:${identity}:${bucket}`);
  let result;
  try {
    result = await db.collection('apex_rate_limits').findOneAndUpdate({ key }, { $inc: { count: 1 }, $setOnInsert: { _id: randomUUID(), expiresAt: new Date((bucket + 1) * 600000) } }, { upsert: true, returnDocument: 'after' });
  } catch (error) { if (error.code === 11000) throw new HttpError(429, 'Too many attempts. Please try again in a few minutes.'); throw error; }
  if (result.count > 15) throw new HttpError(429, 'Too many attempts. Please try again in a few minutes.');
}
