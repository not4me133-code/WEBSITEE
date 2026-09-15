'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check, Sparkles, Target, Loader2 } from 'lucide-react';
import { apiRequest, notifyAccountChange } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Brand from '@/components/apex/brand';

const AuthScreen = ({ onSignIn, onBack, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    const fields = new FormData(event.currentTarget);
    const payload = { email: fields.get('email'), password: fields.get('password') };
    if (mode === 'signup') payload.name = fields.get('name');
    try {
      const data = await apiRequest(mode === 'signup' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      notifyAccountChange();
      onSignIn(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const googleSignIn = async () => {
    setBusy(true); setError('');
    try {
      const data = await apiRequest('/api/auth/google/start', { method: 'POST' });
      window.location.assign(data.url);
    } catch (e) { setError(e.message); setBusy(false); }
  };
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-forest p-12 text-white lg:flex xl:p-16">
        <Brand light onClick={onBack} />
        <div className="relative z-10 max-w-lg py-16"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-lime"><Sparkles className="h-3.5 w-3.5" />BIG GOALS. SMALL STEPS.</span><h1 className="mt-7 text-6xl font-medium leading-[1.08] tracking-[-3px]">Your next chapter<br />starts with<br /><span className="text-lime">“I’ve got this.”</span></h1><p className="mt-7 max-w-sm text-base leading-7 text-white/65">A clearer path from where you are to where you want to be. Let’s take the first step.</p><div className="mt-10 space-y-4">{['Practice with purpose', 'Understand every answer', 'Build your exam-day confidence'].map(text => <p key={text} className="flex items-center gap-3 text-sm text-white/90"><Check className="h-4 w-4 text-lime" />{text}</p>)}</div></div>
        <div className="relative flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/50"><span>Big goals. Better practice.</span><Target className="h-5 w-5 text-lime" /></div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-48 bottom-10 h-96 w-96 rounded-full border-[50px] border-white/[0.025]" />
      </div>
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <button onClick={onBack} className="inline-flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to home</button>
        <div className="flex flex-1 items-center justify-center py-10"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[370px]">
          <div className="mb-8 lg:hidden"><Brand onClick={onBack} /></div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">YOUR OWN STUDY SPACE</p>
          <h2 className="mt-4 text-4xl font-medium tracking-[-1.5px]">{mode === 'signin' ? 'Good to see you.' : 'Let’s aim higher.'}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mode === 'signin' ? 'Sign in to your account and pick up where you left off.' : 'Your subjects. Your progress. An account that’s all yours.'}</p>
          <Button type="button" disabled={busy} onClick={googleSignIn} variant="outline" className="mt-7 h-12 w-full rounded-full bg-card shadow-none"><span aria-hidden="true" className="text-lg font-bold">G</span>Continue with Google</Button>
          <div className="my-6 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />or use your email<span className="h-px flex-1 bg-border" /></div>
          <form key={mode} className="space-y-4" onSubmit={submit}>
            {mode === 'signup' && <div><label htmlFor="full-name" className="text-xs font-medium">Your name</label><Input id="full-name" name="name" required maxLength={80} autoComplete="name" placeholder="Your full name" className="mt-2 h-11 rounded-lg bg-card px-4" /></div>}
            <div><label htmlFor="email" className="text-xs font-medium">Email address</label><Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@school.edu" className="mt-2 h-11 rounded-lg bg-card px-4" /></div>
            <div><label htmlFor="password" className="text-xs font-medium">Password</label><Input id="password" name="password" type="password" required minLength={mode === 'signup' ? 10 : 1} maxLength={200} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder={mode === 'signup' ? 'At least 10 characters' : 'Enter your password'} className="mt-2 h-11 rounded-lg bg-card px-4" /></div>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs leading-relaxed text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-full shadow-none">{busy ? <><Loader2 className="h-4 w-4 animate-spin" />Please wait…</> : <>{mode === 'signin' ? 'Sign in' : 'Create free account'}<ArrowUpRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">{mode === 'signin' ? 'New around here? ' : 'Already have an account? '}<button disabled={busy} className="font-semibold text-primary hover:underline" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>{mode === 'signin' ? 'Get started free' : 'Log in'}</button></p>
          <p className="mt-7 text-center text-[11px] leading-relaxed text-muted-foreground">Your account and practice history are saved securely.<br />Practice questions and Pro upgrades are still demo content.</p>
        </motion.div></div>
        <p className="text-center text-[10px] text-muted-foreground">A little practice. A little more confidence. Every day.</p>
      </div>
    </div>
  );
};

export default AuthScreen;
