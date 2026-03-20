import { NextResponse } from 'next/server';
import { getUserFromRequest, supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('resumes')
      .select('file_name')
      .eq('user_id', auth.user.id)
      .single();

    return NextResponse.json({ exists: !!data, fileName: data?.file_name });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
