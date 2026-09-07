import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=auth_callback', origin));

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error('Supabase OAuth code exchange failed:', error?.message ?? 'No authenticated user was returned.');
    return NextResponse.redirect(new URL('/login?error=auth_callback', origin));
  }

  const { id, email, user_metadata: metadata } = data.user;
  const name = typeof metadata.full_name === 'string' ? metadata.full_name : typeof metadata.name === 'string' ? metadata.name : null;
  const admin = createAdminClient();
  const { data: existingUser, error: lookupError } = await admin.from('users').select('id').eq('email', email ?? '').maybeSingle();
  const profileError = lookupError || (existingUser
    ? (await admin.from('users').update({ name }).eq('id', existingUser.id)).error
    : (await admin.from('users').insert({ id, email, name })).error);
  if (profileError) return NextResponse.redirect(new URL('/login?error=profile_sync', origin));

  return NextResponse.redirect(new URL('/', origin));
}
