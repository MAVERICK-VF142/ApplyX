import { NextResponse } from 'next/server';
import { getUserFromRequest, supabaseAdmin } from '@/lib/supabase';
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

    // Verify credentials first
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailEmail, pass: gmailAppPassword },
      });
      await transporter.verify();
    } catch (verifyErr: any) {
      console.error('Gmail verify error:', verifyErr.message);
      return NextResponse.json({
        error: 'Invalid Gmail credentials. Use a 16-character App Password, not your regular password.',
      }, { status: 400 });
    }

    const encryptedPassword = encrypt(gmailAppPassword);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        gmail_email: gmailEmail,
        gmail_app_password: encryptedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.user.id);

    if (error) {
      console.error('gmail save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Gmail connected successfully' });
  } catch (error: any) {
    console.error('gmail route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect Gmail' }, { status: 500 });
  }
}
