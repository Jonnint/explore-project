"use client";

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard/link-clicks';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Login gagal.');
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Heading */}
      <h1 className="text-[28px] font-semibold text-[#1F2937] text-center mb-2">
        Selamat Datang Kembali
      </h1>
          <p className="text-[14px] text-[#6B7280] text-center mb-8">
        Baru Di K-Link?{' '}
        <Link href="/register" className="text-[#10B981] font-medium cursor-pointer hover:underline">
          Daftar
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-[#374151] mb-2">
            Alamat Email Anda
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="user@email.com"
            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#374151] mb-2">
            Kata Sandi Anda
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="************"
            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] text-[#1F2937] bg-[#F9FAFB] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white transition"
          />

        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-3">
            <p className="text-[13px] text-[#DC2626]">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-[15px] font-semibold rounded-lg px-4 py-3 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      {/* Forgot Password Link */}
      <div className="text-center my-6">
        <span className="text-[13px] text-[#10B981] font-medium cursor-pointer hover:underline underline">
          Kesulitan masuk?
        </span>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="text-[13px] text-[#6B7280]">Atau masuk dengan</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      {/* Social Login */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M16.51 7.36H9v3.28h4.51c-.18 1-.72 1.84-1.54 2.41v2.1h2.49c1.46-1.35 2.3-3.34 2.3-5.7 0-.55-.05-1.08-.14-1.59-.01-.17-.06-.33-.11-.5z" fill="#4285F4" />
            <path d="M9 17c2.03 0 3.73-.67 4.98-1.82l-2.49-2.1c-.67.45-1.53.72-2.49.72-1.91 0-3.53-1.29-4.11-3.03H2.26v2.17C3.51 15.35 6.08 17 9 17z" fill="#34A853" />
            <path d="M4.89 10.77c-.15-.45-.23-.93-.23-1.42s.08-.97.23-1.42V5.76H2.26C1.46 7.36 1 9.13 1 11s.46 3.64 1.26 5.24l2.63-2.17z" fill="#FBBC05" />
            <path d="M9 4.58c1.08 0 2.04.37 2.8 1.1l2.1-2.1C12.73 2.39 11.03 1.5 9 1.5c-2.92 0-5.49 1.65-6.74 4.06l2.63 2.17C5.47 5.87 7.09 4.58 9 4.58z" fill="#EA4335" />
          </svg>
        </button>
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2" aria-hidden="true">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1 mt-6">
        <span className="text-[13px] text-[#9CA3AF]">Anda masuk dengan</span>
        <span className="text-[13px] text-[#10B981] font-medium cursor-pointer hover:underline">
          Syarat & Ketentuan
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center p-6 bg-white">
        <Suspense fallback={<div className="text-center text-[#6B7280]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
