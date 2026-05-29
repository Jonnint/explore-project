import { NextRequest, NextResponse } from 'next/server';
import { laravelLogout } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    // Revoke token di Laravel
    await laravelLogout(token).catch(() => {});
  }

  const res = NextResponse.json({ message: 'Logged out.' });
  res.cookies.delete('auth_token');
  return res;
}
