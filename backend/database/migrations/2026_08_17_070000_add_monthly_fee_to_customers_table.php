<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('customers', 'monthly_fee')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->decimal('monthly_fee', 12, 2)->default(50000)->after('payment_due_day');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('customers', 'monthly_fee')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn('monthly_fee');
            });
        }
    }
};
