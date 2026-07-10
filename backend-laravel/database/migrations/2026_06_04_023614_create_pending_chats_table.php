<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pending_chats', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique();
            $table->string('from');
            $table->text('body');
            $table->string('agent_phone')->nullable();
            $table->string('phone_id')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('profile_name')->nullable();
            $table->string('status')->default('pending'); // pending, processing, done, failed
            $table->text('response_message')->nullable();
            $table->json('response_recommendations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_chats');
    }
};
