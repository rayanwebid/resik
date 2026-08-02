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
        // Remove foreign key constraints from customers table
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['district_id']);
            $table->dropForeign(['village_id']);
        });

        // Change column types to string to accommodate region IDs/names securely
        // Note: Using string since some APIs or identifiers might contain characters or be too big, though EMSIFA is numeric.
        Schema::table('customers', function (Blueprint $table) {
            $table->string('province_id', 50)->nullable()->change();
            $table->string('city_id', 50)->nullable()->change();
            $table->string('district_id', 50)->nullable()->change();
            $table->string('village_id', 50)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add foreign key constraints if rolled back
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('province_id')->nullable()->change()->constrained('provinces')->onDelete('set null');
            $table->foreignId('city_id')->nullable()->change()->constrained('cities')->onDelete('set null');
            $table->foreignId('district_id')->nullable()->change()->constrained('districts')->onDelete('set null');
            $table->foreignId('village_id')->nullable()->change()->constrained('villages')->onDelete('set null');
        });
    }
};
