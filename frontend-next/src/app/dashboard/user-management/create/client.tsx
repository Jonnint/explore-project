'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function UserFormClient() {
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
      password: formData.get('password'),
      role: formData.get('role'),
      token_limit: formData.get('token_limit') ? parseInt(formData.get('token_limit') as string) : null,
      region: formData.get('region') || null,
      verified: formData.get('verified') === 'true',
      active: formData.get('active') === 'true',
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert(result.message || 'Gagal membuat user');
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
          <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Buat User Baru</h1>
          <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
            Tambahkan user baru ke sistem
          </p>
        </div>
      </div>

      <Card className="border-[#E2E0D8] dark:border-[#374151] max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
            Informasi User
          </CardTitle>
          <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
            Isi form dibawah untuk membuat user baru
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
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">Minimal 8 karakter</p>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-3 py-2 border rounded-md border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827] text-[#1a1a18] dark:text-[#F9FAFB]"
              >
                <option value="user">User</option>
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
                placeholder="Kosongkan untuk unlimited"
                className="border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
              />
              <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                Kosongkan untuk unlimited token
              </p>
              {errors.token_limit && <p className="text-sm text-red-600">{errors.token_limit}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verified">Status Verifikasi *</Label>
              <select
                id="verified"
                name="verified"
                required
                className="w-full px-3 py-2 border rounded-md border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827] text-[#1a1a18] dark:text-[#F9FAFB]"
              >
                <option value="false">Unverified</option>
                <option value="true">Verified</option>
              </select>
              {errors.verified && <p className="text-sm text-red-600">{errors.verified}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status Akun *</Label>
              <select
                id="active"
                name="active"
                required
                className="w-full px-3 py-2 border rounded-md border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827] text-[#1a1a18] dark:text-[#F9FAFB]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {errors.active && <p className="text-sm text-red-600">{errors.active}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
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
                {loading ? 'Menyimpan...' : 'Buat User'}
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
