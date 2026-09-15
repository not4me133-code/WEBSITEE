'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  LogOut,
  Loader2,
  Crown,
  BarChart3,
} from 'lucide-react';
import LandingPage from '@/components/apex/landing-page';
import AuthScreen from '@/components/apex/auth-screen';
import Brand from '@/components/apex/brand';
import { Button } from '@/components/ui/button';
import { SUBJECTS, SAMPLE_QUESTIONS, buildFullTest } from '@/lib/mockData';
import { apiRequest, notifyAccountChange } from '@/lib/api-client';

/* --------------------------- Small UI helpers --------------------------- */

const cn = (...cls) => cls.filter(Boolean).join(' ');

function ProgressRing({ value = 0, size = 72, stroke = 8, colorClass = 'text-brand-500' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="text-ink-200" stroke="currentColor" fill="transparent" />
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
      <span className="absolute text-sm font-semibold text-ink-800">{value}%</span>
    </div>
  );
}

function Chip({ children, className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600', className)}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const base = 'h-auto min-h-10 rounded-full px-5 py-2.5 text-sm font-medium transition-all shadow-none disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-card text-foreground hover:bg-secondary',
    ghost: 'bg-transparent text-muted-foreground hover:bg-muted',
    danger: 'bg-destructive text-white hover:bg-destructive/90',
    dark: 'bg-forest text-white hover:bg-forest/90',
  };
  return (
    <Button type={type} onClick={onClick} disabled={disabled} className={cn(base, styles[variant], className)}>
      {children}
    </Button>
  );
}

/* --------------------------- Onboarding screen -------------------------- */

function Onboarding({ selected, setSelected, onContinue, busy = false, error = '', onSignOut }) {
  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <div className="text-center">
          <div className="mb-10"><Brand onClick={() => window.scrollTo(0, 0)} /></div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-medium tracking-[-1.8px] text-foreground">What are you aiming for?</h1>
          <p className="mt-4 text-sm text-muted-foreground">Pick your subjects. Let’s make a little progress, together.</p>
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
                  active ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-ink-200 hover:border-ink-300'
                )}
              >
                <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold text-ink-900">{s.name}</div>
                <div className="mt-1 text-xs text-ink-500">{s.units} units · {s.totalQuestions} practice questions</div>
                {active && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-ink-500">{selected.length} selected</div>
          <Btn onClick={onContinue} disabled={selected.length === 0 || busy}>
            {busy ? 'Saving…' : 'Continue to dashboard'} <ChevronRight className="h-4 w-4" />
          </Btn>
        </div>
        <button disabled={busy} onClick={onSignOut} className="mt-6 text-xs text-muted-foreground hover:text-primary">Not your account? Sign out</button>
      </motion.div>
    </div>
  );
}

/* -------------------------------- Sidebar ------------------------------- */

function Sidebar({ view, setView, user, onHome, onOpenPaywall, onSignOut, busy }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drills', label: 'Practice Drills', icon: BookOpen },
    { id: 'tests', label: 'Full Tests', icon: FileText },
  ];
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-5 py-8 lg:flex">
      <div className="px-2"><Brand onClick={onHome} /></div>
      <p className="mb-4 mt-12 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your study space</p>
      <nav aria-label="Study navigation" className="space-y-2">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = view === n.id || (n.id === 'drills' && view.startsWith('drill')) || (n.id === 'tests' && view.startsWith('test'));
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-ink-400')} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        {user.subscription === 'free' ? (
          <div className="rounded-2xl bg-forest p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-lime" /> A little extra ambition.
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/65">Explore unlimited simulated tests with the Pro demo.</p>
            <Btn onClick={onOpenPaywall} variant="outline" className="mt-4 w-full !border-transparent !bg-lime !text-forest hover:!bg-lime/90">Explore Pro</Btn>
          </div>
        ) : (
          <div className="rounded-2xl bg-ink-900 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold"><Crown className="h-4 w-4 text-amber-400" /> Pro member</div>
            <p className="mt-1 text-xs text-ink-300">All features unlocked. Keep the streak going!</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-lavender flex items-center justify-center text-forest text-sm font-semibold">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="max-w-[155px] truncate text-sm font-semibold" title={user.name}>{user.name}</div>
            <div className="max-w-[155px] truncate text-[11px] text-muted-foreground" title={user.email}>{user.email}</div>
            <div className="text-xs text-ink-500 capitalize">{user.subscription === 'pro' ? 'Demo Pro' : 'Free account'}</div>
          </div>
        </div>
        <button disabled={busy} onClick={onSignOut} className="mt-5 flex items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground hover:text-primary"><LogOut className="h-4 w-4" />Sign out</button>
      </div>
    </aside>
  );
}

