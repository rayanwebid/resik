<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/register', 'POST', [
    'name' => 'INDAH TRI WULANDARI',
    'phone' => '082311454549',
    'email' => 'pelanggan3@resikapp.com', // Must be unique
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'customer_type' => 'rumah_tangga',
    'address' => 'Jl. Test No 123',
    'province_id' => '32',
    'city_id' => '3273',
    'district_id' => '327301',
    'village_id' => '3273010001',
    'postal_code' => '40111',
    'latitude' => null,
    'longitude' => null
]);
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);
echo $response->getContent();
