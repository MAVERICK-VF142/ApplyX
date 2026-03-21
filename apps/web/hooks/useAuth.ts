'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string>(''); // always fresh token

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/');
        return;
      }
      tokenRef.current = session.access_token;
      setUser(session.user);
      setToken(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
        return;
      }
      tokenRef.current = session.access_token;
      setUser(session.user);
      setToken(session.access_token);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Always uses latest token via ref — never stale
  const authFetch = useCallback((input: string, init: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenRef.current}`,
    };
    // Only add Content-Type for non-FormData bodies
    if (init.body && !(init.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(input, {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return { user, token, loading, authFetch, signOut };
}
