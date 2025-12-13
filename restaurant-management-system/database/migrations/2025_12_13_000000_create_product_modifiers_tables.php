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
        // 1. Groups of modifiers (e.g., "Size", "Milk Option", "Toppings")
        Schema::create('modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Size", "Milk"
            $table->string('internal_name')->nullable(); // for admin reference
            $table->integer('min_selection')->default(0); // 0 = optional, 1 = required
            $table->integer('max_selection')->default(1); // 1 = single select, >1 = multi select
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. The actual options (e.g., "Small", "Oat Milk", "Vanilla Syrup")
        Schema::create('modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modifier_group_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('price_cents')->default(0); // Additional cost
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Link Menu Items to Modifier Groups (Many-to-Many)
        // A "Latte" can have "Size" and "Milk" groups.
        Schema::create('menu_item_modifier_group', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('modifier_group_id')->constrained()->cascadeOnDelete();
            $table->integer('sort_order')->default(0); // To control display order
            $table->timestamps();
        });

        // 4. Store selected modifiers for a specific order item
        Schema::create('order_item_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('modifier_id')->constrained()->restrictOnDelete(); // Don't delete history if modifier deleted
            $table->string('modifier_name'); // Snapshot of name at time of order
            $table->integer('price_cents'); // Snapshot of price at time of order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_modifiers');
        Schema::dropIfExists('menu_item_modifier_group');
        Schema::dropIfExists('modifiers');
        Schema::dropIfExists('modifier_groups');
    }
};
