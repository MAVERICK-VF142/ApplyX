'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus('error');
        setTimeout(() => router.replace('/'), 2000);
        return;
      }

      // Post the token to any installed ApplyX extension
      if (window.opener) {
        window.opener.postMessage({ type: 'APPLYX_TOKEN', token: session.access_token }, '*');
        setStatus('done');
        setTimeout(() => window.close(), 1500);
      } else {
        // Normal redirect — not opened by extension
        router.replace('/dashboard');
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 text-center px-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </>
      )}
      {status === 'done' && (
        <>
          <CheckCircle2 className="h-10 w-10 text-green-600" />
          <p className="font-bold text-lg">Signed in! Return to LinkedIn.</p>
          <p className="text-sm text-muted-foreground">This tab will close automatically.</p>
        </>
      )}
      {status === 'error' && (
        <p className="text-red-600 font-bold">Sign in failed. Redirecting...</p>
      )}
    </div>
  );
}
