import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await client.auth.getUser();

  const isProtectedAdminRoute =
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login');

  if (isProtectedAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const role = (user.app_metadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (
    request.nextUrl.pathname === '/admin/login' &&
    (user?.app_metadata as { role?: string } | undefined)?.role === 'admin'
  ) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};
