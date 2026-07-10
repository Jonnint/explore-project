<?php

namespace App\Jobs;

use App\Models\PendingChat;
use App\Services\WhatsAppServices;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class ProcessPendingChatsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public ?string $baseUrl = null)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppServices $wa): void
    {
        if ($this->baseUrl) {
            config(['app.url' => $this->baseUrl]);
        }

        $lock = Cache::lock('process-whatsapp-batch', 30);

        if ($lock->get()) {
            // Sleep for 1.5 seconds to let other incoming requests write to the pending_chats table
            usleep(1500000);

            // Fetch up to 10 pending chats
            $batch = PendingChat::where('status', 'pending')
                ->limit(10)
                ->get();

            if ($batch->isNotEmpty()) {
                PendingChat::whereIn('id', $batch->pluck('id'))->update(['status' => 'processing']);

                // Release the lock early so other batch jobs can be triggered
                $lock->release();

                $wa->processBatch($batch);
            } else {
                $lock->release();
            }
        }
    }
}
