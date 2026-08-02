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
        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('officer_id')->nullable()->constrained('officers')->onDelete('set null');
            $table->date('date');
            $table->time('time');
            $table->string('waste_type'); // organik, anorganik, dll
            $table->decimal('estimated_weight', 8, 2); // in kg
            $table->text('notes')->nullable();
            $table->string('photo')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('status')->default('menunggu'); // menunggu, diproses, dalam perjalanan, sudah diambil, selesai, batal
            $table->timestamps();
        });

        Schema::create('pickup_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pickup_request_id')->constrained('pickup_requests')->onDelete('cascade');
            $table->timestamp('date');
            $table->foreignId('officer_id')->constrained('officers')->onDelete('cascade');
            $table->decimal('weight', 8, 2); // actual weight
            $table->decimal('cost', 12, 2); // fee/cost
            $table->string('status');
            $table->string('photo_before')->nullable();
            $table->string('photo_after')->nullable();
            $table->string('invoice_no')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pickup_histories');
        Schema::dropIfExists('pickup_requests');
    }
};
