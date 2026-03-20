import { NextResponse } from 'next/server';
import { getUserFromRequest, supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/mailer';
import { decrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    const [profileFetch, resumeFetch] = await Promise.all([
      supabaseAdmin.from('profiles').select('gmail_email, gmail_app_password').eq('id', auth.user.id).maybeSingle(),
      supabaseAdmin.from('resumes').select('file_name, file_content').eq('user_id', auth.user.id).maybeSingle(),
    ]);

    if (!profileFetch.data?.gmail_email || !profileFetch.data?.gmail_app_password) {
      return NextResponse.json({
        error: 'Gmail not configured. Please add your Gmail App Password in Settings.',
      }, { status: 400 });
    }

    const gmailAppPassword = decrypt(profileFetch.data.gmail_app_password);

    await sendEmail({
      gmailUser: profileFetch.data.gmail_email,
      gmailAppPassword,
      to,
      subject,
      body,
      resumeBase64: resumeFetch.data?.file_content || undefined,
      resumeFileName: resumeFetch.data?.file_name || undefined,
    });

    await supabaseAdmin.from('sent_emails').insert({
      user_id: auth.user.id,
      recipient: to,
      subject,
      body,
      status: 'sent',
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('send-email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
