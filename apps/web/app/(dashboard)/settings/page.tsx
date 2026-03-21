'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { token, loading, authFetch } = useAuth();

  const [gmailEmail, setGmailEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !token) return;

    authFetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.gmailEmail) {
          setGmailEmail(data.gmailEmail);
          setGmailConnected(true);
        }
      })
      .catch((e) => console.error('profile fetch error:', e))
      .finally(() => setFetching(false));
  }, [token, loading]);

  const handleSaveGmail = async () => {
    if (!gmailEmail || !appPassword) {
      toast.error('Both Gmail address and App Password are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch('/api/user/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmailEmail, gmailAppPassword: appPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Gmail connected successfully!');
      setGmailConnected(true);
      setAppPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect Gmail');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Connect your Gmail to enable 1-click outreach.</p>

      <Card className="border-none bg-muted/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle>Gmail Connection</CardTitle>
          </div>
          <CardDescription>
            Uses Gmail App Password — no Google OAuth verification required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {gmailConnected && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-sm">Gmail Connected</p>
                <p className="text-xs text-muted-foreground">{gmailEmail}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="gmail-email">Gmail Address</Label>
              <Input
                id="gmail-email"
                type="email"
                placeholder="you@gmail.com"
                value={gmailEmail}
                onChange={(e) => setGmailEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="app-password">Gmail App Password</Label>
              <div className="relative">
                <Input
                  id="app-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-lg flex gap-3 text-blue-800 dark:text-blue-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">How to get an App Password</p>
                <ol className="list-decimal list-inside space-y-0.5 opacity-90">
                  <li>Enable 2-Step Verification on your Google account</li>
                  <li>Go to <strong>myaccount.google.com/apppasswords</strong></li>
                  <li>Create a new app password and paste it above</li>
                </ol>
              </div>
            </div>

            <Button onClick={handleSaveGmail} disabled={saving} className="w-full">
              {saving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                : 'Save & Connect Gmail'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
