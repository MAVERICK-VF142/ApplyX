# 🚀 ApplyX

**Apply to jobs with personalized outreach in 1 click — powered by Llama 3 & Groq.**

ApplyX is an open-source tool designed to make job hunting faster and more personal. No more generic "I'm interested" messages. Generate high-quality, tailored outreach based on the LinkedIn post and your resume, directly in your browser.

## 🔥 Key Features

- **1-Click Generation**: Tailors messages instantly to the LinkedIn post context using **Groq (Llama 3.1)**.
- **Resume-Aware & Attached**: Uses your actual background to find the best angle for outreach and **automatically attaches your PDF resume** to the email.
- **One-Click Send**: Send outreach emails directly via the **Gmail API** without leaving the page.
- **Dynamic Personalization**: Configure your Portfolio/Personal Website link and Full Name in the dashboard to automatically brand every email.
- **Self-Hosted & Private**: Your data is stored in **your own Supabase instance**, ensuring total privacy and control.

## ⚡ Quick Start (Self-Hosted)

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/kiet7uke/ApplyX.git
   cd ApplyX
   ```
2. **Setup Extension**:
   - `cd apps/extension && npm install && npm run dev`.
   - Load the unpacked folder `apps/extension/build/chrome-mv3-dev` in `chrome://extensions`.
3. **Setup Web & Backend**:
   - `cd apps/web && npm install && npm run dev`.
   - Setup your `.env.local` (see details below).
4. **Connect**:
   - Log in to the Web Dashboard at `localhost:3000`.
   - Upload your Resume and Personal Website in the **Manage Profile** section.
   - Copy your **Extension Key** from the Dashboard settings.
   - Paste the key into the LinkedIn Sidebar settings. ✅ Ready!

## ⚙️ Project Structure

- `apps/extension`: The Chrome extension (Plasmo + React).
- `apps/web`: The Next.js dashboard & backend (Supabase + NextAuth + Gmail API).
- `packages/`: Shared logic and components.

## 🛠️ Infrastructure Setup

### 1. Supabase (Database)
1. Create a project at [Supabase](https://supabase.com).
2. Run the SQL schema from `README.md` (lines 45-79) in the **SQL Editor** to create the tables.
3. Note your `Project URL` and `anon public` key.

### 2. Google OAuth & Gmail API
1. Enable the **Gmail API** in [Google Cloud Console](https://console.cloud.google.com/).
2. Create **OAuth 2.0 Credentials** (Web Application).
3. Set Authorized Redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Required Scopes: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/gmail.send`.

### 3. Groq (AI Engine)
1. Get your free, ultra-fast API key at [console.groq.com](https://console.groq.com/).
2. This ensures your outreach is generated in milliseconds for free.

### 4. Environment Variables
Create a `.env.local` in `apps/web`:
```bash
GROQ_API_KEY=gsk_...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## 🌍 Open Source & Community

If this tool helps you land a job, consider giving us a star! ⭐

---
*"I built this because job hunting is exhausting. Let's make it smarter together."*

Built by [kiet7uke](https://github.com/kiet7uke)
