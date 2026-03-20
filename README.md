<div align="center">

# ApplyX v2

**Stop copy-pasting. Start landing jobs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-8b5cf6.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a78bfa.svg?style=for-the-badge)](http://makeapullrequest.com)
[![Powered by Groq](https://img.shields.io/badge/Powered%20by-Llama%203.1-ec4899.svg?style=for-the-badge)](https://groq.com)

> Apply to jobs with personalized outreach in 1 click — powered by Llama 3 & Groq.

```
📄 See job post → ⚡ 1 click → 💌 Personalized email sent. Done.
```

</div>

---

## What's new in v2

| v1 | v2 |
|---|---|
| NextAuth + Google Cloud Console | Supabase Auth only |
| Gmail API (needs Google verification) | Nodemailer + Gmail App Password |
| Extension Key to identify users | Supabase JWT token |
| `localhost:3000` hardcoded | Dynamic backend URL — fully self-hostable |
| 7 environment variables | 3 environment variables |

---

## How it works

```
LinkedIn post  →  ApplyX Chrome Extension
                        │
                        ▼
              Your Vercel deployment
              (Next.js + Groq AI)
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         Supabase              Gmail SMTP
    (auth, resume, logs)   (sends from YOUR address)
```

---

## Quick Start

### 1. Deploy the web app

```bash
git clone https://github.com/kiet7uke/ApplyX.git
cd ApplyX
```

Deploy to Vercel (or any platform):

```bash
cd apps/web
vercel deploy
```

Set these **3 environment variables** in your Vercel dashboard:

```bash
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ENCRYPTION_KEY=your-exactly-32-character-key!!
```

> Generate ENCRYPTION_KEY: `openssl rand -base64 24 | tr -d '=+/' | cut -c1-32`

---

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, paste and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers → Google** and enable it
4. Add your Google OAuth credentials (Client ID + Secret from Google Cloud Console)
5. Set redirect URL to: `https://your-app.vercel.app/auth-callback`

---

### 3. Load the Chrome Extension

```bash
cd apps/extension
npm install
npm run dev
```

In Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked** → select `apps/extension/build/chrome-mv3-dev`

---

### 4. First-time extension setup (30 seconds)

1. Go to LinkedIn → click the **ApplyX** button (bottom right)
2. Enter your Vercel URL (e.g. `https://your-applyx.vercel.app`)
3. Click **Open ApplyX Dashboard** → sign in with Google
4. Back in the extension: upload your **resume PDF**
5. Add your **Gmail App Password**
   - Enable 2FA at myaccount.google.com
   - Go to myaccount.google.com/apppasswords
   - Create a password for "Mail" → paste it in the extension
6. Done ✅ — click ApplyX on any LinkedIn post

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | From console.groq.com (free) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | From Supabase project settings |
| `ENCRYPTION_KEY` | ✅ | Exactly 32 chars — encrypts Gmail App Password at rest |

---

## Project Structure

```
ApplyX/
├── apps/
│   ├── extension/              # Chrome Extension (Plasmo + React)
│   │   ├── contents/
│   │   │   ├── LinkedInSidebar.tsx   # Main sidebar UI + setup wizard
│   │   │   └── LinkedInSendEmail.tsx # Inline outreach button
│   │   └── background/
│   │       └── index.ts        # Token relay service worker
│   │
│   └── web/                    # Next.js Dashboard + API
│       ├── app/
│       │   ├── api/
│       │   │   ├── generate-email/   # Groq AI generation
│       │   │   ├── send-email/       # Nodemailer sending
│       │   │   ├── resume/           # Upload + status
│       │   │   └── user/             # Profile + Gmail setup
│       │   └── (dashboard)/          # Web UI
│       └── lib/
│           ├── supabase.ts     # Auth client + JWT verification
│           ├── mailer.ts       # Nodemailer (Gmail SMTP)
│           ├── crypto.ts       # AES-256 encryption
│           └── openai.ts       # Groq / Llama email generation
│
├── supabase/
│   └── schema.sql              # Full DB schema + RLS policies
│
└── .env.example                # 3 variables — that's it
```

---

## Contributing

See [Contribution.md](./Contribution.md) for the full guide.

**Open contribution areas:**
- [ ] LinkedIn Easy Apply form auto-fill
- [ ] Application tracking dashboard
- [ ] Support for Wellfound, Greenhouse, Lever
- [ ] Follow-up email scheduling
- [ ] A/B testing email tones
- [ ] Multi-language support

---

Built with 💜 by [kiet7uke](https://github.com/kiet7uke) and contributors.
