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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_id');
            $table->foreignId('category_id')->references('id')->on('categories');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('link');
            $table->text('description')->nullable();
            $table->integer('price')->nullable();
            $table->integer('recommendation_count')->default(0);
            $table->enum('status', ['hot', 'growing', 'stable']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
