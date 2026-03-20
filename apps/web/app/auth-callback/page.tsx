'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase implicit flow puts tokens in the URL hash
    // detectSessionInUrl: true handles this automatically
    // We just need to wait for the session to be set
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        if (window.opener) {
          window.opener.postMessage({ type: 'APPLYX_TOKEN', token: session.access_token }, '*');
          setTimeout(() => window.close(), 1000);
        } else {
          router.replace('/dashboard');
        }
      }
    });

    // Fallback — if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
