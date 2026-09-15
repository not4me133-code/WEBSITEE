'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/apex/brand';

const App = () => {
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const sessionId = fragment.get('session_id');
    const state = query.get('state');
    window.history.replaceState(null, '', window.location.pathname);
    if (!sessionId || !state) { setError('Google sign-in was cancelled or the link expired. Please start again.'); return; }
    (async () => {
      try {
        const response = await fetch('/api/auth/google/callback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ session_id: sessionId, state }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not complete Google sign-in.');
        window.location.replace('/');
      } catch (e) { setError(e.message || 'Unable to sign in. Please try again.'); }
    })();
  }, []);
  return <main className="flex min-h-screen items-center justify-center bg-background px-6"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"><Brand onClick={() => window.location.assign('/')} /><h1 className="mt-8 text-2xl font-medium tracking-tight">{error ? 'Let’s try that again.' : 'Welcome to your study space.'}</h1>{error ? <><p role="alert" className="mt-4 text-sm leading-relaxed text-destructive">{error}</p><Button className="mt-6 rounded-full" onClick={() => window.location.assign('/?auth=signin')}><ArrowLeft className="h-4 w-4" />Back to sign in</Button></> : <p role="status" className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Securely signing you in…</p>}</div></main>;
};

export default App;
