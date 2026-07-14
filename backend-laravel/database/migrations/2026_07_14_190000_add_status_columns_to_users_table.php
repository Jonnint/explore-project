<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change role column to string/varchar using raw SQL to support PostgreSQL cast from enum
        DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255) USING role::varchar");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'verified')) {
                $table->boolean('verified')->default(false);
            }
            if (!Schema::hasColumn('users', 'active')) {
                $table->boolean('active')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['verified', 'active']);
        });
    }
};
