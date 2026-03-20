import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: emails, error } = await supabaseAdmin
      .from('sent_emails')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ emails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
