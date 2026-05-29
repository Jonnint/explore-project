"use client";

import { useState } from 'react';
import type { User, UpdateProfileRequest, ChangePasswordRequest } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, User as UserIcon, Phone, Mail, MapPin } from 'lucide-react';

interface SettingsClientProps {
    user: User;
}

export default function SettingsClient({ user }: SettingsClientProps) {
    // Profile state
    const [profileData, setProfileData] = useState<UpdateProfileRequest>({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
    });
    const [region, setRegion] = useState<string>(''); // Backend belum ada, set empty string untuk skeleton
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});

    // Password state
    const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});

    async function handleProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess(null);
        setProfileError(null);
        setProfileErrors({});

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    setProfileErrors(data.errors);
                    setProfileError(data.message ?? 'Validasi gagal.');
                } else {
                    setProfileError(data.message ?? 'Gagal mengupdate profil.');
                }
                return;
            }

            setProfileSuccess(data.message ?? 'Profil berhasil diupdate.');
            // Update local state with new user data
            if (data.user) {
                setProfileData({
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone ?? '',
                });
            }
        } catch {
            setProfileError('Tidak dapat terhubung ke server.');
        } finally {
            setProfileLoading(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess(null);
        setPasswordError(null);
        setPasswordErrors({});

        try {
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    setPasswordErrors(data.errors);
                    setPasswordError(data.message ?? 'Validasi gagal.');
                } else {
                    setPasswordError(data.message ?? 'Gagal mengubah password.');
                }
                return;
            }

            setPasswordSuccess(data.message ?? 'Password berhasil diubah.');
            // Reset form
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
        } catch {
            setPasswordError('Tidak dapat terhubung ke server.');
        } finally {
            setPasswordLoading(false);
        }
    }

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#1F2937] -m-6 p-6 transition-colors">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-[28px] font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Settings</h1>
                    <p className="text-[14px] text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile Settings Card */}
                <Card className="border border-[#E5E7EB] dark:border-[#374151] dark:bg-[#111827]">
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-[18px] font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Profile Settings</h2>
                            <p className="text-[13px] text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                                Update your personal information
                            </p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 bg-[#10B981]">
                                    <AvatarFallback className="bg-[#10B981] text-white text-xl font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[14px] font-medium text-[#1F2937] dark:text-[#F9FAFB]">Change Photo</p>
                                    <p className="text-[12px] text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">
                                        JPG, PNG or GIF, max 2MB
                                    </p>
                                </div>
                            </div>

                            {/* Form Fields - 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                                        <Input
                                            id="name"
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            placeholder="Sales Agent"
                                            required
                                            className={`pl-10 bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] ${profileErrors.name ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {profileErrors.name && (
                                        <p className="text-[12px] text-red-600">{profileErrors.name[0]}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                                        <Input
                                            id="phone"
                                            type="text"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            placeholder="+62 812-3456-7890"
                                            className={`pl-10 bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] ${profileErrors.phone ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {profileErrors.phone && (
                                        <p className="text-[12px] text-red-600">{profileErrors.phone[0]}</p>
                                    )}
                                </div>

                                {/* Email Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            placeholder="agent@k-link.com"
                                            required
                                            className={`pl-10 bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] ${profileErrors.email ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {profileErrors.email && (
                                        <p className="text-[12px] text-red-600">{profileErrors.email[0]}</p>
                                    )}
                                </div>

                                {/* Sales Region - Skeleton if empty string */}
                                <div className="space-y-2">
                                    <Label htmlFor="region" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Sales Region</Label>
                                    {region === '' ? (
                                        <Skeleton className="h-10 w-full rounded-md bg-[#F9FAFB] dark:bg-[#111827]" />
                                    ) : (
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#6B7280]" />
                                            <Input
                                                id="region"
                                                type="text"
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                placeholder="Jakarta"
                                                className="pl-10 bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Success Message */}
                            {profileSuccess && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800 text-[13px]">
                                        {profileSuccess}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Error Message */}
                            {profileError && (
                                <Alert className="bg-red-50 border-red-200">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800 text-[13px]">
                                        {profileError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-6"
                                >
                                    {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Security Settings Card */}
                <Card className="border border-[#E5E7EB] dark:border-[#374151] dark:bg-[#111827]">
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-[18px] font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Security Settings</h2>
                            <p className="text-[13px] text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                                Manage your password and security preferences
                            </p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {/* Password Fields - 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Current Password */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="current_password" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className={`bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] ${passwordErrors.current_password ? 'border-red-500' : ''}`}
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="text-[12px] text-red-600">{passwordErrors.current_password[0]}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        className={`bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] ${passwordErrors.password ? 'border-red-500' : ''}`}
                                    />
                                    {passwordErrors.password && (
                                        <p className="text-[12px] text-red-600">{passwordErrors.password[0]}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        className={`bg-[#F9FAFB] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] ${passwordErrors.password_confirmation ? 'border-red-500' : ''}`}
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="text-[12px] text-red-600">{passwordErrors.password_confirmation[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Success Message */}
                            {passwordSuccess && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800 text-[13px]">
                                        {passwordSuccess}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Error Message */}
                            {passwordError && (
                                <Alert className="bg-red-50 border-red-200">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800 text-[13px]">
                                        {passwordError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-6"
                                >
                                    {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
