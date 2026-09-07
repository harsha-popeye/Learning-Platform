'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

function GoogleMark() {
  return <svg aria-hidden viewBox="0 0 24 24" className="size-5"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.55h5.52c-.11.88-.73 2.2-2.1 3.1l-.02.12 3.06 2.32.21.02c1.93-1.74 2.93-4.3 2.93-7.34Z" /><path fill="#34A853" d="M12 21.93c2.7 0 4.96-.87 6.61-2.36l-3.15-2.46c-.84.58-1.96.98-3.46.98a5.99 5.99 0 0 1-5.68-4.05l-.12.01-3.18 2.41-.04.11A9.97 9.97 0 0 0 12 21.93Z" /><path fill="#FBBC05" d="M6.32 14.04A5.84 5.84 0 0 1 6 12c0-.7.12-1.38.31-2.04l-.01-.14-3.22-2.45-.1.05A9.7 9.7 0 0 0 2 12c0 1.65.4 3.22.98 4.58l3.36-2.54Z" /><path fill="#EA4335" d="M12 5.91c1.89 0 3.17.8 3.9 1.47l2.85-2.72C16.95 3.01 14.7 2 12 2a9.97 9.97 0 0 0-9.02 5.42l3.33 2.54A6 6 0 0 1 12 5.9Z" /></svg>;
}

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setIsLoading(true);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Google sign-in is not configured yet. Add your Supabase project URL and anon key to .env.local, then restart the dev server.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) setError(authError.message);
    } catch {
      setError('Google sign-in is not configured yet. Add your Supabase project URL and anon key to .env.local, then restart the dev server.');
    } finally {
      setIsLoading(false);
    }
  }

  return <div className="space-y-3"><button type="button" onClick={signInWithGoogle} disabled={isLoading} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"><GoogleMark />{isLoading ? 'Redirecting to Google…' : 'Continue with Google'}</button>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}</div>;
}
