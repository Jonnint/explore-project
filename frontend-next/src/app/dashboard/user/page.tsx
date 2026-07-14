import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Dashboard User',
};

export default function UserDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Dashboard User</h1>
        <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
          Selamat datang di dashboard k-link Anda.
        </p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
            Selamat Datang!
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-[#9CA3AF]">
            Akun Anda saat ini aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ini adalah halaman dashboard user kosong Anda. Anda dapat mulai menggunakannya untuk fitur-fitur selanjutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
