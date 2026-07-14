import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromToken } from '@/lib/get-user-server';
import Navbar from '@/components/navbar';
import UserSidebar from '@/components/user-sidebar';

export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await getUserFromToken(token);

    if (!user || user.role !== 'user') {
        redirect('/dashboard');
    }

    return (
        <>
            <Navbar title="Beranda" iconName="home" showUserSection={true} user={user} />
            <div className="flex flex-1 bg-[#F9FAFB] dark:bg-[#111827]">
                <UserSidebar user={user} />
                <main className="flex-1 lg:ml-56 p-6">{children}</main>
            </div>
        </>
    );
}
