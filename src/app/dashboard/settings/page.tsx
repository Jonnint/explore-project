import { apiGet } from '@/lib/api';
import type { User } from '@/types/settings';
import SettingsClient from './client';

interface MeResponse {
    user: User;
}

export default async function SettingsPage() {
    const data = await apiGet<MeResponse>('/auth/me');

    return <SettingsClient user={data.user} />;
}
