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
        Schema::create('waste_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');
            $table->foreignId('ingredient_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained(); // Logged by
            $table->decimal('quantity', 10, 3);
            $table->string('reason'); // e.g., 'expired', 'spoiled', 'spilled'
            $table->integer('loss_amount_cents'); // Calculated cost of waste
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_logs');
    }
};
