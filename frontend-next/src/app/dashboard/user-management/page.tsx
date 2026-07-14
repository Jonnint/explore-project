import { apiGet } from '@/lib/api';
import { getUserFromToken } from '@/lib/get-user-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserManagementClient from './client';
import type { AuthUser } from '@/lib/auth';
import type { UserListResponse } from '@/types/user';

interface SearchParams {
  search?: string;
  role?: string;
  page?: string;
}

export const metadata = {
  title: 'User Management',
};

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');

  const currentUser: AuthUser | null = await getUserFromToken(token);
  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const page = params.page ?? '1';
  const queryParams: Record<string, string> = { page };
  if (params.search) queryParams.search = params.search;
  if (params.role) queryParams.role = params.role;
  if (params.status) queryParams.status = params.status;

  const data = await apiGet<UserListResponse>('/users', queryParams);

  return <UserManagementClient initialData={data} currentUser={currentUser} />;
}
