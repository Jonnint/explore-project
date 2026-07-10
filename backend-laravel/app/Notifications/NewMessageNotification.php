<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $profileName,
        public string $agentPhone,
        public int $leadId,
        public string $messagePreview,
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
            'title' => 'Pesan Baru',
            'message' => "{$this->profileName}: {$this->messagePreview}",
            'type' => 'new_message',
            'lead_id' => $this->leadId,
            'action_url' => "/dashboard/leads/{$this->leadId}",
        ];
    }
}
