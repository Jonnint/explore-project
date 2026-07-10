<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\User;
use App\Notifications\FollowUpReminderNotification;
use App\Services\LeadService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

#[Signature('app:update-lead-statuses')]
#[Description('Update all lead statuses based on last message time')]
class UpdateLeadStatuses extends Command
{
    public function __construct(private LeadService $leadService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $updated = $this->leadService->updateAllLeadStatuses();

        $this->info("Updated {$updated} lead statuses.");

        $this->sendFollowUpReminders();

        return self::SUCCESS;
    }

    private function sendFollowUpReminders(): void
    {
        $staleLeads = Lead::where('status', 'cold')
            ->whereNotNull('last_message_at')
            ->where('last_message_at', '<=', Carbon::now()->subHours(48))
            ->whereNotNull('agent_phone')
            ->get()
            ->groupBy('agent_phone');

        foreach ($staleLeads as $agentPhone => $leads) {
            $user = User::where('phone', $agentPhone)->first();

            if (! $user) {
                continue;
            }

            foreach ($leads as $lead) {
                $alreadyNotified = DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->where('notifiable_type', User::class)
                    ->where('type', 'App\Notifications\FollowUpReminderNotification')
                    ->where('created_at', '>=', Carbon::now()->subDay())
                    ->where('data', 'like', "%\"lead_id\":{$lead->id}%")
                    ->exists();

                if ($alreadyNotified) {
                    continue;
                }

                $hoursSince = (int) abs(Carbon::now()->diffInHours($lead->last_message_at));

                $user->notify(new FollowUpReminderNotification(
                    leadId: $lead->id,
                    leadName: $lead->name ?? $lead->phone_number,
                    hoursSinceLastMessage: $hoursSince,
                    agentPhone: $agentPhone,
                ));
            }
        }
    }
}
