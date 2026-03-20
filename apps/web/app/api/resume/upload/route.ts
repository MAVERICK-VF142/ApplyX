export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getUserFromRequest, supabase } from '@/lib/supabase';
import { parsePdf } from '@/lib/resume-parser';

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const portfolioUrl = formData.get('portfolioUrl') as string || '';
    const fullName = formData.get('fullName') as string || '';

    if (!file && !portfolioUrl && !fullName) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    if (file) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const resume_text = await parsePdf(buffer);
      const base64Content = buffer.toString('base64');

      const { error } = await supabase.from('resumes').upsert(
        {
          user_id: auth.user.id,
          resume_text,
          file_name: file.name,
          file_content: base64Content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
    }

    const profileUpdate: any = {};
    if (portfolioUrl) profileUpdate.portfolio_url = portfolioUrl;
    if (fullName) profileUpdate.name = fullName;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from('profiles').update(profileUpdate).eq('id', auth.user.id);
    }

    return NextResponse.json({
      success: true,
      message: file ? 'Profile & Resume updated' : 'Profile updated',
      fileName: file ? file.name : null,
    });
  } catch (error: any) {
    console.error('resume/upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
