'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // PKCE flow — exchange the code in the URL for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error || !data.session) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        // If opened by extension, post token back and close
        if (window.opener) {
          window.opener.postMessage(
            { type: 'APPLYX_TOKEN', token: data.session.access_token },
            '*'
          );
          setStatus('done');
          setTimeout(() => window.close(), 1500);
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        setStatus('error');
        setTimeout(() => router.replace('/'), 2000);
      }
    };

    handleCallback();
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
