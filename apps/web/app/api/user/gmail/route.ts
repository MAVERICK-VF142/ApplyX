import { NextResponse } from 'next/server';
import { getUserFromRequest, supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gmailEmail, gmailAppPassword } = await req.json();
    if (!gmailEmail || !gmailAppPassword) {
      return NextResponse.json({ error: 'gmailEmail and gmailAppPassword are required' }, { status: 400 });
    }

    // Verify the credentials work before saving
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailEmail, pass: gmailAppPassword },
    });
    await transporter.verify();

    const encryptedPassword = encrypt(gmailAppPassword);

    const { error } = await supabase
      .from('profiles')
      .update({ gmail_email: gmailEmail, gmail_app_password: encryptedPassword })
      .eq('id', auth.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Gmail connected successfully' });
  } catch (error: any) {
    const msg = error.message || 'Failed to connect Gmail';
    const friendly =
      msg.includes('Invalid login') || msg.includes('Username and Password')
        ? 'Invalid credentials. Make sure you used a Gmail App Password, not your regular password.'
        : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
}
