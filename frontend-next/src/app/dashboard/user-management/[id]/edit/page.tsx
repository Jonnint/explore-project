import { apiGet } from '@/lib/api';
import { getUserFromToken } from '@/lib/get-user-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import EditUserClient from './client';
import type { UserResponse } from '@/types/user';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');

  const currentUser = await getUserFromToken(token);

  if (!currentUser || currentUser.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const data = await apiGet<UserResponse>(`/users/${id}`);

  return <EditUserClient user={data.user} />;
}
