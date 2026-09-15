'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Target,
  LayoutDashboard,
  BookOpen,
  FileText,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Zap,
  ArrowLeft,
  Trophy,
  GraduationCap,
  LogIn,
  Crown,
  BarChart3,
} from 'lucide-react';
import { SUBJECTS, MOCK_USER, MOCK_SESSIONS, SAMPLE_QUESTIONS, buildFullTest } from '@/lib/mockData';

/* --------------------------- Small UI helpers --------------------------- */

const cn = (...cls) => cls.filter(Boolean).join(' ');

function ProgressRing({ value = 0, size = 72, stroke = 8, colorClass = 'text-indigo-500' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="text-slate-200" stroke="currentColor" fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={colorClass}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 800ms ease' }}
        />
      </svg>
      <span className="absolute text-sm font-semibold text-slate-800">{value}%</span>
    </div>
  );
}

function Chip({ children, className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600', className)}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, styles[variant], className)}>
      {children}
    </button>
  );
}

/* ------------------------------ Auth screen ----------------------------- */

function AuthScreen({ onSignIn }) {
  const [mode, setMode] = useState('signin');
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white overflow-hidden">
        <div className="flex items-center gap-2 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ApexPrep</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Score higher on every AP exam.</h1>
          <p className="mt-4 text-indigo-100 leading-relaxed">
            Targeted drills, full-length simulated tests, and readiness analytics that tell you exactly what to study next.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { k: '4', v: 'AP Subjects' },
              { k: '1,400+', v: 'Practice Qs' },
              { k: '92%', v: 'Score Uplift' },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-white/10 backdrop-blur p-4">
                <div className="text-2xl font-bold">{s.k}</div>
                <div className="text-xs text-indigo-100">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-indigo-100/80">© 2025 ApexPrep · Built for students, by students.</div>
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">ApexPrep</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin' ? 'Sign in to continue your prep streak.' : 'Start your streak in under 60 seconds.'}
          </p>

          <div className="mt-8 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-slate-600">Full name</label>
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none" placeholder="Alex Chen" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input type="email" defaultValue="alex@student.io" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none" placeholder="you@school.edu" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input type="password" defaultValue="••••••••" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none" placeholder="••••••••" />
            </div>
            <Btn onClick={onSignIn} className="w-full">
              <LogIn className="h-4 w-4" /> {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Btn>
            <div className="text-center text-sm text-slate-500">
              {mode === 'signin' ? (
                <>
                  New here?{' '}
                  <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('signup')}>Create an account</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('signin')}>Sign in</button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* --------------------------- Onboarding screen -------------------------- */

function Onboarding({ selected, setSelected, onContinue }) {
  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" /> Welcome to ApexPrep
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Pick the subjects you’re prepping for</h1>
          <p className="mt-2 text-slate-500">You can always add or remove subjects later from your dashboard.</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {SUBJECTS.map((s) => {
            const active = selected.includes(s.id);
            return (
              <motion.button
                key={s.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(s.id)}
                className={cn(
                  'relative text-left rounded-2xl border p-5 transition-all bg-white',
                  active ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold text-slate-900">{s.name}</div>
                <div className="mt-1 text-xs text-slate-500">{s.units} units · {s.totalQuestions} practice questions</div>
                {active && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="text-sm text-slate-500">{selected.length} selected</div>
          <Btn onClick={onContinue} disabled={selected.length === 0}>
            Continue to dashboard <ChevronRight className="h-4 w-4" />
          </Btn>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------- Sidebar ------------------------------- */

function Sidebar({ view, setView, user }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drills', label: 'Practice Drills', icon: BookOpen },
    { id: 'tests', label: 'Full Tests', icon: FileText },
  ];
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight">ApexPrep</span>
      </div>
      <nav className="mt-8 space-y-1">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = view === n.id || (n.id === 'drills' && view.startsWith('drill')) || (n.id === 'tests' && view.startsWith('test'));
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-indigo-600' : 'text-slate-400')} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        {user.subscription === 'free' ? (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4" /> Upgrade to Pro
            </div>
            <p className="mt-1 text-xs text-indigo-100">Unlimited full tests, adaptive drills, AI explanations.</p>
            <Btn variant="outline" className="mt-3 w-full !bg-white !text-indigo-700 hover:!bg-indigo-50">See plans</Btn>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold"><Crown className="h-4 w-4 text-amber-400" /> Pro member</div>
            <p className="mt-1 text-xs text-slate-300">All features unlocked. Keep the streak going!</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-xs text-slate-500 capitalize">{user.subscription} plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------- Dashboard ------------------------------ */

function Dashboard({ user, activeSubjects, sessions, onStartDrill, onOpenTests }) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Good afternoon</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}.</h1>
          <p className="mt-1 text-sm text-slate-500">Here’s where your prep stands today.</p>
        </div>
        <Btn onClick={() => onStartDrill(activeSubjects[0])}>
          <Zap className="h-4 w-4" /> Start a quick drill
        </Btn>
      </div>

      {/* Top metric banner */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Flame className="h-4 w-4 text-orange-500" /> Study Streak
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">{user.streakDays}</span>
            <span className="text-sm text-slate-500">days in a row</span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={cn('h-6 flex-1 rounded', i < user.streakDays ? 'bg-orange-500' : 'bg-slate-100')} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Target className="h-4 w-4 text-indigo-600" /> Global Readiness
          </div>
          <div className="mt-2 flex items-center gap-4">
            <ProgressRing value={user.globalReadiness} colorClass="text-indigo-600" />
            <div>
              <div className="text-sm font-semibold text-slate-900">On track for a 4</div>
              <div className="text-xs text-slate-500">Based on drill accuracy & pacing</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> This Week
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">{sessions.length}</span>
            <span className="text-sm text-slate-500">sessions completed</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-semibold">↑ 32% vs. last week</div>
        </motion.div>
      </div>

      {/* Subject cards */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Your subjects</h2>
        <button className="text-sm font-semibold text-indigo-600 hover:underline">Manage</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {activeSubjects.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer group"
            onClick={() => onStartDrill(s)}
          >
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 font-semibold text-slate-900 leading-tight">{s.name}</div>
            <div className="mt-1 text-xs text-slate-500">{s.units} units · {s.totalQuestions} Qs</div>

            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={s.readiness} size={56} stroke={6} colorClass={s.ring} />
              <div className="flex-1">
                <div className="text-xs text-slate-500">Course progress</div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full', s.accent)} style={{ width: `${s.progress}%` }} />
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">{s.progress}% complete</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <Chip>Last score: {s.lastScore}%</Chip>
              <span className="font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                Drill <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent activity</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {sessions.map((s) => {
              const subj = SUBJECTS.find((x) => x.id === s.subjectId);
              const good = s.score >= 75;
              return (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', subj?.color)}>
                    {s.type === 'full_test' ? <FileText className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{s.title}</div>
                    <div className="text-xs text-slate-500">{subj?.name} · {s.correct}/{s.total} correct · {s.durationMin} min</div>
                  </div>
                  <div className={cn('text-lg font-bold', good ? 'text-emerald-600' : 'text-amber-600')}>{s.score}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-900">Recommended next</h2>
          <p className="mt-1 text-xs text-slate-500">Based on your weakest units this week.</p>
          <div className="mt-4 space-y-3">
            {activeSubjects.slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => onStartDrill(s)} className="w-full text-left rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', s.accent)} />
                  <span className="text-sm font-semibold text-slate-900">{s.short} · Weakest unit</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">10-question focused drill · ~8 min</div>
              </button>
            ))}
            <Btn variant="outline" className="w-full mt-2" onClick={onOpenTests}>
              <FileText className="h-4 w-4" /> Take a full-length test
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Drills / Test flows ------------------------ */

function SubjectPicker({ activeSubjects, title, cta, onPick }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-slate-500">{cta}</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {activeSubjects.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -2 }}
            onClick={() => onPick(s)}
            className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 transition-colors"
          >
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 font-semibold text-slate-900">{s.name}</div>
            <div className="mt-1 text-xs text-slate-500">{s.units} units · Readiness {s.readiness}%</div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              Start <ChevronRight className="h-4 w-4" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function QuestionRunner({ subject, questions, mode, onExit, onFinish }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({}); // qid -> optionId
  const [showExplanation, setShowExplanation] = useState(false);
  const q = questions[i];
  const chosen = answers[q?.id];
  const isCorrect = chosen && chosen === q?.correct_answer;

  const choose = (optId) => {
    if (chosen) return; // lock after first pick in drill mode
    setAnswers({ ...answers, [q.id]: optId });
    if (mode === 'drill') setShowExplanation(true);
  };

  const next = () => {
    setShowExplanation(false);
    if (i < questions.length - 1) {
      setI(i + 1);
    } else {
      // compute score
      const correct = questions.reduce((acc, qq) => acc + (answers[qq.id] === qq.correct_answer ? 1 : 0), 0);
      const bonus = mode === 'drill' && isCorrect ? 1 : 0;
      onFinish({
        subjectId: subject.id,
        type: mode === 'full_test' ? 'full_test' : 'drill',
        total: questions.length,
        correct: correct + bonus,
        score: Math.round(((correct + bonus) / questions.length) * 100),
      });
    }
  };

  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Exit {mode === 'full_test' ? 'test' : 'drill'}
      </button>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{subject.short} · {q.unit}</div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Question {i + 1} of {questions.length}</h1>
        </div>
        <Chip><Clock className="h-3.5 w-3.5" /> {mode === 'full_test' ? '60 min' : 'Untimed'}</Chip>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${((i + (chosen ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-lg font-semibold text-slate-900 leading-relaxed">{q.question_text}</p>

        <div className="mt-6 space-y-3">
          {q.options.map((opt) => {
            const picked = chosen === opt.id;
            const correct = q.correct_answer === opt.id;
            let state = 'idle';
            if (chosen && mode === 'drill') {
              if (correct) state = 'correct';
              else if (picked) state = 'wrong';
              else state = 'muted';
            } else if (picked) state = 'picked';

            const stateClasses = {
              idle: 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40',
              picked: 'border-indigo-500 bg-indigo-50 text-indigo-900',
              correct: 'border-emerald-500 bg-emerald-50 text-emerald-900',
              wrong: 'border-rose-500 bg-rose-50 text-rose-900',
              muted: 'border-slate-200 opacity-60',
            };

            return (
              <button
                key={opt.id}
                onClick={() => choose(opt.id)}
                className={cn('w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-all', stateClasses[state])}
              >
                <span className={cn(
                  'h-7 w-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0',
                  state === 'correct' ? 'bg-emerald-500 text-white border-emerald-500' :
                  state === 'wrong' ? 'bg-rose-500 text-white border-rose-500' :
                  state === 'picked' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600'
                )}>
                  {state === 'correct' ? <CheckCircle2 className="h-4 w-4" /> : state === 'wrong' ? <XCircle className="h-4 w-4" /> : opt.id}
                </span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && chosen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div className={cn('rounded-xl border p-4', isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50')}>
                <div className={cn('flex items-center gap-2 text-sm font-semibold', isCorrect ? 'text-emerald-800' : 'text-rose-800')}>
                  {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {isCorrect ? 'Correct!' : `Not quite — the correct answer is ${q.correct_answer}.`}
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">Difficulty: <span className="font-semibold text-slate-700 capitalize">{q.difficulty}</span></div>
          <Btn onClick={next} disabled={!chosen}>
            {i === questions.length - 1 ? 'Finish' : 'Next question'} <ChevronRight className="h-4 w-4" />
          </Btn>
        </div>
      </motion.div>
    </div>
  );
}

function SessionResult({ subject, result, onDone }) {
  const passed = result.score >= 70;
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className={cn('mx-auto h-16 w-16 rounded-full flex items-center justify-center', passed ? 'bg-emerald-100' : 'bg-amber-100')}>
          <Trophy className={cn('h-8 w-8', passed ? 'text-emerald-600' : 'text-amber-600')} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{passed ? 'Great work!' : 'Keep pushing!'}</h1>
        <p className="mt-1 text-slate-500">You completed a {result.type === 'full_test' ? 'full-length test' : 'drill'} in {subject.name}.</p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Score</div>
            <div className="mt-1 text-2xl font-bold text-indigo-600">{result.score}%</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Correct</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{result.correct}/{result.total}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Streak</div>
            <div className="mt-1 text-2xl font-bold text-orange-500">+1 day</div>
          </div>
        </div>

        <Btn onClick={onDone} className="mt-8 w-full">Back to dashboard</Btn>
      </motion.div>
    </div>
  );
}

/* -------------------------------- Paywall ------------------------------- */

function PaywallModal({ open, onClose, onUpgrade }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold">Unlock unlimited full tests</h2>
              <p className="mt-1 text-sm text-indigo-100">You’ve used your free full-length test. Upgrade to Pro to keep simulating exam day.</p>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">$14.99</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {[
                  'Unlimited full-length practice tests',
                  'Adaptive drills that target your weakest units',
                  'AI-powered explanations for every question',
                  'Detailed score analytics & pacing reports',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Btn onClick={onUpgrade} className="w-full mt-6">
                <Crown className="h-4 w-4" /> Upgrade to Pro
              </Btn>
              <button onClick={onClose} className="mt-2 w-full text-sm text-slate-500 hover:text-slate-800 py-2">Maybe later</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Tests screen ---------------------------- */

function TestsScreen({ user, activeSubjects, sessions, onStartTest, onOpenPaywall }) {
  const fullTestsTaken = sessions.filter((s) => s.type === 'full_test').length;
  const canTakeFree = user.subscription === 'pro' || fullTestsTaken < 1;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Full-length practice tests</h1>
          <p className="mt-1 text-slate-500">Simulate the real exam. Timed, mixed-topic, and scored like the College Board rubric.</p>
        </div>
        {user.subscription === 'free' && (
          <Chip className="bg-amber-50 text-amber-800 border border-amber-200">
            <Lock className="h-3.5 w-3.5" /> Free tier · {Math.max(0, 1 - fullTestsTaken)} of 1 free test left
          </Chip>
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {activeSubjects.map((s) => {
          const locked = !canTakeFree;
          return (
            <motion.div
              key={s.id}
              whileHover={{ y: -2 }}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden"
            >
              <div className={cn('absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20', s.color)} />
              <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white relative z-10', s.color)}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-slate-900">{s.name}</div>
              <div className="mt-1 text-xs text-slate-500">25 questions · 60 minutes · Mixed units</div>

              <div className="mt-6 flex items-center gap-3">
                <Btn
                  onClick={() => (locked ? onOpenPaywall() : onStartTest(s))}
                  variant={locked ? 'dark' : 'primary'}
                >
                  {locked ? (
                    <>
                      <Lock className="h-4 w-4" /> Unlock with Pro
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Start test
                    </>
                  )}
                </Btn>
                <span className="text-xs text-slate-500">Last test: —</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-slate-500" />
        </div>
        <div className="mt-3 text-sm font-semibold text-slate-800">More AP subjects coming soon</div>
        <div className="mt-1 text-xs text-slate-500">AP Bio, AP Calc BC, AP US History, AP Lang & more.</div>
      </div>
    </div>
  );
}

/* --------------------------------- App --------------------------------- */

function App() {
  const [user, setUser] = useState(MOCK_USER);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(MOCK_USER.activeSubjects);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [screen, setScreen] = useState('auth'); // 'auth' | 'onboarding' | 'app'
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'drills' | 'tests' | 'drill-run' | 'test-run' | 'result'
  const [activeSubject, setActiveSubject] = useState(null);
  const [runQuestions, setRunQuestions] = useState([]);
  const [runMode, setRunMode] = useState('drill');
  const [lastResult, setLastResult] = useState(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const activeSubjects = useMemo(
    () => SUBJECTS.filter((s) => selectedSubjectIds.includes(s.id)),
    [selectedSubjectIds]
  );

  const startDrill = (subject) => {
    const qs = (SAMPLE_QUESTIONS[subject.id] || []).slice(0, 5);
    if (qs.length === 0) return;
    setActiveSubject(subject);
    setRunQuestions(qs);
    setRunMode('drill');
    setView('drill-run');
  };

  const startTest = (subject) => {
    const qs = buildFullTest(subject.id);
    if (qs.length === 0) return;
    setActiveSubject(subject);
    setRunQuestions(qs);
    setRunMode('full_test');
    setView('test-run');
  };

  const finishRun = (result) => {
    const subj = activeSubject;
    const newSession = {
      id: `s_${Date.now()}`,
      subjectId: result.subjectId,
      type: result.type,
      title: result.type === 'full_test'
        ? `${subj?.name} · Full Practice Test`
        : `${subj?.short} · Mixed Drill`,
      score: result.score,
      total: result.total,
      correct: result.correct,
      durationMin: result.type === 'full_test' ? 58 : 9,
      completedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setLastResult({ ...result });
    setView('result');
  };

  /* ------------------------------- Render ------------------------------- */

  if (screen === 'auth') {
    return <AuthScreen onSignIn={() => setScreen('onboarding')} />;
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        selected={selectedSubjectIds}
        setSelected={setSelectedSubjectIds}
        onContinue={() => {
          setUser((u) => ({ ...u, activeSubjects: selectedSubjectIds }));
          setScreen('app');
          setView('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar view={view} setView={(v) => setView(v)} user={user} />

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">ApexPrep</span>
        </div>
        <div className="flex gap-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'drills', icon: BookOpen },
            { id: 'tests', icon: FileText },
          ].map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} className={cn('h-9 w-9 rounded-lg flex items-center justify-center', active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500')}>
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 py-8 lg:py-10 pt-20 lg:pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'dashboard' && (
              <Dashboard
                user={user}
                activeSubjects={activeSubjects}
                sessions={sessions}
                onStartDrill={startDrill}
                onOpenTests={() => setView('tests')}
              />
            )}
            {view === 'drills' && (
              <SubjectPicker
                activeSubjects={activeSubjects}
                title="Practice Drills"
                cta="Pick a subject to run a focused 5-question drill."
                onPick={startDrill}
              />
            )}
            {view === 'tests' && (
              <TestsScreen
                user={user}
                activeSubjects={activeSubjects}
                sessions={sessions}
                onStartTest={startTest}
                onOpenPaywall={() => setPaywallOpen(true)}
              />
            )}
            {(view === 'drill-run' || view === 'test-run') && activeSubject && (
              <QuestionRunner
                subject={activeSubject}
                questions={runQuestions}
                mode={runMode}
                onExit={() => setView(runMode === 'full_test' ? 'tests' : 'dashboard')}
                onFinish={finishRun}
              />
            )}
            {view === 'result' && activeSubject && lastResult && (
              <SessionResult
                subject={activeSubject}
                result={lastResult}
                onDone={() => setView('dashboard')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={() => {
          setUser((u) => ({ ...u, subscription: 'pro' }));
          setPaywallOpen(false);
        }}
      />
    </div>
  );
}

export default App;
