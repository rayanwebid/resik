<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super-admin', 'description' => 'Mengelola seluruh sistem'],
            ['name' => 'Petugas Sampah', 'slug' => 'petugas', 'description' => 'Petugas lapangan pengambil sampah'],
            ['name' => 'Pelanggan', 'slug' => 'pelanggan', 'description' => 'Masyarakat umum pengguna layanan'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['slug' => $role['slug']], [
                'name' => $role['name'],
                'description' => $role['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Permissions (grouped by module)
        $permissions = [
            // User Management
            ['name' => 'View Users', 'slug' => 'user.view', 'module' => 'User Management'],
            ['name' => 'Create User', 'slug' => 'user.create', 'module' => 'User Management'],
            ['name' => 'Update User', 'slug' => 'user.update', 'module' => 'User Management'],
            ['name' => 'Delete User', 'slug' => 'user.delete', 'module' => 'User Management'],

            // Role Management
            ['name' => 'View Roles', 'slug' => 'role.view', 'module' => 'Role Management'],
            ['name' => 'Create Role', 'slug' => 'role.create', 'module' => 'Role Management'],
            ['name' => 'Update Role', 'slug' => 'role.update', 'module' => 'Role Management'],
            ['name' => 'Delete Role', 'slug' => 'role.delete', 'module' => 'Role Management'],

            // Permission Management
            ['name' => 'View Permissions', 'slug' => 'permission.view', 'module' => 'Permission Management'],
            ['name' => 'Create Permission', 'slug' => 'permission.create', 'module' => 'Permission Management'],
            ['name' => 'Update Permission', 'slug' => 'permission.update', 'module' => 'Permission Management'],
            ['name' => 'Delete Permission', 'slug' => 'permission.delete', 'module' => 'Permission Management'],

            // Pelanggan
            ['name' => 'View Customer', 'slug' => 'customer.view', 'module' => 'Pelanggan'],
            ['name' => 'Create Customer', 'slug' => 'customer.create', 'module' => 'Pelanggan'],
            ['name' => 'Update Customer', 'slug' => 'customer.update', 'module' => 'Pelanggan'],
            ['name' => 'Delete Customer', 'slug' => 'customer.delete', 'module' => 'Pelanggan'],
            ['name' => 'Approve Customer', 'slug' => 'customer.approval', 'module' => 'Pelanggan'],

            // Petugas
            ['name' => 'View Officer', 'slug' => 'officer.view', 'module' => 'Petugas'],
            ['name' => 'Create Officer', 'slug' => 'officer.create', 'module' => 'Petugas'],
            ['name' => 'Update Officer', 'slug' => 'officer.update', 'module' => 'Petugas'],
            ['name' => 'Delete Officer', 'slug' => 'officer.delete', 'module' => 'Petugas'],
            ['name' => 'Officer Salary', 'slug' => 'officer.salary', 'module' => 'Petugas'],
            ['name' => 'Officer Location', 'slug' => 'officer.location', 'module' => 'Petugas'],
            ['name' => 'Officer Schedule', 'slug' => 'officer.schedule', 'module' => 'Petugas'],

            // Pickup Requests
            ['name' => 'View Pickup', 'slug' => 'pickup.view', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Create Pickup', 'slug' => 'pickup.create', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Update Pickup', 'slug' => 'pickup.update', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Delete Pickup', 'slug' => 'pickup.delete', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Assign Officer to Pickup', 'slug' => 'pickup.assign', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Complete Pickup', 'slug' => 'pickup.complete', 'module' => 'Pengambilan Sampah'],
            ['name' => 'Cancel Pickup', 'slug' => 'pickup.cancel', 'module' => 'Pengambilan Sampah'],

            // Payments
            ['name' => 'View Payment', 'slug' => 'payment.view', 'module' => 'Pembayaran'],
            ['name' => 'Create Payment', 'slug' => 'payment.create', 'module' => 'Pembayaran'],
            ['name' => 'Update Payment', 'slug' => 'payment.update', 'module' => 'Pembayaran'],
            ['name' => 'Confirm Payment', 'slug' => 'payment.confirm', 'module' => 'Pembayaran'],
            ['name' => 'Export Payment', 'slug' => 'payment.export', 'module' => 'Pembayaran'],

            // Tracking
            ['name' => 'View Tracking', 'slug' => 'tracking.view', 'module' => 'Tracking GPS'],
            ['name' => 'Update GPS Location', 'slug' => 'tracking.update', 'module' => 'Tracking GPS'],
            ['name' => 'Tracking History', 'slug' => 'tracking.history', 'module' => 'Tracking GPS'],
            ['name' => 'Real-time Tracking', 'slug' => 'tracking.realtime', 'module' => 'Tracking GPS'],

            // CMS
            ['name' => 'CMS Slider', 'slug' => 'cms.slider', 'module' => 'CMS'],
            ['name' => 'CMS Banner', 'slug' => 'cms.banner', 'module' => 'CMS'],
            ['name' => 'CMS News', 'slug' => 'cms.news', 'module' => 'CMS'],
            ['name' => 'CMS Activity', 'slug' => 'cms.activity', 'module' => 'CMS'],
            ['name' => 'CMS Gallery', 'slug' => 'cms.gallery', 'module' => 'CMS'],
            ['name' => 'CMS Page', 'slug' => 'cms.page', 'module' => 'CMS'],
            ['name' => 'CMS Menu', 'slug' => 'cms.menu', 'module' => 'CMS'],
            ['name' => 'CMS Footer', 'slug' => 'cms.footer', 'module' => 'CMS'],
            ['name' => 'CMS Header', 'slug' => 'cms.header', 'module' => 'CMS'],
            ['name' => 'CMS FAQ', 'slug' => 'cms.faq', 'module' => 'CMS'],
            ['name' => 'CMS Partner', 'slug' => 'cms.partner', 'module' => 'CMS'],
            ['name' => 'CMS Testimonial', 'slug' => 'cms.testimonial', 'module' => 'CMS'],

            // Settings
            ['name' => 'Website Settings', 'slug' => 'setting.website', 'module' => 'Website Setting'],
            ['name' => 'Manage Logo', 'slug' => 'setting.logo', 'module' => 'Website Setting'],
            ['name' => 'Manage Menu', 'slug' => 'setting.menu', 'module' => 'Website Setting'],
            ['name' => 'Manage Footer', 'slug' => 'setting.footer', 'module' => 'Website Setting'],
            ['name' => 'Manage Header', 'slug' => 'setting.header', 'module' => 'Website Setting'],
            ['name' => 'SMTP Setting', 'slug' => 'setting.smtp', 'module' => 'Website Setting'],
            ['name' => 'Google Maps Setting', 'slug' => 'setting.googlemaps', 'module' => 'Website Setting'],
            ['name' => 'WhatsApp Setting', 'slug' => 'setting.whatsapp', 'module' => 'Website Setting'],
            ['name' => 'SEO Setting', 'slug' => 'setting.seo', 'module' => 'Website Setting'],

            // Reports
            ['name' => 'Customer Report', 'slug' => 'report.customer', 'module' => 'Laporan'],
            ['name' => 'Payment Report', 'slug' => 'report.payment', 'module' => 'Laporan'],
            ['name' => 'Pickup Report', 'slug' => 'report.pickup', 'module' => 'Laporan'],
            ['name' => 'Salary Report', 'slug' => 'report.salary', 'module' => 'Laporan'],
            ['name' => 'Officer Report', 'slug' => 'report.officer', 'module' => 'Laporan'],
            ['name' => 'Export Report', 'slug' => 'report.export', 'module' => 'Laporan'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(['slug' => $permission['slug']], [
                'name' => $permission['name'],
                'module' => $permission['module'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Associate Permissions to Roles
        $superAdminRole = DB::table('roles')->where('slug', 'super-admin')->first();
        $officerRole = DB::table('roles')->where('slug', 'petugas')->first();
        $customerRole = DB::table('roles')->where('slug', 'pelanggan')->first();

        // Super Admin gets all permissions
        $allPermissionIds = DB::table('permissions')->pluck('id');
        foreach ($allPermissionIds as $pId) {
            DB::table('role_permissions')->updateOrInsert([
                'role_id' => $superAdminRole->id,
                'permission_id' => $pId
            ]);
        }

        // Petugas permissions
        $petugasPermissions = [
            'tracking.update',
            'officer.schedule',
            'pickup.view',
            'pickup.complete',
            'pickup.cancel',
        ];
        $petugasPermissionIds = DB::table('permissions')->whereIn('slug', $petugasPermissions)->pluck('id');
        foreach ($petugasPermissionIds as $pId) {
            DB::table('role_permissions')->updateOrInsert([
                'role_id' => $officerRole->id,
                'permission_id' => $pId
            ]);
        }

        // Pelanggan permissions
        $pelangganPermissions = [
            'pickup.create',
            'pickup.view',
            'payment.view',
            'payment.create',
        ];
        $pelangganPermissionIds = DB::table('permissions')->whereIn('slug', $pelangganPermissions)->pluck('id');
        foreach ($pelangganPermissionIds as $pId) {
            DB::table('role_permissions')->updateOrInsert([
                'role_id' => $customerRole->id,
                'permission_id' => $pId
            ]);
        }

        // 4. Create default Super Admin User
        $adminEmail = 'admin@resikapp.com';
        DB::table('users')->updateOrInsert(['email' => $adminEmail], [
            'role_id' => $superAdminRole->id,
            'name' => 'Super Admin',
            'password' => Hash::make('admin123'),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
