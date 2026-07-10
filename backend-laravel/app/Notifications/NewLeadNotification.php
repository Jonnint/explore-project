<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewLeadNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $profileName,
        public string $agentPhone,
        public int $leadId,
    ) {}

    public function via(User $notifiable): array
    {
        if (! $notifiable->hasNotificationPreference('lead_notifications')) {
            return [];
        }

        return ['database'];
    }

    public function toArray(User $notifiable): array
    {
        return [
            'title' => 'Lead Baru',
            'message' => "{$this->profileName} mengirim pesan pertama",
            'type' => 'new_lead',
            'lead_id' => $this->leadId,
            'action_url' => "/dashboard/leads/{$this->leadId}",
        ];
    }
}
