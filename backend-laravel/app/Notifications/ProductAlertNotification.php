<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProductAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $productName,
        public int $productId,
        public string $agentPhone,
    ) {}

    public function via(User $notifiable): array
    {
        if (! $notifiable->hasNotificationPreference('product_alerts')) {
            return [];
        }

        return ['database'];
    }

    public function toArray(User $notifiable): array
    {
        return [
            'title' => 'Produk Direkomendasikan',
            'message' => "{$this->productName} direkomendasikan ke pelanggan",
            'type' => 'product_alert',
            'product_id' => $this->productId,
            'action_url' => '/dashboard/products',
        ];
    }
}
