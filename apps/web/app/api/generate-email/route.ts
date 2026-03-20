import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { generatePersonalizedEmail } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postText, authorName } = await req.json();

    if (!postText || !authorName) {
      return NextResponse.json({ error: 'postText and authorName are required' }, { status: 400 });
    }

    const [resumeFetch, profileFetch] = await Promise.all([
      supabase.from('resumes').select('resume_text').eq('user_id', auth.user.id).single(),
      supabase.from('profiles').select('portfolio_url, name').eq('id', auth.user.id).single(),
    ]);

    if (!resumeFetch.data) {
      return NextResponse.json(
        { error: 'Resume not found. Please upload your resume first.' },
        { status: 404 }
      );
    }

    const generated = await generatePersonalizedEmail(
      resumeFetch.data.resume_text,
      postText,
      authorName,
      profileFetch.data?.name || auth.user.email || 'User',
      profileFetch.data?.portfolio_url || ''
    );

    return NextResponse.json(generated);
  } catch (error: any) {
    console.error('generate-email error:', error);
    return NextResponse.json({ error: error.message || 'Error generating email' }, { status: 500 });
  }
}
