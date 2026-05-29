import { NextRequest, NextResponse } from 'next/server';
import { laravelLogin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const data = await laravelLogin(email, password);

    const res = NextResponse.json({ user: data.user });

    // Simpen token di httpOnly cookie — JS client tidak bisa baca ini
    res.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login gagal.';
    return NextResponse.json({ message }, { status: 401 });
  }
}
