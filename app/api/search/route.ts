import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (query.length < 2) return NextResponse.json({ notes: [] });

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to search notes.' }, { status: 401 });

    const escapedQuery = query.replace(/[%_]/g, '\\$&');
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .ilike('title', `%${escapedQuery}%`)
      .order('title')
      .limit(30);
    if (error) return NextResponse.json({ error: 'Unable to search notes right now.' }, { status: 500 });

    return NextResponse.json({ notes: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Unable to search notes right now.' }, { status: 500 });
  }
}
