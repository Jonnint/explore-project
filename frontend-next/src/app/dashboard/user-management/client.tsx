'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import type { User, UserListResponse } from '@/types/user';
import type { AuthUser } from '@/lib/auth';

interface Props {
  initialData: UserListResponse;
  currentUser: AuthUser;
}

export default function UserManagementClient({ initialData, currentUser }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [resetting, setResetting] = useState<number | null>(null);

  const isSuperAdmin = currentUser.role === 'superadmin';
  const isReadOnly = !isSuperAdmin;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.append('search', value);
    router.push(`/dashboard/user-management?${params.toString()}`);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    setDeleting(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus user');
    } finally {
      setDeleting(null);
    }
  };

  const handleResetToken = async (userId: number) => {
    if (!confirm('Reset token usage untuk user ini?')) return;

    setResetting(userId);
    try {
      const res = await fetch(`/api/users/${userId}/reset-token`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset token');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal reset token');
    } finally {
      setResetting(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      superadmin: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
      admin: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      agent: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    };
    return styles[role as keyof typeof styles] || styles.agent;
  };

  const getTokenUsageColor = (used: number, limit: number | null) => {
    if (!limit) return 'text-gray-600 dark:text-gray-400';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Management User</h1>
          <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
            {isReadOnly ? 'View-only mode - Anda tidak bisa melakukan perubahan' : 'Kelola akun user dan token limit'}
          </p>
        </div>
        {isSuperAdmin && (
          <Link href="/dashboard/user-management/create">
            <Button className="gap-2 bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669]">
              <Plus className="w-4 h-4" />
              Buat User Baru
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-[#E2E0D8] dark:border-[#374151]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                Daftar User
              </CardTitle>
              <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                Total {initialData.pagination.total} user
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888780] dark:text-[#9CA3AF]" />
              <Input
                placeholder="Cari user..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-[250px] border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E0D8] dark:border-[#374151]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Token Usage</th>
                  {!isReadOnly && <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {initialData.users.map((user) => {
                  const tokenPercentage = user.token_limit
                    ? (user.tokens_used / user.token_limit) * 100
                    : 0;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#E2E0D8] dark:border-[#374151] hover:bg-[#F8F7F4] dark:hover:bg-[#374151] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{user.name}</p>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#888780] dark:text-[#9CA3AF]">{user.email}</td>
                      <td className="py-4 px-4 text-sm text-[#888780] dark:text-[#9CA3AF]">{user.phone || '-'}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className={`text-xs ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className={`text-sm font-medium ${getTokenUsageColor(user.tokens_used, user.token_limit)}`}>
                            {user.tokens_used} / {user.token_limit || '∞'}
                          </p>
                          {user.token_limit && (
                            <div className="w-full bg-[#F8F7F4] dark:bg-[#374151] rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  tokenPercentage >= 90
                                    ? 'bg-red-500'
                                    : tokenPercentage >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      {!isReadOnly && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/user-management/${user.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {user.token_limit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleResetToken(user.id)}
                                disabled={resetting === user.id}
                              >
                                <RefreshCw className={`w-4 h-4 ${resetting === user.id ? 'animate-spin' : ''}`} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDelete(user.id)}
                              disabled={deleting === user.id || user.id === currentUser.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {initialData.pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E0D8] dark:border-[#374151]">
              <p className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                Page {initialData.pagination.current_page} of {initialData.pagination.last_page}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E2E0D8] dark:border-[#374151]"
                  disabled={initialData.pagination.current_page === 1}
                  onClick={() => router.push(`/dashboard/user-management?page=${initialData.pagination.current_page - 1}`)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E2E0D8] dark:border-[#374151]"
                  disabled={initialData.pagination.current_page === initialData.pagination.last_page}
                  onClick={() => router.push(`/dashboard/user-management?page=${initialData.pagination.current_page + 1}`)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
