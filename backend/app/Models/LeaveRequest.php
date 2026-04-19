<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'start_date',
        'end_date',
        'reason',
        'status',
    ];

    // Status: pending, approved, rejected
}
