<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminWhitelist extends Model
{
    protected $table = 'admin_whitelist';

    protected $fillable = [
        'email',
    ];
}
