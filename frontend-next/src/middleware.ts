import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return res.status === 200;
  } catch {
    // Network error — anggap valid biar gak kick user pas server down
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith('/dashboard');
  const isLoginPage = pathname === '/login';

  // Gak ada token — redirect ke login kalau protected
  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ada token di protected route — validasi ke Laravel
  if (isProtected && token) {
    const valid = await isTokenValid(token);
    if (!valid) {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('auth_token');
      return res;
    }
  }

  // Udah login & buka halaman login — redirect ke dashboard
  if (isLoginPage && token) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data.user?.role === 'user') {
          return NextResponse.redirect(new URL('/dashboard/user', req.url));
        }
      }
    } catch {
      // ignore
    }
    return NextResponse.redirect(new URL('/dashboard/link-clicks', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};