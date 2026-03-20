import { NextResponse } from 'next/server';
import { getUserFromRequest, supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('profiles')
      .select('name, portfolio_url, gmail_email')
      .eq('id', auth.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      name: data?.name,
      portfolioUrl: data?.portfolio_url,
      gmailEmail: data?.gmail_email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, portfolioUrl } = await req.json();
    const update: any = {};
    if (name) update.name = name;
    if (portfolioUrl !== undefined) update.portfolio_url = portfolioUrl;

    const { error } = await supabase.from('profiles').update(update).eq('id', auth.user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
