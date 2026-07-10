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
        Schema::create('link_clicks', function (Blueprint $table) {
            $table->id();
            $table->string('track_code');
            $table->string('conversation_id')->nullable();
            $table->foreignId('product_id')->references('id')->on('products');
            $table->foreignId('user_id')->nullable()->references('id')->on('users');
            $table->string('original_url');
            $table->timestamp('clicked_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('browser_agent')->nullable();
            $table->string('agent_phone')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('profile_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_clicks');
    }
};
