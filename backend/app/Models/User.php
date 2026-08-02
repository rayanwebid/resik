<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function officer()
    {
        return $this->hasOne(Officer::class);
    }

    /**
     * Check if user has role
     */
    public function hasRole(string $role): bool
    {
        return $this->role && $this->role->slug === $role;
    }

    /**
     * Check if user has permission
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }
        return $this->role && $this->role->permissions()->where('slug', $permission)->exists();
    }
}
