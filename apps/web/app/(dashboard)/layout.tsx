'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Settings, LogOut, MailSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/');
      else setUser(session.user);
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume', href: '/resume', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const displayName = user.user_metadata?.full_name || user.email || '';
  const initial = displayName[0]?.toUpperCase();

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <MailSearch className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">ApplyX</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start', pathname === item.href && 'font-semibold')}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t px-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground text-xs">
              {initial}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user.user_metadata?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
