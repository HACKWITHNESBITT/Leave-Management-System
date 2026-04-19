<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link.
     *
     * SECURITY: Always returns 200 with the same message regardless of
     * whether the email exists, to prevent user enumeration attacks.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        // Fire and forget — do NOT reveal whether the email exists
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'If that email is registered, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset the user's password.
     * Token is single-use and expires after 60 minutes (Laravel default).
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke all existing Sanctum tokens on password reset (security)
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Your password has been reset successfully. Please log in.',
            ]);
        }

        // Map Laravel status codes to user-friendly messages
        $errorMessages = [
            Password::INVALID_TOKEN => 'This reset link is invalid or has already been used.',
            Password::INVALID_USER  => 'No account found with this email address.',
        ];

        return response()->json([
            'message' => $errorMessages[$status] ?? 'Failed to reset password. The link may have expired.',
        ], 422);
    }
}
