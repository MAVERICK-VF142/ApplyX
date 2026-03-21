'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, XCircle, Send, Mail, ArrowUpRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  created_at: string;
  status: string;
}

export default function DashboardPage() {
  const { user, token, loading, authFetch } = useAuth();

  const [resumeStored, setResumeStored] = useState<boolean | null>(null);
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !token) return;

    Promise.all([
      authFetch('/api/resume/status').then((r) => r.json()),
      authFetch('/api/emails').then((r) => r.json()),
    ]).then(([resumeData, emailsData]) => {
      setResumeStored(resumeData.exists ?? false);
      setEmails(emailsData.emails || []);
    }).catch(console.error)
    .finally(() => setFetching(false));
  }, [token, loading]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Hi {firstName}, tracking your application journey.</p>
        </div>
        <Button className="rounded-full font-bold bg-blue-600 hover:bg-blue-700">
          <BarChart2 className="w-4 h-4 mr-2" /> Analytics (soon)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Resume status */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-500" /> Resume
            </CardTitle>
            <CardDescription>AI context engine status</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching || resumeStored === null ? (
              <div className="h-16 animate-pulse bg-slate-100 rounded-xl" />
            ) : resumeStored ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-green-700 bg-green-50 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-bold">Active & Ready</span>
                </div>
                <Button variant="ghost" className="w-full text-blue-600 font-bold" asChild>
                  <Link href="/resume">Update <ArrowUpRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-amber-700 bg-amber-50 px-4 py-3 rounded-xl">
                  <XCircle className="h-5 w-5" />
                  <span className="font-bold">Setup Required</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/resume">Upload PDF</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emails sent */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-indigo-500" /> Outreach Log
            </CardTitle>
            <CardDescription>Total emails sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-black leading-none">{emails.length}</h2>
              <span className="text-slate-400 font-bold text-lg">Sent</span>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Across {new Set(emails.map((e) => e.recipient)).size} unique leads.
            </p>
          </CardContent>
        </Card>

        {/* Coming soon */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardHeader>
            <CardTitle className="opacity-80 uppercase tracking-widest text-sm font-black">Engagement</CardTitle>
            <CardDescription className="text-white/70">Reply tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-5xl font-black">Beta 🛰️</h2>
            <p className="text-sm text-white/80 mt-3">Smart follow-ups arriving soon.</p>
          </CardContent>
        </Card>
      </div>

      {/* Emails table */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
        <CardHeader className="border-b px-8 py-6">
          <CardTitle className="text-2xl font-black">Recent Outreach</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Recipient</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fetching ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-8 py-8 animate-pulse bg-slate-50/30 h-16" />
                  </tr>
                ))
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Mail size={40} className="text-slate-300" />
                      <p className="text-slate-500 font-black text-lg">No outreach yet.</p>
                      <p className="text-slate-400 text-sm">Click ApplyX on any LinkedIn post to start.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                emails.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-8 py-5 font-bold">{item.recipient}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-300 italic">"{item.subject}"</td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
