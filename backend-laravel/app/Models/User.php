<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'password', 'profile_picture', 'region', 'role', 'token_limit', 'tokens_used', 'notification_settings', 'verified', 'active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'notification_settings' => 'array',
            'token_limit' => 'integer',
            'tokens_used' => 'integer',
            'verified' => 'boolean',
            'active' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    public function canManageUsers(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canViewUsers(): bool
    {
        return $this->isSuperAdmin() || $this->isAdmin();
    }

    public function getNotificationSettings(): array
    {
        $defaults = [
            'follow_up_reminders' => true,
            'lead_notifications' => true,
            'product_alerts' => false,
            'conversion_notifications' => true,
        ];

        return array_merge($defaults, $this->notification_settings ?? []);
    }

    public function hasNotificationPreference(string $key): bool
    {
        $settings = $this->getNotificationSettings();

        return (bool) ($settings[$key] ?? false);
    }

    public function linkClicks()
    {
        return $this->hasMany(LinkClick::class, 'user_id', 'id');
    }
}
