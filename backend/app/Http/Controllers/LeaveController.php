<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeaveController extends Controller
{
    public function index()
    {
        $leaves = LeaveRequest::orderBy('start_date', 'asc')->get();
        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string'
        ]);

        // Optional: Check for overlapping leaves for this email
        $overlap = LeaveRequest::where('email', $validated['email'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhere(function($q) use ($validated) {
                          $q->where('start_date', '<=', $validated['start_date'])
                            ->where('end_date', '>=', $validated['end_date']);
                      });
            })
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'You already have a leave request overlapping these dates.'
            ], 422);
        }

        $validated['status'] = 'pending';
        $leave = LeaveRequest::create($validated);

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'leave' => $leave
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status;
        $leave->save();

        return response()->json([
            'message' => 'Leave status updated successfully.',
            'leave' => $leave
        ]);
    }
}
