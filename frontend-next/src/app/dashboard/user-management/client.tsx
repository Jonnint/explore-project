'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Edit, Trash2, RefreshCw } from 'lucide-react';
import type { AuthUser } from '@/lib/auth';
import type { User, UserListResponse } from '@/types/user';

interface Props {
  initialData: UserListResponse;
  currentUser: AuthUser;
}

const roleStyles: Record<string, string> = {
  superadmin: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  admin: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  user: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const getTokenUsageColor = (used: number, limit: number | null) => {
  if (!limit) return 'text-gray-600 dark:text-gray-400';
  const percentage = (used / limit) * 100;
  if (percentage >= 90) return 'text-red-600 dark:text-red-400';
  if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-emerald-600 dark:text-emerald-400';
};

const normalizePage = (page: number) => (page > 1 ? `${page}` : undefined);

const roleFilters = [
  { label: 'Semua Role', value: '' },
  { label: 'Superadmin', value: 'superadmin' },
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Agent', value: 'agent' },
];

const statusFilters = [
  { label: 'Semua Status', value: '' },
  { label: 'Verified', value: 'verified' },
  { label: 'Unverified', value: 'unverified' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function UserManagementClient({ initialData, currentUser }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') ?? '';
  const currentRole = searchParams.get('role') ?? '';
  const currentStatus = searchParams.get('status') ?? '';
  const currentPage = Number(searchParams.get('page') ?? initialData.pagination.current_page);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isSuperAdmin = currentUser.role === 'superadmin';
  const isModalOpen = isCreateDialogOpen || Boolean(editingUser);
  const modalMode = editingUser ? 'edit' : 'create';
  const modalTitle = editingUser ? 'Edit User' : 'Buat User Baru';
  const modalDescription = editingUser
    ? 'Perbarui informasi pengguna tanpa meninggalkan halaman.'
    : 'Tambahkan pengguna baru tanpa meninggalkan halaman.';
  const modalSubmitText = isSubmitting ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Simpan User';
  const modalFormKey = editingUser ? `edit-${editingUser.id}` : 'create-user';

  const buildPath = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ''}`;
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchValue = (formData.get('search') as string).trim();
    router.push(buildPath({ search: searchValue || undefined, page: '1' }));
  };

  const handleRoleChange = (value: string) => {
    router.push(buildPath({ role: value || undefined, page: '1' }));
  };

  const handleStatusChange = (value: string) => {
    router.push(buildPath({ status: value || undefined, page: '1' }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildPath({ page: normalizePage(page) }));
  };

  const handleResetToken = async (userId: number) => {
    if (!confirm('Reset token usage untuk user ini?')) return;
    setActionLoading(userId);

    try {
      const response = await fetch(`/api/users/${userId}/reset-token`, { method: 'POST' });
      if (!response.ok) throw new Error('Gagal reset token');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat reset token.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerified = async (userId: number, verify: boolean) => {
    if (!confirm(verify ? 'Tandai user sebagai verified?' : 'Tandai user sebagai unverified?')) return;
    setActionLoading(userId);
    try {
      const url = `/api/users/${userId}/${verify ? 'verify' : 'unverify'}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error('Gagal mengubah status verifikasi');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: number, activate: boolean) => {
    if (!confirm(activate ? 'Aktifkan akun user ini?' : 'Non-aktifkan akun user ini?')) return;
    setActionLoading(userId);
    try {
      const url = `/api/users/${userId}/${activate ? 'activate' : 'deactivate'}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error('Gagal mengubah status akun');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    setActionLoading(userId);

    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus user');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus user.');
    } finally {
      setActionLoading(null);
    }
  };

  const closeModal = () => {
    setIsCreateDialogOpen(false);
    setEditingUser(null);
    setIsSubmitting(false);
    setFormErrors({});
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsCreateDialogOpen(false);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      password: formData.get('password'),
      role: formData.get('role'),
      token_limit: formData.get('token_limit') ? Number(formData.get('token_limit')) : null,
      region: formData.get('region') || null,
      verified: formData.get('verified') === 'true',
      active: formData.get('active') === 'true',
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.errors && typeof result.errors === 'object') {
          setFormErrors(result.errors);
        } else {
          alert(result.message || 'Gagal membuat user baru.');
        }
        setIsSubmitting(false);
        return;
      }

      closeModal();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!editingUser) return;

    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      role: formData.get('role'),
      token_limit: formData.get('token_limit') ? Number(formData.get('token_limit')) : null,
      region: formData.get('region') || null,
      verified: formData.get('verified') === 'true',
      active: formData.get('active') === 'true',
    } as Record<string, any>;

    const password = formData.get('password');
    if (password) payload.password = password;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.errors && typeof result.errors === 'object') {
          setFormErrors(result.errors);
        } else {
          alert(result.message || 'Gagal memperbarui user.');
        }
        setIsSubmitting(false);
        return;
      }

      closeModal();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Kelola Akun</h1>
          <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
            Kelola akun perusahaan secara modern
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
            Total user: <span className="font-semibold text-slate-900 dark:text-white">{initialData.pagination.total}</span>
          </div>
          {isSuperAdmin && (
            <Button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-400"
              onClick={() => {
                setEditingUser(null);
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Buat User Baru
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-xl dark:shadow-slate-950/30">
        <CardHeader className="space-y-4 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">Daftar User</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-[#9CA3AF]">
                Menampilkan {initialData.users.length} akun di halaman ini.
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  id="search"
                  name="search"
                  placeholder="Cari nama, email, telepon"
                  defaultValue={currentSearch}
                  className="pl-10 pr-3 border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  key={currentSearch}
                />
              </div>
              <Button type="submit" variant="outline" className="h-10 border-slate-200 text-slate-900 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:text-white">
                Cari
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {roleFilters.map((filter) => {
                const active = currentRole === filter.value;
                return (
                  <button
                    key={filter.value || 'all'}
                    type="button"
                    onClick={() => handleRoleChange(filter.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-950'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((s) => {
                const active = currentStatus === s.value;
                return (
                  <button
                    key={s.value || 'all-status'}
                    type="button"
                    onClick={() => handleStatusChange(s.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-slate-700 bg-slate-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto px-0 pb-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="text-left py-3 px-4 text-xs font-medium">Username</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Telepon</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Token</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Verified</th>
                <th className="text-left py-3 px-4 text-xs font-medium">Status</th>
                {isSuperAdmin && <th className="text-left py-3 px-4 text-xs font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {initialData.users.map((user) => {
                const tokenPercentage = user.token_limit ? (user.tokens_used / user.token_limit) * 100 : 0;

                return (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-[#111827] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900 dark:text-[#F9FAFB]">{user.name}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-[#F9FAFB]">{user.email}</td>
                    <td className="py-4 px-4 text-slate-700 dark:text-[#F9FAFB]">{user.phone || '-'}</td>
                    <td className="py-4 px-4">
                      <Badge className={`rounded-full px-2 py-1 text-[11px] font-semibold ${roleStyles[user.role] ?? roleStyles.agent}`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-[#9CA3AF]">
                          <span>{user.tokens_used}</span>
                          <span>{user.token_limit ?? '∞'}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-2.5 rounded-full ${
                              tokenPercentage >= 90 ? 'bg-rose-500' : tokenPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                          />
                        </div>
                        {user.token_limit !== null && user.tokens_used >= user.token_limit && (
                          <p className="text-xs font-medium text-rose-500">Token user sudah limit</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'user' ? (
                        user.verified ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            Unverified
                          </span>
                        )
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.active === false ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-md border border-[#E2E0D8] dark:border-[#374151] px-3 text-[#1a1a18] dark:text-[#F9FAFB] hover:bg-[#F8F7F4] dark:hover:bg-[#374151]"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>

                          {user.role === 'user' &&
                            (user.verified ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
                                onClick={() => handleToggleVerified(user.id, false)}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? 'Memproses...' : 'Unverify'}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
                                onClick={() => handleToggleVerified(user.id, true)}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? 'Memproses...' : 'Verify'}
                              </Button>
                            ))}

                          {user.active === false ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 rounded-md"
                              onClick={() => handleToggleActive(user.id, true)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? 'Memproses...' : 'Activate'}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 rounded-md"
                              onClick={() => handleToggleActive(user.id, false)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? 'Memproses...' : 'Deactivate'}
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-md border border-[#E2E0D8] dark:border-[#374151] px-3 text-[#1a1a18] dark:text-[#F9FAFB] hover:bg-[#F8F7F4] dark:hover:bg-[#374151]"
                            onClick={() => handleResetToken(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? 'Reset...' : 'Reset'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-md border border-[#E2E0D8] dark:border-[#374151] px-3 text-rose-400 hover:bg-[#F8F7F4] dark:hover:bg-[#374151]"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentUser.id || actionLoading === user.id}
                          >
                            {actionLoading === user.id ? 'Hapus...' : 'Hapus'}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-slate-800 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Halaman {currentPage} dari {initialData.pagination.last_page}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={initialData.pagination.current_page === 1}
                  className="h-9 rounded-full border border-slate-800 text-slate-200 hover:bg-slate-900"
                  onClick={() => handlePageChange(initialData.pagination.current_page - 1)}
                >
                  ‹ Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={initialData.pagination.current_page === initialData.pagination.last_page}
                  className="h-9 rounded-full border border-slate-800 text-slate-200 hover:bg-slate-900"
                  onClick={() => handlePageChange(initialData.pagination.current_page + 1)}
                >
                  Berikutnya ›
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel key={modalFormKey} className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white p-6 text-left shadow-xl shadow-slate-950/20 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-white">{modalTitle}</Dialog.Title>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{modalDescription}</p>
                    </div>
                    <Button type="button" variant="ghost" className="h-10 w-10 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900" onClick={closeModal}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <form key={modalFormKey} onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="mt-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={editingUser?.name ?? ''}
                        className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                      />
                        {formErrors.name && <p className="text-sm text-rose-400">{formErrors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          defaultValue={editingUser?.email ?? ''}
                          className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        />
                        {formErrors.email && <p className="text-sm text-rose-400">{formErrors.email}</p>}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">No. Telepon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={editingUser?.phone ?? ''}
                          className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password{editingUser ? '' : ' *'}</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          minLength={8}
                          required={!editingUser}
                          className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        />
                        <p className="text-xs text-slate-500">
                          {editingUser ? 'Biarkan kosong jika tidak ingin mengganti password.' : 'Minimal 8 karakter'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <select
                          id="role"
                          name="role"
                          required
                          defaultValue={editingUser?.role ?? 'agent'}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="token_limit">Token Limit</Label>
                        <Input
                          id="token_limit"
                          name="token_limit"
                          type="number"
                          min="0"
                          placeholder="Kosongkan untuk unlimited"
                          defaultValue={editingUser?.token_limit ?? ''}
                          className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        />
                        {editingUser && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>Penggunaan token</span>
                              <span className={`font-semibold ${getTokenUsageColor(editingUser.tokens_used, editingUser.token_limit)}`}>
                                {editingUser.token_limit ? `${editingUser.tokens_used}/${editingUser.token_limit}` : `${editingUser.tokens_used}/∞`}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className={`h-2 rounded-full ${
                                  editingUser.token_limit
                                    ? editingUser.tokens_used / editingUser.token_limit >= 0.9
                                      ? 'bg-rose-500'
                                      : editingUser.tokens_used / editingUser.token_limit >= 0.7
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: editingUser.token_limit
                                    ? `${Math.min((editingUser.tokens_used / editingUser.token_limit) * 100, 100)}%`
                                    : '100%',
                                }}
                              />
                            </div>
                            {editingUser.token_limit !== null && editingUser.tokens_used >= editingUser.token_limit && (
                              <p className="text-xs text-rose-500">Token user sudah limit</p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-500">Kosongkan untuk unlimited token</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="verified">Status Verifikasi *</Label>
                        <select
                          id="verified"
                          name="verified"
                          required
                          defaultValue={editingUser ? (editingUser.verified ? 'true' : 'false') : 'false'}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        >
                          <option value="false">Unverified</option>
                          <option value="true">Verified</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="active">Status Akun *</Label>
                        <select
                          id="active"
                          name="active"
                          required
                          defaultValue={editingUser ? (editingUser.active !== false ? 'true' : 'false') : 'true'}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        name="region"
                        defaultValue={editingUser?.region ?? ''}
                        className="border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/5 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" className="h-10 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" onClick={closeModal}>
                        Batal
                      </Button>
                      <Button type="submit" className="h-10 rounded-full bg-emerald-500 text-white hover:bg-emerald-400" disabled={isSubmitting}>
                        {modalSubmitText}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
