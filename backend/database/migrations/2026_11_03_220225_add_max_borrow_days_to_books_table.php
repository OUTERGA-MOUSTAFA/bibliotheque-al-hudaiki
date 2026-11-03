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
        Schema::table('books', function (Blueprint $table) {
            // 👇 Zidna l'mudda l'max (par défaut 14 jour)
            $table->integer('max_borrow_days')->default(14)->after('stock');
            // 👇 Zidna l'age restriction (ila bghiti t7mi l'ktub l'kbar mn l'wlad)
            $table->integer('age_restriction')->nullable()->after('max_borrow_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
          Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['max_borrow_days', 'age_restriction']);
        });
    }
};
