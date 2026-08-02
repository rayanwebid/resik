<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Province
        $provinceId = DB::table('provinces')->insertGetId([
            'name' => 'Jawa Barat',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // City
        $cityId = DB::table('cities')->insertGetId([
            'province_id' => $provinceId,
            'name' => 'Bandung',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // District
        $districtId = DB::table('districts')->insertGetId([
            'city_id' => $cityId,
            'name' => 'Coblong',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Villages
        $villages = [
            ['name' => 'Dago', 'postal_code' => '40135'],
            ['name' => 'Lebak Siliwangi', 'postal_code' => '40132'],
            ['name' => 'Sadang Serang', 'postal_code' => '40133'],
        ];

        foreach ($villages as $village) {
            DB::table('villages')->insert([
                'district_id' => $districtId,
                'name' => $village['name'],
                'postal_code' => $village['postal_code'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
