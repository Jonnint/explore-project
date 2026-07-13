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
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) redirect('/login');

  const currentUser: AuthUser | null = await getUserFromToken(token);
  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
    redirect('/dashboard');
  }

  const page = searchParams.page ?? '1';
  const queryParams: Record<string, string> = { page };
  if (searchParams.search) queryParams.search = searchParams.search;
  if (searchParams.role) queryParams.role = searchParams.role;

  const data = await apiGet<UserListResponse>('/users', queryParams);

  return <UserManagementClient initialData={data} currentUser={currentUser} />;
}
