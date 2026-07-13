import { getUserFromToken } from '@/lib/get-user-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserFormClient from './client';

export default async function CreateUserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');

  const user = await getUserFromToken(token);

  if (!user || user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return <UserFormClient />;
}
