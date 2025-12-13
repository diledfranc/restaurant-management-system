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
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // We need to modify the enum column. 
        // Since Doctrine DBAL doesn't support changing enum columns easily, 
        // we might need to use raw SQL or a workaround.
        // For MySQL/MariaDB:
        DB::statement("ALTER TABLE deliveries MODIFY COLUMN status ENUM('pending', 'assigned', 'accepted', 'picked_up', 'on_route', 'delivered', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum
        // Note: This might fail if there are records with 'pending' or 'cancelled' status.
        // We'll just leave it as is or try to revert if possible.
        DB::statement("ALTER TABLE deliveries MODIFY COLUMN status ENUM('assigned', 'accepted', 'picked_up', 'on_route', 'delivered') DEFAULT 'assigned'");
    }
};