/* ------------------------------- Dashboard ------------------------------ */

function Dashboard({ user, activeSubjects, sessions, onStartDrill, onOpenTests, onManage }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-5"><span className="text-xs text-muted-foreground">My workspace <span className="mx-2 text-ink-300">/</span> <span className="font-medium text-foreground">Overview</span></span><Chip className="bg-secondary text-primary">YOUR PRIVATE WORKSPACE</Chip></div>
      <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-2xl bg-secondary px-7 py-8 sm:px-9 sm:py-10">
        <div className="relative">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">A LITTLE PROGRESS, EVERY DAY</div>
          <h1 className="mt-3 text-3xl font-medium tracking-[-1.2px] text-foreground sm:text-4xl">You’ve got this, {user.name.split(' ')[0]}.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Big goals start with your next small step. Ready?</p>
        </div>
        <Btn onClick={() => onStartDrill(activeSubjects[0])}>
          <Zap className="h-4 w-4" /> Start a quick drill
        </Btn>
      </div>

      {/* Top metric banner */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 uppercase tracking-wide">
            <Flame className="h-4 w-4 text-orange-500" /> Study Streak
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-ink-900">{user.streakDays}</span>
            <span className="text-sm text-ink-500">days in a row</span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={cn('h-6 flex-1 rounded', i < user.streakDays ? 'bg-orange-500' : 'bg-ink-100')} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 uppercase tracking-wide">
            <Target className="h-4 w-4 text-brand-600" /> Global Readiness
          </div>
          <div className="mt-2 flex items-center gap-4">
            <ProgressRing value={user.globalReadiness} colorClass="text-brand-600" />
            <div>
              <div className="text-sm font-semibold text-ink-900">{sessions.length ? 'Your practice accuracy' : 'Your fresh start'}</div>
              <div className="text-xs text-ink-500">{sessions.length ? 'Based on your saved answers' : 'Complete a drill to see progress'}</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 uppercase tracking-wide">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> This Week
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-ink-900">{sessions.length}</span>
            <span className="text-sm text-ink-500">sessions completed</span>
          </div>
          <div className="mt-3 text-xs text-primary font-medium">{sessions.length ? 'Every session is saved to your account.' : 'Your first small win starts today.'}</div>
        </motion.div>
      </div>

      {/* Subject cards */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Your subjects</h2>
        <button onClick={onManage} className="text-sm font-semibold text-brand-600 hover:underline">Manage subjects</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {activeSubjects.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-ink-200 bg-white p-5 cursor-pointer group"
            onClick={() => onStartDrill(s)}
          >
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 font-semibold text-ink-900 leading-tight">{s.name}</div>
            <div className="mt-1 text-xs text-ink-500">{s.units} units · {s.totalQuestions} Qs</div>

            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={s.readiness} size={56} stroke={6} colorClass={s.ring} />
              <div className="flex-1">
                <div className="text-xs text-ink-500">Course progress</div>
                <div className="mt-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div className={cn('h-full', s.accent)} style={{ width: `${s.progress}%` }} />
                </div>
                <div className="mt-1 text-xs font-semibold text-ink-700">{s.progress}% complete</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <Chip>{s.lastScore === null ? 'No attempts yet' : `Last score: ${s.lastScore}%`}</Chip>
              <span className="font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                Drill <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Recent activity</h2>
            <span className="text-xs text-muted-foreground">Your saved sessions</span>
          </div>
          <div className="mt-4 divide-y divide-ink-100">
            {sessions.length === 0 && <div className="py-10 text-center"><BookOpen className="mx-auto h-7 w-7 text-primary/50" /><p className="mt-3 text-sm font-medium">A fresh page, just for you.</p><p className="mt-2 text-xs text-muted-foreground">Complete your first drill and your progress will appear here.</p></div>}
            {sessions.map((s) => {
              const subj = SUBJECTS.find((x) => x.id === s.subjectId);
              const good = s.score >= 75;
              return (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', subj?.color)}>
                    {s.type === 'full_test' ? <FileText className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{s.title}</div>
                    <div className="text-xs text-ink-500">{subj?.name} · {s.correct}/{s.total} correct · {s.durationMin} min</div>
                  </div>
                  <div className={cn('text-lg font-semibold', good ? 'text-emerald-600' : 'text-amber-600')}>{s.score}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink-900">Recommended next</h2>
          <p className="mt-1 text-xs text-ink-500">Based on your weakest units this week.</p>
          <div className="mt-4 space-y-3">
            {activeSubjects.slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => onStartDrill(s)} className="w-full text-left rounded-xl border border-ink-200 p-3 hover:border-brand-300 hover:bg-brand-50/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', s.accent)} />
                  <span className="text-sm font-semibold text-ink-900">{s.short} · Weakest unit</span>
                </div>
                <div className="mt-1 text-xs text-ink-500">10-question focused drill · ~8 min</div>
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
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink-900">{title}</h1>
      <p className="mt-1 text-ink-500">{cta}</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {activeSubjects.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -2 }}
            onClick={() => onPick(s)}
            className="text-left rounded-2xl border border-ink-200 bg-white p-5 hover:border-brand-300 transition-colors"
          >
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 font-semibold text-ink-900">{s.name}</div>
            <div className="mt-1 text-xs text-ink-500">{s.units} units · Readiness {s.readiness}%</div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              Start <ChevronRight className="h-4 w-4" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function QuestionRunner({ subject, questions, mode, onExit, onFinish, busy = false }) {
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
      // The server grades answers and saves the result to the authenticated account.
      onFinish(answers);
    }
  };

  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Exit {mode === 'full_test' ? 'test' : 'drill'}
      </button>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">{subject.short} · {q.unit}</div>
          <h1 className="mt-1 text-xl font-semibold text-ink-900">Question {i + 1} of {questions.length}</h1>
        </div>
        <Chip><Clock className="h-3.5 w-3.5" /> {mode === 'full_test' ? '60 min' : 'Untimed'}</Chip>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <motion.div
          className="h-full bg-brand-600"
          initial={{ width: 0 }}
          animate={{ width: `${((i + (chosen ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-ink-200 bg-white p-6">
        <p className="text-lg font-semibold text-ink-900 leading-relaxed">{q.question_text}</p>

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
              idle: 'border-ink-200 hover:border-brand-300 hover:bg-brand-50/40',
              picked: 'border-brand-500 bg-brand-50 text-brand-900',
              correct: 'border-emerald-500 bg-emerald-50 text-emerald-900',
              wrong: 'border-rose-500 bg-rose-50 text-rose-900',
              muted: 'border-ink-200 opacity-60',
            };

            return (
              <button
                key={opt.id}
                onClick={() => choose(opt.id)}
                className={cn('w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-all', stateClasses[state])}
              >
                <span className={cn(
                  'h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0',
                  state === 'correct' ? 'bg-emerald-500 text-white border-emerald-500' :
                  state === 'wrong' ? 'bg-rose-500 text-white border-rose-500' :
                  state === 'picked' ? 'bg-brand-600 text-white border-brand-600' : 'border-ink-300 text-ink-600'
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
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">{q.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-ink-500">Difficulty: <span className="font-semibold text-ink-700 capitalize">{q.difficulty}</span></div>
          <Btn onClick={next} disabled={!chosen || busy}>
            {busy ? 'Saving…' : i === questions.length - 1 ? 'Finish' : 'Next question'} <ChevronRight className="h-4 w-4" />
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-ink-200 bg-white p-8 text-center">
        <div className={cn('mx-auto h-16 w-16 rounded-full flex items-center justify-center', passed ? 'bg-emerald-100' : 'bg-amber-100')}>
          <Trophy className={cn('h-8 w-8', passed ? 'text-emerald-600' : 'text-amber-600')} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-ink-900">{passed ? 'Great work!' : 'Keep pushing!'}</h1>
        <p className="mt-1 text-ink-500">You completed a {result.type === 'full_test' ? 'full-length test' : 'drill'} in {subject.name}.</p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-xs text-ink-500">Score</div>
            <div className="mt-1 text-2xl font-semibold text-brand-600">{result.score}%</div>
          </div>
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-xs text-ink-500">Correct</div>
            <div className="mt-1 text-2xl font-semibold text-ink-900">{result.correct}/{result.total}</div>
          </div>
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-xs text-ink-500">Streak</div>
            <div className="mt-1 text-2xl font-semibold text-orange-500">+1 day</div>
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
          className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="bg-forest p-6 text-white">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">Unlock unlimited full tests</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Keep your practice going with unlimited simulated tests in the Pro demo.</p>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink-900">$14.99</span>
                <span className="text-sm text-ink-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {[
                  'Unlimited simulated practice tests',
                  'Subject-focused practice drills',
                  'Clear, prewritten answer explanations',
                  'Session results in your demo workspace',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-center text-[11px] text-primary">DEMO ONLY · No payment collected. Upgrade resets on refresh.</p>
              <Btn onClick={onUpgrade} className="w-full mt-6">
                <Crown className="h-4 w-4" /> Upgrade to Pro
              </Btn>
              <button onClick={onClose} className="mt-2 w-full text-sm text-ink-500 hover:text-ink-800 py-2">Maybe later</button>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">Full-length practice tests</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Build confidence, one question at a time. Demo tests use repeated sample questions, not official AP exams.</p>
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
              className="relative rounded-2xl border border-ink-200 bg-white p-6 overflow-hidden"
            >
              <div className={cn('absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20', s.color)} />
              <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white relative z-10', s.color)}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-ink-900">{s.name}</div>
              <div className="mt-1 text-xs text-ink-500">25 questions · 60 minutes · Mixed units</div>

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
                <span className="text-xs text-ink-500">Last test: —</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-ink-300 bg-white p-6 text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-ink-100 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-ink-500" />
        </div>
        <div className="mt-3 text-sm font-semibold text-ink-800">More AP subjects coming soon</div>
        <div className="mt-1 text-xs text-ink-500">AP Bio, AP Calc BC, AP US History, AP Lang & more.</div>
      </div>
    </div>
  );
}

/* --------------------------------- App --------------------------------- */

function App() {
  const [user, setUser] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjectStats, setSubjectStats] = useState({});
  const [screen, setScreen] = useState('loading');
  const [authMode, setAuthMode] = useState('signin');
  const [view, setView] = useState('dashboard');
  const [activeSubject, setActiveSubject] = useState(null);
  const [runQuestions, setRunQuestions] = useState([]);
  const [runMode, setRunMode] = useState('drill');
  const [lastResult, setLastResult] = useState(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const accountId = useRef(null);
  const attempt = useRef(null);
  const requestVersion = useRef(0);
  const saving = useRef(false);

  const resetWorkspace = () => {
    accountId.current = null;
    attempt.current = null;
    setUser(null); setSessions([]); setSelectedSubjectIds([]); setSubjectStats({});
    setActiveSubject(null); setRunQuestions([]); setLastResult(null);
    setPaywallOpen(false); setView('dashboard'); setError('');
  };
  const applyWorkspace = (data, navigate = true) => {
    if (!data.user) { resetWorkspace(); setScreen('landing'); return; }
    const changed = accountId.current !== data.user.id;
    if (changed) { setActiveSubject(null); setRunQuestions([]); setLastResult(null); setPaywallOpen(false); attempt.current = null; }
    accountId.current = data.user.id;
    setUser(previous => ({ ...data.user, subscription: !changed && previous?.subscription === 'pro' ? 'pro' : 'free' }));
    setSessions(data.sessions || []); setSubjectStats(data.subjectStats || {});
    setSelectedSubjectIds(data.user.activeSubjects || []);
    if (navigate || changed) { setScreen(data.user.onboardingComplete ? 'app' : 'onboarding'); setView('dashboard'); }
  };
  useEffect(() => {
    let alive = true;
    const refresh = async (initial = false) => {
      const version = ++requestVersion.current;
      try {
        const data = await apiRequest('/api/auth/me');
        if (!alive || version !== requestVersion.current) return;
        applyWorkspace(data, initial);
        if (!data.user && new URLSearchParams(window.location.search).get('auth') === 'signin') { setScreen('auth'); setAuthMode('signin'); window.history.replaceState(null, '', '/'); }
      } catch (e) {
        if (alive) { resetWorkspace(); setScreen('connection-error'); setError(e.message); }
      }
    };
    refresh(true);
    const onFocus = () => refresh(false);
    const expired = () => { ++requestVersion.current; resetWorkspace(); setScreen('auth'); setAuthMode('signin'); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('apex:session-expired', expired);
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('apex-account') : null;
    if (channel) channel.onmessage = () => refresh(true);
    return () => { alive = false; window.removeEventListener('focus', onFocus); window.removeEventListener('apex:session-expired', expired); channel?.close(); };
  }, []);

  const activeSubjects = useMemo(() => SUBJECTS.filter(s => selectedSubjectIds.includes(s.id)).map(s => ({ ...s, readiness: 0, progress: 0, lastScore: null, ...(subjectStats[s.id] || {}) })), [selectedSubjectIds, subjectStats]);

  const beginRun = (subject, type) => {
    if (!subject || !user) return;
    const qs = type === 'full_test' ? buildFullTest(subject.id) : (SAMPLE_QUESTIONS[subject.id] || []).slice(0, 5);
    if (!qs.length) return;
    attempt.current = { id: crypto.randomUUID(), startedAt: Date.now() };
    setError(''); setActiveSubject(subject); setRunQuestions(qs); setRunMode(type);
    setView(type === 'full_test' ? 'test-run' : 'drill-run');
  };
  const startDrill = subject => beginRun(subject, 'drill');
  const startTest = subject => beginRun(subject, 'full_test');

  const finishRun = async answers => {
    if (saving.current || !attempt.current || !activeSubject) return;
    saving.current = true; setBusy(true); setError('');
    const owner = accountId.current;
    try {
      const data = await apiRequest('/api/practice/sessions', { method: 'POST', body: JSON.stringify({ attemptId: attempt.current.id, subjectId: activeSubject.id, type: runMode, answers, durationSec: Math.min(86400, Math.round((Date.now() - attempt.current.startedAt) / 1000)) }) });
      if (accountId.current !== owner) return;
      applyWorkspace(data, false); setLastResult(data.result); setView('result');
    } catch (e) { setError(e.message); } finally { saving.current = false; setBusy(false); }
  };
  const saveSubjects = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { const data = await apiRequest('/api/workspace', { method: 'PATCH', body: JSON.stringify({ activeSubjects: selectedSubjectIds }) }); applyWorkspace(data); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const signOut = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); ++requestVersion.current; resetWorkspace(); setScreen('landing'); notifyAccountChange(); window.scrollTo(0, 0); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const openAuth = (mode = 'signup') => {
    if (user) { setScreen(user.onboardingComplete ? 'app' : 'onboarding'); setView('dashboard'); }
    else { setAuthMode(mode); setScreen('auth'); }
    window.scrollTo(0, 0);
  };

  if (screen === 'loading') return <main className="flex min-h-screen items-center justify-center bg-background"><p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading your study space…</p></main>;
  if (screen === 'connection-error') return <main className="flex min-h-screen items-center justify-center px-6"><div className="max-w-sm text-center"><h1 className="text-xl font-medium">We couldn’t load your account.</h1><p role="alert" className="mt-3 text-sm text-muted-foreground">{error}</p><Btn className="mt-6" onClick={() => window.location.reload()}>Try again</Btn></div></main>;

  if (screen === 'landing') {
    return <LandingPage onGetStarted={() => openAuth('signup')} onSignIn={() => openAuth('signin')} onChooseSubject={(id) => { setSelectedSubjectIds([id]); openAuth('signup'); }} />;
  }

  if (screen === 'auth') {
    return <AuthScreen initialMode={authMode} onSignIn={(data) => { ++requestVersion.current; applyWorkspace(data); setError(''); window.scrollTo(0, 0); }} onBack={() => { setScreen('landing'); window.scrollTo(0, 0); }} />;
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        selected={selectedSubjectIds}
        setSelected={setSelectedSubjectIds}
        busy={busy}
        error={error}
        onSignOut={signOut}
        onContinue={saveSubjects}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <Sidebar view={view} setView={(v) => setView(v)} user={user} onHome={() => { setScreen('landing'); window.scrollTo(0, 0); }} onOpenPaywall={() => setPaywallOpen(true)} onSignOut={signOut} busy={busy} />

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-ink-200 px-4 py-3 flex items-center justify-between">
        <Brand onClick={() => { setScreen('landing'); window.scrollTo(0, 0); }} />
        <div className="flex gap-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'drills', icon: BookOpen },
            { id: 'tests', icon: FileText },
          ].map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button key={n.id} aria-label={n.id === 'dashboard' ? 'Dashboard' : n.id === 'drills' ? 'Practice Drills' : 'Full Tests'} onClick={() => setView(n.id)} className={cn('h-9 w-9 rounded-lg flex items-center justify-center', active ? 'bg-brand-50 text-brand-700' : 'text-ink-500')}>
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          <button aria-label="Sign out" disabled={busy} onClick={signOut} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 sm:px-8 xl:px-12 py-8 lg:py-10 pt-24 lg:pt-10">
        {error && <p role="alert" className="mx-auto mb-6 max-w-6xl rounded-lg bg-rose-50 p-3 text-sm text-destructive">{error}</p>}
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
                onManage={() => { setScreen('onboarding'); setError(''); }}
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
                busy={busy}
                onExit={() => { if (!busy) setView(runMode === 'full_test' ? 'tests' : 'dashboard'); }}
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
