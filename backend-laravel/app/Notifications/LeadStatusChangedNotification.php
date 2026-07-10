<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeadStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $leadId,
        public string $leadName,
        public string $oldStatus,
        public string $newStatus,
        public string $agentPhone,
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
        $statusLabel = match ($this->newStatus) {
            'hot' => 'Hot',
            'warm' => 'Warm',
            default => 'Cold',
        };

        return [
            'title' => "Lead {$statusLabel}",
            'message' => "{$this->leadName} menjadi lead {$statusLabel}",
            'type' => 'status_change',
            'lead_id' => $this->leadId,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'action_url' => "/dashboard/leads/{$this->leadId}",
        ];
    }
}
