import { NextResponse } from 'next/server';
import { getUserFromRequest, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('name, portfolio_url, gmail_email')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (error) {
      console.error('profile GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      name: data?.name ?? null,
      portfolioUrl: data?.portfolio_url ?? null,
      gmailEmail: data?.gmail_email ?? null,
    });
  } catch (error: any) {
    console.error('profile GET exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, portfolioUrl } = await req.json();
    const update: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) update.name = name;
    if (portfolioUrl !== undefined) update.portfolio_url = portfolioUrl;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(update)
      .eq('id', auth.user.id);

    if (error) {
      console.error('profile POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('profile POST exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
