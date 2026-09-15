import { SUBJECTS, SAMPLE_QUESTIONS } from '@/lib/mockData';
import { getDb } from './db';
import { safeUser } from './auth';

export async function workspaceFor(user) {
  const rows = await (await getDb()).collection('apex_practice_sessions').find({ userId: user.id }, { projection: { _id: 0, userId: 0, answers: 0 } }).sort({ completedAt: -1 }).limit(500).toArray();
  const total = rows.reduce((n, r) => n + r.total, 0);
  const correct = rows.reduce((n, r) => n + r.correct, 0);
  const day = new Date(); day.setUTCHours(0, 0, 0, 0);
  const days = new Set(rows.map(r => new Date(r.completedAt).toISOString().slice(0, 10)));
  if (!days.has(day.toISOString().slice(0, 10))) day.setUTCDate(day.getUTCDate() - 1);
  let streakDays = 0;
  while (days.has(day.toISOString().slice(0, 10))) { streakDays++; day.setUTCDate(day.getUTCDate() - 1); }
  const subjects = Object.fromEntries(SUBJECTS.map(subject => {
    const history = rows.filter(r => r.subjectId === subject.id);
    const attempted = history.reduce((n, r) => n + r.total, 0);
    const successes = history.reduce((n, r) => n + r.correct, 0);
    const seen = new Set(history.flatMap(r => r.questionIds || []));
    return [subject.id, { readiness: attempted ? Math.round(successes / attempted * 100) : 0, progress: Math.min(100, Math.round(seen.size / Math.max(1, (SAMPLE_QUESTIONS[subject.id] || []).length) * 100)), lastScore: history[0]?.score ?? null }];
  }));
  return { user: { ...safeUser(user), streakDays, globalReadiness: total ? Math.round(correct / total * 100) : 0 }, sessions: rows, subjectStats: subjects };
}
