<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AdminWhitelist;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * List all admin users.
     */
    public function index()
    {
        $admins = User::where('role', 'admin')
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($admins);
    }

    /**
     * Create a new admin user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        // Create the user — role is always set server-side, never trusted from request
        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => Hash::make($validated['password']),
            'role'              => 'admin',
            'email_verified_at' => now(), // Admins created by admins are pre-verified
        ]);

        // Also add to whitelist so future re-registrations retain admin role
        AdminWhitelist::firstOrCreate(
            ['email' => $validated['email']],
            ['email' => $validated['email']]
        );

        return response()->json([
            'message' => 'Admin created successfully.',
            'admin'   => $user->only(['id', 'name', 'email', 'role', 'created_at']),
        ], 201);
    }

    /**
     * Remove an admin (demote to user & remove from whitelist).
     */
    public function destroy($id)
    {
        $admin = User::where('id', $id)->where('role', 'admin')->firstOrFail();

        // Prevent self-demotion
        if ($admin->id === auth()->id()) {
            return response()->json(['message' => 'You cannot remove yourself as admin.'], 403);
        }

        $admin->update(['role' => 'user']);
        AdminWhitelist::where('email', $admin->email)->delete();

        return response()->json(['message' => 'Admin removed successfully.']);
    }
}
