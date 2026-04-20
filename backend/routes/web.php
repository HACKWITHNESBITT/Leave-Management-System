<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Laravel's Password broker needs this named route to build the reset URL.
// It will redirect users to the React frontend page that handles the token.
Route::get('/reset-password/{token}', function ($token) {
    $email = request()->query('email', '');
    $frontend = config('app.frontend_url', 'http://localhost:5173');
    
    \Illuminate\Support\Facades\Log::info("Password reset link clicked", [
        'email' => $email,
        'token_preview' => substr($token, 0, 8) . '...'
    ]);

    $query = http_build_query([
        'token' => $token,
        'email' => $email
    ]);

    return redirect("{$frontend}/reset-password?{$query}");
})->name('password.reset');
