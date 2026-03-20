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
      .maybeSingle();

    if (error) {
      console.error('profile fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no profile row yet, return empty defaults instead of erroring
    return NextResponse.json({
      name: data?.name ?? null,
      portfolioUrl: data?.portfolio_url ?? null,
      gmailEmail: data?.gmail_email ?? null,
    });
  } catch (error: any) {
    console.error('profile route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, portfolioUrl } = await req.json();
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (portfolioUrl !== undefined) update.portfolio_url = portfolioUrl;

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', auth.user.id);

    if (error) {
      console.error('profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('profile POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
