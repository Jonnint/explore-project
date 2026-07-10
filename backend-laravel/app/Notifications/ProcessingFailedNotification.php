<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProcessingFailedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $agentPhone,
        public ?string $errorPreview = null,
        public ?string $context = null,
    ) {}

    public function via(User $notifiable): array
    {
        return ['database'];
    }

    public function toArray(User $notifiable): array
    {
        return [
            'title' => 'Pemrosesan Gagal',
            'message' => $this->errorPreview ? "Gagal memproses: {$this->errorPreview}" : 'Terjadi kegagalan saat memproses pesan',
            'type' => 'error',
            'error_preview' => $this->errorPreview,
            'context' => $this->context,
        ];
    }
}
