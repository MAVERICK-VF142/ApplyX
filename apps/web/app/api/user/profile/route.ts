import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    let email: string | undefined;

    if (apiKey) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('api_key', apiKey)
        .single();
      if (profile) email = profile.email;
    }

    if (!email) {
      const session = await auth();
      email = session?.user?.email || undefined;
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profileDetail, error } = await supabase
      .from('profiles')
      .select('name, portfolio_url')
      .eq('email', email)
      .single();

    if (error) throw error;

    return NextResponse.json({
      name: profileDetail?.name,
      portfolioUrl: profileDetail?.portfolio_url
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
