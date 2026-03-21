'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Wand2, Chrome, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Hard timeout — never stay stuck more than 2 seconds
    const timeout = setTimeout(() => setChecking(false), 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    }).catch(() => {
      clearTimeout(timeout);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard');
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback`,
      },
    });
  };

  if (checking) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-primary">
          Apply<span className="text-secondary-foreground">X</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          AI-Powered job outreach. Send personalized emails directly from LinkedIn.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={handleLogin}>
            <Mail className="mr-2 h-5 w-5" /> Sign in with Google
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/kiet7uke/ApplyX">
              Learn More <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <Card className="bg-muted border-none">
            <CardHeader>
              <Wand2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI Personalized</CardTitle>
              <CardDescription>Emails matched to your resume and the job post.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-muted border-none">
            <CardHeader>
              <Chrome className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription>One-click outreach directly on LinkedIn.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-muted border-none">
            <CardHeader>
              <Mail className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Your Gmail</CardTitle>
              <CardDescription>Sends from your real Gmail. No OAuth audit needed.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
