import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Loader2, Send, Copy, Check, X, Settings, LogIn, Upload, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Storage } from '@plasmohq/storage';
import { allSidebarStyles as styles } from '../components/styles';
import { Card, Label, Input, TextArea, PrimaryButton } from '../components/UIComponents';

export const config: any = { matches: ['https://www.linkedin.com/*'] };

const storage = new Storage();

// ─── Setup step the user is on ───────────────────────────────────────────────
type SetupStep = 'url' | 'auth' | 'resume' | 'gmail' | 'done';

const LinkedInSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('done');

  // Config state
  const [backendUrl, setBackendUrl] = useState('');
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [resumeExists, setResumeExists] = useState(false);

  // Gmail setup
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [showAppPass, setShowAppPass] = useState(false);
  const [gmailSaving, setGmailSaving] = useState(false);
  const [gmailError, setGmailError] = useState('');

  // Resume upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [authorInput, setAuthorInput] = useState('');
  const [postInput, setPostInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const url = (await storage.get('backendUrl') as string) || '';
      const tok = (await storage.get('supabaseToken') as string) || '';
      setBackendUrl(url);
      setToken(tok);

      if (!url) { setSetupStep('url'); return; }
      if (!tok) { setSetupStep('auth'); return; }

      // Validate token + fetch profile
      try {
        const { data } = await axios.get(`${url}/api/user/profile`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        setUserName(data.name || '');
        setGmailConnected(!!data.gmailEmail);
        if (data.gmailEmail) setGmailEmail(data.gmailEmail);

        // Check resume
        const { data: rData } = await axios.get(`${url}/api/resume/status`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        setResumeExists(rData.exists);

        if (!rData.exists) { setSetupStep('resume'); return; }
        if (!data.gmailEmail) { setSetupStep('gmail'); return; }
        setSetupStep('done');
      } catch {
        // Token expired or invalid — re-auth
        await storage.remove('supabaseToken');
        setToken('');
        setSetupStep('auth');
      }
    })();

    // Watch for inline button trigger
    storage.watch({
      triggerSidebar: (c) => {
        if (c.newValue) {
          const { author, postText, email } = c.newValue;
          setAuthorInput(author || '');
          setPostInput(postText || '');
          setEmailInput(email || '');
          setIsOpen(true);
          setShowReview(true);
          setError('');
          storage.set('triggerSidebar', null);
        }
      },
    });
  }, []);

  // ── Auth: open backend login page ─────────────────────────────────────────
  const handleOpenLogin = () => {
    if (!backendUrl) return;
    chrome.tabs.create({ url: backendUrl });
  };

  // Listen for token posted from the web app after login
  useEffect(() => {
    const handler = async (msg: any) => {
      if (msg.type === 'APPLYX_TOKEN' && msg.token) {
        await storage.set('supabaseToken', msg.token);
        setToken(msg.token);
        // Re-run bootstrap by reloading
        window.location.reload();
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // ── Resume upload ──────────────────────────────────────────────────────────
  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      await axios.post(`${backendUrl}/api/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumeExists(true);
      setResumeFile(null);
      setSetupStep(gmailConnected ? 'done' : 'gmail');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setResumeUploading(false);
    }
  };

  // ── Gmail save ─────────────────────────────────────────────────────────────
  const handleSaveGmail = async () => {
    if (!gmailEmail || !gmailAppPassword) {
      setGmailError('Both fields are required.');
      return;
    }
    setGmailSaving(true);
    setGmailError('');
    try {
      await axios.post(
        `${backendUrl}/api/user/gmail`,
        { gmailEmail, gmailAppPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGmailConnected(true);
      setSetupStep('done');
    } catch (err: any) {
      setGmailError(err.response?.data?.error || 'Failed to connect Gmail');
    } finally {
      setGmailSaving(false);
    }
  };

  // ── Email generation ───────────────────────────────────────────────────────
  const startAIGeneration = async () => {
    if (!postInput || !authorInput) { setError('Please provide all fields.'); return; }
    setLoading(true);
    setError('');
    setShowReview(false);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/generate-email`,
        { postText: postInput, authorName: authorInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailSubject(data.subject || 'Re: Job Inquiry');
      setEmailText(data.body || '');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${emailSubject}\n\n${emailText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!emailInput) { alert('Please enter a recipient email.'); return; }
    setSending(true);
    try {
      await axios.post(
        `${backendUrl}/api/send-email`,
        { to: emailInput, subject: emailSubject, body: emailText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Email sent via ApplyX!');
      setIsOpen(false);
    } catch (err: any) {
      alert('Failed to send: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderSetup = () => {
    if (setupStep === 'url') return (
      <Card>
        <Label>Backend URL</Label>
        <Input
          placeholder="https://your-applyx.vercel.app"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
        />
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
          Deploy the ApplyX web app first, then paste your URL here.
        </p>
        <PrimaryButton style={{ marginTop: 20 }} onClick={async () => {
          const cleaned = backendUrl.replace(/\/$/, '');
          await storage.set('backendUrl', cleaned);
          setBackendUrl(cleaned);
          setSetupStep('auth');
        }}>
          Save URL
        </PrimaryButton>
      </Card>
    );

    if (setupStep === 'auth') return (
      <Card>
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <LogIn size={40} color="#2563eb" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Sign in to ApplyX</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 20 }}>
            Log in with Google on your deployed dashboard, then come back.
          </p>
          <PrimaryButton onClick={handleOpenLogin}>Open ApplyX Dashboard</PrimaryButton>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 12 }}>
            After logging in, this panel updates automatically.
          </p>
        </div>
      </Card>
    );

    if (setupStep === 'resume') return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Upload size={20} color="#2563eb" />
          <span style={{ fontWeight: 700 }}>Upload your Resume</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 16 }}>
          Your PDF resume powers the AI — upload it once and it's stored securely.
        </p>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 12, fontSize: '0.8rem' }}
        />
        {resumeFile && (
          <PrimaryButton onClick={handleResumeUpload} disabled={resumeUploading}>
            {resumeUploading ? 'Uploading...' : `Upload ${resumeFile.name}`}
          </PrimaryButton>
        )}
      </Card>
    );

    if (setupStep === 'gmail') return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Mail size={20} color="#2563eb" />
          <span style={{ fontWeight: 700 }}>Connect Gmail</span>
        </div>
        <Label>Gmail Address</Label>
        <Input
          type="email"
          placeholder="you@gmail.com"
          value={gmailEmail}
          onChange={(e) => setGmailEmail(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <Label>App Password</Label>
        <div style={{ position: 'relative' }}>
          <Input
            type={showAppPass ? 'text' : 'password'}
            placeholder="xxxx xxxx xxxx xxxx"
            value={gmailAppPassword}
            onChange={(e) => setGmailAppPassword(e.target.value)}
            style={{ paddingRight: 36 }}
          />
          <button
            onClick={() => setShowAppPass(!showAppPass)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            {showAppPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: '#eff6ff', borderRadius: 8, fontSize: '0.72rem', color: '#1d4ed8' }}>
          <strong>How to get an App Password:</strong><br />
          1. Enable 2-Step Verification on Google<br />
          2. Go to myaccount.google.com/apppasswords<br />
          3. Create one for "Mail" and paste it above
        </div>
        {gmailError && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 8 }}>{gmailError}</p>}
        <PrimaryButton style={{ marginTop: 16 }} onClick={handleSaveGmail} disabled={gmailSaving}>
          {gmailSaving ? 'Verifying...' : 'Save & Connect Gmail'}
        </PrimaryButton>
      </Card>
    );

    return null;
  };

  const isSetupComplete = setupStep === 'done';

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="floating-toggle">
          <Mail size={28} />
        </button>
      )}

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}>
          <div className="sidebar-container" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <div className="header-content">
                <h3>ApplyX</h3>
                <p>1-Click AI Job Outreach</p>
              </div>
              <button className="close-button" onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>

            <div className="sidebar-content">
              {/* Setup screens */}
              {!isSetupComplete ? renderSetup() :

              /* Review screen */
              showReview ? (
                <Card style={{ background: '#f0f9ff', border: 'none' }}>
                  <Label>Recipient Email</Label>
                  <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="recipient@email.com" />
                  <div style={{ height: 15 }} />
                  <Label>Author Name</Label>
                  <Input value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} />
                  <div style={{ height: 15 }} />
                  <Label>Post Context</Label>
                  <TextArea value={postInput} onChange={(e) => setPostInput(e.target.value)} />
                  <PrimaryButton style={{ marginTop: 20 }} onClick={startAIGeneration}>
                    Generate <Send size={20} />
                  </PrimaryButton>
                </Card>
              ) :

              /* Loading */
              loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Loader2 size={56} color="#2563eb" className="animate-spin" />
                  <h4 style={{ margin: '24px 0 8px', fontSize: '1.4rem' }}>Writing...</h4>
                  <p style={{ color: '#64748b' }}>Crafting your personalized message.</p>
                </div>
              ) :

              /* Error */
              error ? (
                <Card style={{ color: '#b91c1c', textAlign: 'center' }}>
                  <p>{error}</p>
                  <button className="dashboard-link" onClick={() => setShowReview(true)}>Retry</button>
                </Card>
              ) :

              /* Result */
              emailText ? (
                <>
                  <Card>
                    <Label>Sending To</Label>
                    <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ fontWeight: 600 }} />
                  </Card>
                  <Card>
                    <Label>Subject</Label>
                    <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} style={{ fontWeight: 700 }} />
                  </Card>
                  <Card>
                    <Label>Message</Label>
                    <TextArea value={emailText} onChange={(e) => setEmailText(e.target.value)} />
                  </Card>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <PrimaryButton style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }} onClick={handleCopy}>
                      {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} />} Copy
                    </PrimaryButton>
                    <PrimaryButton onClick={handleSend} disabled={sending}>
                      {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} Send
                    </PrimaryButton>
                  </div>
                </>
              ) :

              /* Idle — show a prompt to start */
              (
                <Card style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <Mail size={40} color="#2563eb" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>Ready to go!</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Click the <strong>ApplyX Outreach</strong> button on any LinkedIn post to generate a personalized email.
                  </p>
                </Card>
              )}
            </div>

            <div className="sidebar-footer">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                {isSetupComplete && (
                  <div style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    👤 {userName || 'You'} • ✉️ Gmail
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="footer-text">ApplyX v2.0</span>
                <button onClick={() => setSetupStep('url')} className="dashboard-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Settings size={14} /> Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkedInSidebar;
