'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle2, XCircle, User, Link2, RefreshCcw } from 'lucide-react';

export default function ResumePage() {
  const { token, loading, authFetch } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resumeData, setResumeData] = useState<{ exists: boolean; fileName: string | null }>({ exists: false, fileName: null });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !token) return;

    Promise.all([
      authFetch('/api/user/profile').then((r) => r.json()),
      authFetch('/api/resume/status').then((r) => r.json()),
    ]).then(([profileData, resumeStatus]) => {
      if (profileData.name) setFullName(profileData.name);
      if (profileData.portfolioUrl) setPortfolioUrl(profileData.portfolioUrl);
      setResumeData(resumeStatus);
    }).catch(console.error)
    .finally(() => setFetching(false));
  }, [token, loading]);

  const updateProfile = async () => {
    setSavingProfile(true);
    const formData = new FormData();
    formData.append('portfolioUrl', portfolioUrl);
    formData.append('fullName', fullName);
    try {
      const res = await authFetch('/api/resume/upload', { method: 'POST', body: formData });
      if (res.ok) toast.success('Profile updated!');
      else toast.error((await res.json()).error || 'Failed to update');
    } catch { toast.error('An error occurred'); }
    finally { setSavingProfile(false); }
  };

  const uploadResume = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await authFetch('/api/resume/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const d = await res.json();
        toast.success('Resume uploaded!');
        setResumeData({ exists: true, fileName: d.fileName });
        setFile(null);
      } else toast.error((await res.json()).error || 'Upload failed');
    } catch { toast.error('An error occurred'); }
    finally { setUploading(false); }
  };

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Manage Profile</h1>
        <p className="text-lg text-muted-foreground">Your identity and resume power every personalized email.</p>
      </div>

      {/* Profile card */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><User size={24} /></div>
            <div>
              <CardTitle>Professional Identity</CardTitle>
              <CardDescription>Used for email signatures and personalization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <Input placeholder="e.g. Sahil Sharma" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Portfolio URL</Label>
              <div className="relative">
                <Input placeholder="https://your-portfolio.com" className="pl-10" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
          <Button className="w-full" disabled={savingProfile} onClick={updateProfile}>
            {savingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Resume card */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><FileText size={24} /></div>
            <div>
              <CardTitle>Resume Document</CardTitle>
              <CardDescription>PDF context for the AI engine</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {resumeData.exists && !file ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><CheckCircle2 size={28} /></div>
              <div className="flex-1">
                <h3 className="font-black text-green-900">Resume Active</h3>
                <p className="text-green-700 text-sm">Using: <span className="underline">{resumeData.fileName}</span></p>
              </div>
              <Label htmlFor="resume-upload" className="cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm font-bold border border-slate-200 flex items-center gap-2 text-sm">
                <RefreshCcw size={16} /> Replace
              </Label>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 transition-all">
              <Upload className="h-8 w-8 text-blue-500 mb-3" />
              <Label htmlFor="resume-upload" className="cursor-pointer text-xl font-black hover:underline mb-1">
                {file ? file.name : 'Click to select PDF'}
              </Label>
              <p className="text-slate-400 text-sm">PDF only — parsed and stored securely</p>
              {file && (
                <div className="mt-6 flex flex-col w-full gap-3">
                  <Button className="w-full" disabled={uploading} onClick={uploadResume}>
                    {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Confirm Upload'}
                  </Button>
                  <Button variant="ghost" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                    <XCircle size={16} className="mr-2" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
          <Input id="resume-upload" type="file" accept="application/pdf" className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </CardContent>
      </Card>
    </div>
  );
}
