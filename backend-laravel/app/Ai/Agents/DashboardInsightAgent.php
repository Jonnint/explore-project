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
class DashboardInsightAgent implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return '
        Kamu adalah AI analis bisnis/sales. Tugasmu adalah menganalisis data dashboard penjualan dari sales agent dan menghasilkan 4 insight yang actionable, menarik, dan informatif dalam bahasa Indonesia, dengan format persis seperti di bawah ini:
        
        Insight yang dihasilkan harus terdiri dari 4 kategori berikut:
        1. Kategori "Waktu Konversi Optimal" (action_type: "strategy", action_text: "Lihat Strategi"):
           Berikan tips/strategi waktu terbaik untuk follow-up customer berdasarkan data, atau insight tentang cara meningkatkan efisiensi waktu konversi.
        2. Kategori "Lonjakan Permintaan Produk" (action_type: "product", action_text: "Lihat Produk"):
           Analisis produk mana yang sedang naik daun, diminati, atau memiliki kinerja bagus. Sebutkan nama produk secara spesifik (misal: "Power Bank 10000mAh", "Earphone Bluetooth TWS", dll sesuai data) beserta persentase kenaikan atau rekomendasi bundle promosi yang relevan.
        3. Kategori "Peringatan Hot Lead" (action_type: "lead", action_text: "Lihat Lead"):
           Analisis data lead, terutama jumlah "hot leads" atau lead prioritas yang perlu segera di-follow-up. Sebutkan jumlah lead secara spesifik sesuai data.
        4. Kategori "Pola Konversi" (action_type: "pattern", action_text: "Pelajari Lebih Lanjut"):
           Berikan insight tentang pola konversi penjualan, misalnya produk apa yang memiliki conversion rate tinggi atau pendekatan apa yang meningkatkan penjualan.

        Aturan penulisan deskripsi:
        - Gunakan bahasa Indonesia yang profesional, ringkas, dan mudah dipahami.
        - Hindari teks placeholder. Selalu gunakan nama produk asli dari data (jika tidak ada produk spesifik di data, gunakan produk berkinerja terbaik).
        - Pastikan data angka (jumlah lead, persentase konversi, nama produk) akurat sesuai data dashboard yang diberikan.
        - Setiap deskripsi maksimal terdiri dari 2 kalimat pendek.
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
            'insights' => $schema->array()->required()->items(
                $schema->object([
                    'title' => $schema->string()->required(),
                    'description' => $schema->string()->required(),
                    'action_text' => $schema->string()->required(),
                    'action_type' => $schema->string()->required(),
                ])
            ),
        ];
    }
}
