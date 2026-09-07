import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) return NextResponse.redirect(new URL('/login', request.url));

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const email = typeof claims.email === 'string' ? claims.email : '';
    const { data: user } = await supabase.from('users').select('role').eq('email', email).maybeSingle();
    if (user?.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = { matcher: ['/account/:path*', '/admin/:path*', '/dashboard/:path*'] };
