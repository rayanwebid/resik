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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->integer('month');
            $table->integer('year');
            $table->string('status')->default('Unpaid'); // Unpaid, Paid, Failed, Cancelled, Jatuh Tempo
            $table->string('payment_method')->nullable(); // Transfer, QRIS, Cash, Virtual Account
            $table->string('proof_path')->nullable(); // upload bukti bayar
            $table->timestamp('payment_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
