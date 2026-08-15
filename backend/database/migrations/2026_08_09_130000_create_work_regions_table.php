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
        Schema::create('work_regions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default work regions for Banyuwangi
        DB::table('work_regions')->insert([
            [
                'name' => 'Genteng',
                'code' => 'W-GNT',
                'description' => 'Cakupan wilayah Genteng, Genteng Kulon, Genteng Wetan dan sekitarnya.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Banyuwangi Kota',
                'code' => 'W-BWI',
                'description' => 'Cakupan pusat kota Banyuwangi, Penganjuran, Kepatihan, dan Tukangkayu.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Giri',
                'code' => 'W-GRI',
                'description' => 'Cakupan kecamatan Giri, Penataban, Mojop stage, dan Boyolali.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rogojampi',
                'code' => 'W-RGJ',
                'description' => 'Cakupan wilayah Rogojampi, Gitik, Pengantigan dan sekitarnya.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Glagah',
                'code' => 'W-GLG',
                'description' => 'Cakupan wilayah Glagah, Kampung Anyar, Rejosari dan Bakungan.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_regions');
    }
};
