<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FollowUpReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $leadId,
        public string $leadName,
        public int $hoursSinceLastMessage,
        public string $agentPhone,
        public ?string $lastMessageSnippet = null,
    ) {}

    public function via(User $notifiable): array
    {
        if (! $notifiable->hasNotificationPreference('follow_up_reminders')) {
            return [];
        }

        return ['database'];
    }

    public function toArray(User $notifiable): array
    {
        return [
            'title' => 'Follow-up Diperlukan',
            'message' => "{$this->leadName} sudah {$this->hoursSinceLastMessage} jam tidak merespon",
            'type' => 'follow_up',
            'lead_id' => $this->leadId,
            'hours_since_last_message' => $this->hoursSinceLastMessage,
            'action_url' => "/dashboard/leads/{$this->leadId}",
        ];
    }
}
