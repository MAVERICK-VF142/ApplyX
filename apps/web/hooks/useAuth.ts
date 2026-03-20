'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/');
        return;
      }
      setUser(session.user);
      setToken(session.access_token);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
        return;
      }
      setUser(session.user);
      setToken(session.access_token);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const authFetch = useCallback((input: string, init: RequestInit = {}) => {
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        'Authorization': `Bearer ${token}`,
      },
    });
  }, [token]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return { user, token, loading, authFetch, signOut };
}
