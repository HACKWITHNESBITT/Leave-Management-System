<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminWhitelistSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('admin_whitelist')->insert([
            ['email' => 'ronov610@gmail.com', 'created_at' => now(), 'updated_at' => now()],
            ['email' => 'boss@example.com', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
