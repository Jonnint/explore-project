import { apiGet } from '@/lib/api';
import { getUserFromToken } from '@/lib/get-user-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserManagementClient from './client';
import type { UserListResponse } from '@/types/user';

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');

  const user = await getUserFromToken(token);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const search = params.search || '';
  const role = params.role || '';
  const page = params.page || '1';

  const queryParams: Record<string, string> = { page };
  if (search) queryParams.search = search;
  if (role) queryParams.role = role;

  const data = await apiGet<UserListResponse>('/users', queryParams);

  return <UserManagementClient initialData={data} currentUser={user} />;
}
