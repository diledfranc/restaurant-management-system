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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['placed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled'])
                  ->default('placed')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['placed', 'preparing', 'on_way', 'delivered', 'cancelled'])
                  ->default('placed')
                  ->change();
        });
    }
};
