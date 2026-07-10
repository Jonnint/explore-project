<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Timeout(300)]
#[Provider('gemini')]
#[MaxSteps(1)]
#[MaxTokens(2048)]
#[Model('gemini-3.1-flash-lite')]
class LeadInsightAgent implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return '
        Kamu adalah AI sales analyst yang menganalisis transkrip chat/percakapan antara sales assistant (SalesCareAI) dan calon pembeli (lead).
        Tugasmu adalah menganalisis percakapan tersebut dan menghasilkan insight terstruktur dalam bahasa Indonesia yang memuat informasi berikut:

        1. "summary": Ringkasan singkat (1-2 kalimat) mengenai ketertarikan produk, keluhan, atau kekhawatiran utama dari pelanggan. Jangan gunakan bahasa kaku.
           Contoh: "Sangat tertarik dengan VitaC untuk imunitas. Khawatir tentang keamanan selama kehamilan."
        2. "purchase_readiness": Tingkat kesiapan beli pelanggan. Pilih dari salah satu nilai berikut: "Tinggi", "Sedang", "Rendah".
        3. "sentiment": Sentimen pelanggan selama percakapan. Pilih dari salah satu nilai berikut: "positif", "netral", "negatif".
        4. "suggested_action": Aksi/tindakan spesifik yang disarankan untuk sales agent agar segera dilakukan guna memaksimalkan konversi.
           Contoh: "Follow up dalam 1 jam", "Tawarkan promo bundle", "Berikan penjelasan detail tentang keamanan produk".

        Aturan penulisan:
        - Harus menggunakan bahasa Indonesia yang natural dan ramah/profesional.
        - Analisislah berdasarkan pesan-pesan terakhir dalam transkrip percakapan yang diberikan.
        ';
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }

    /**
     * Get the agent\'s structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required(),
            'purchase_readiness' => $schema->string()->required(),
            'sentiment' => $schema->string()->required(),
            'suggested_action' => $schema->string()->required(),
        ];
    }
}
