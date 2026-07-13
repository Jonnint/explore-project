'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import type { User } from '@/types/user';

interface Props {
  user: User;
}

export default function EditUserClient({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      role: formData.get('role'),
      token_limit: formData.get('token_limit') ? parseInt(formData.get('token_limit') as string) : null,
      region: formData.get('region') || null,
    };

    const password = formData.get('password');
    if (password) {
      Object.assign(data, { password });
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert(result.message || 'Gagal update user');
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard/user-management');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  const tokenPercentage = user.token_limit
    ? (user.tokens_used / user.token_limit) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/user-management">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Edit User</h1>
          <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
            Edit informasi user {user.name}
          </p>
        </div>
      </div>

      {user.token_limit && (
        <Card className="border-[#E2E0D8] dark:border-[#374151] max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
              Token Usage
            </CardTitle>
            <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
              Pemakaian token saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888780] dark:text-[#9CA3AF]">Used</span>
                <span className="text-lg font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                  {user.tokens_used} / {user.token_limit}
                </span>
              </div>
              <div className="w-full bg-[#F8F7F4] dark:bg-[#374151] rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    tokenPercentage >= 90
                      ? 'bg-red-500'
                      : tokenPercentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                {tokenPercentage.toFixed(1)}% digunakan
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#E2E0D8] dark:border-[#374151] max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
            Informasi User
          </CardTitle>
          <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
            Update informasi user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={user.name}
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={user.email}
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone || ''}
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                Minimal 8 karakter. Kosongkan jika tidak ingin mengubah password.
              </p>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                name="role"
                required
                defaultValue={user.role}
                className="w-full px-3 py-2 border rounded-md border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827] text-[#1a1a18] dark:text-[#F9FAFB]"
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="token_limit">Token Limit</Label>
              <Input
                id="token_limit"
                name="token_limit"
                type="number"
                min="0"
                defaultValue={user.token_limit || ''}
                placeholder="Kosongkan untuk unlimited"
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                Kosongkan untuk unlimited token
              </p>
              {errors.token_limit && <p className="text-sm text-red-600">{errors.token_limit}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
                defaultValue={user.region || ''}
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              {errors.region && <p className="text-sm text-red-600">{errors.region}</p>}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669]"
              >
                {loading ? 'Menyimpan...' : 'Update User'}
              </Button>
              <Link href="/dashboard/user-management">
                <Button type="button" variant="outline" className="border-[#E2E0D8] dark:border-[#374151]">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
