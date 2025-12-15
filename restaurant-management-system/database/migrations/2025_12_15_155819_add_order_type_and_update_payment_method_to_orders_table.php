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
            $table->string('order_type')->default('delivery')->after('status'); // delivery, pickup, dine_in
            $table->string('payment_method')->change(); // Change enum to string to support more types
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('order_type');
            // We can't easily revert string to enum without data loss risk or strict mapping, 
            // so we'll leave it as string or revert to a broader enum if needed.
        });
    }
};
