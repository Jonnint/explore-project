import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resBackend = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await resBackend.json();

    if (!resBackend.ok) {
      return NextResponse.json(data, { status: resBackend.status });
    }

    const res = NextResponse.json({ user: data.user });

    // Simpan token di httpOnly cookie
    res.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Registrasi gagal.' },
      { status: 500 }
    );
  }
}
