<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->after('customer_id');
            $table->date('due_date')->nullable()->after('payment_date');
            $table->date('invoice_date')->nullable()->after('due_date');
            $table->timestamp('paid_at')->nullable()->after('invoice_date');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['invoice_number', 'due_date', 'invoice_date', 'paid_at']);
        });
    }
};
