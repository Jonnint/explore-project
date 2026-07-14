import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/get-user-server';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/navbar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    let user = null;
    if (token) {
        user = await getUserFromToken(token);
    }

    return (
        <>
            <Navbar title="Beranda" iconName="home" showUserSection={true} user={user} />
            <div className="flex flex-1 bg-[#F9FAFB] dark:bg-[#111827]">
                <Sidebar user={user} />
                <main className="flex-1 lg:ml-56 p-6">{children}</main>
            </div>
        </>
    );
}
