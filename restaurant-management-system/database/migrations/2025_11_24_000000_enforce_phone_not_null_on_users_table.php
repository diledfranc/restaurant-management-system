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
        // NOTE: Changing an existing column requires the doctrine/dbal package.
        // If you don't have it installed, run:
        // composer require doctrine/dbal --dev
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 32)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 32)->nullable()->change();
        });
    }
};
