<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the check constraint on role created by the enum type in pgsql
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed for down.
    }
};
