import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ChangePasswordRequest, ChangePasswordResponse, ValidationError } from '@/types/settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: ChangePasswordRequest = await req.json();

        const res = await fetch(`${API_URL}/api/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 422) {
                return NextResponse.json(
                    data as ValidationError,
                    { status: 422 }
                );
            }
            return NextResponse.json(
                { message: data.message ?? 'Gagal mengubah password.' },
                { status: res.status }
            );
        }

        return NextResponse.json(data as ChangePasswordResponse);
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
