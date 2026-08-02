<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Redirect unauthenticated users to the dashboard login page.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('dashboard.login');
    }
}
