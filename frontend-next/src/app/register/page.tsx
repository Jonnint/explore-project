"use client";

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard/link-clicks';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Registrasi gagal.');
        return;
      }
      // on success redirect based on role
      const userRole = data.user?.role;
      if (userRole === 'user') {
        router.push('/dashboard/user');
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-[28px] font-semibold text-[#1F2937] text-center mb-2">Buat Akun Baru</h1>
          <p className="text-[14px] text-[#6B7280] text-center mb-8">Sudah punya akun? <a href="/login" className="text-[#10B981] font-medium hover:underline">Masuk</a></p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@email.com"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="nama pengguna"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">Nomor Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxx"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 8 karakter"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition"
              />
            </div>

            {error && (
              <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-3">
                <p className="text-[13px] text-[#DC2626]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-[15px] font-semibold rounded-lg px-4 py-3 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
