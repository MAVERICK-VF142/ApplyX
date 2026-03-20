"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, User, Link2, RefreshCcw } from "lucide-react";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resumeData, setResumeData] = useState<{ exists: boolean; fileName: string | null }>({ exists: false, fileName: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            const [profileRes, resumeRes] = await Promise.all([
                fetch("/api/user/profile"),
                fetch("/api/resume/status")
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                if (data.name) setFullName(data.name);
                if (data.portfolioUrl) setPortfolioUrl(data.portfolioUrl);
            }

            if (resumeRes.ok) {
                const data = await resumeRes.json();
                setResumeData(data);
            }
        } catch (e) {
            console.error("Fetch data error", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateProfile = async () => {
    setSavingProfile(true);
    const formData = new FormData();
    formData.append("portfolioUrl", portfolioUrl);
    formData.append("fullName", fullName);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Profile details updated!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (e) {
      toast.error("An error occurred during update");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadResume = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Resume uploaded successfully!");
        setResumeData({ exists: true, fileName: data.fileName });
        setFile(null);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to upload resume");
      }
    } catch (e) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-vh-50 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Manage Profile</h1>
        <p className="text-lg text-slate-500 font-medium">
          Personalize your identity and context for the AI engine. 
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Personal Info Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Professional Identity</CardTitle>
                <CardDescription className="font-bold">Used for email signatures and personalization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-black text-slate-500 uppercase tracking-widest">Full Name</Label>
                    <div className="relative">
                        <Input 
                            id="full-name" 
                            placeholder="e.g. Sahil Sharma" 
                            className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portfolio-url" className="text-sm font-black text-slate-500 uppercase tracking-widest">Portfolio URL</Label>
                    <div className="relative">
                        <Input 
                            id="portfolio-url" 
                            placeholder="https://your-portfolio.com" 
                            className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                        />
                        <Link2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                </div>
            </div>

            <Button 
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              disabled={savingProfile} 
              onClick={updateProfile}
            >
              {savingProfile ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Update Profile Details"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resume Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Resume Document</CardTitle>
                  <CardDescription className="font-bold">Provide context for the AI to understand your experience</CardDescription>
                </div>
              </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {resumeData.exists && !file ? (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 group">
                    <div className="p-4 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-2xl">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-black text-green-900 dark:text-green-400 text-lg">Resume is Active</h3>
                        <p className="text-green-700 dark:text-green-500 font-bold opacity-80">
                            Currently using: <span className="underline">{resumeData.fileName}</span>
                        </p>
                    </div>
                    <Label 
                        htmlFor="resume-upload" 
                        className="cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-xl shadow-sm font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <RefreshCcw size={18} /> Replace PDF
                    </Label>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl group hover:border-blue-400 transition-all">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <Label htmlFor="resume-upload" className="mb-2 cursor-pointer text-slate-900 dark:text-white text-xl font-black hover:underline tracking-tight">
                        {file ? file.name : "Click to select Resume PDF"}
                    </Label>
                    <p className="text-slate-400 font-bold text-sm">Our AI engine works best with clean PDF files.</p>
                    
                    {file && (
                        <div className="mt-6 flex flex-col w-full gap-3 animate-in fade-in zoom-in duration-300">
                             <Button 
                                className="w-full h-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 font-black shadow-lg shadow-slate-500/10"
                                disabled={uploading} 
                                onClick={uploadResume}
                            >
                                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Confirm Upload"}
                            </Button>
                            <Button variant="ghost" onClick={() => setFile(null)} className="font-bold text-slate-400 hover:text-red-500 h-8">
                                <XCircle size={16} className="mr-2" /> Cancel
                            </Button>
                        </div>
                    )}
                </div>
            )}
            
            <Input 
                id="resume-upload" 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-none bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl">
        <CardContent className="p-8">
            <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Why PDF?
            </h4>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">
                Our AI parser is optimized for PDF documents. It preserves the structure of your professional experience, education, and skills. This directly impacts the accuracy and quality of your personalized outreach emails.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
