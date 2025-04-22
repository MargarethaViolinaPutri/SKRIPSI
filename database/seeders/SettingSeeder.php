<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use LevelUp\Experience\Models\Level;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Level::add(
            ['level' => 1, 'next_level_experience' => null],
            ['level' => 2, 'next_level_experience' => 100],
            ['level' => 3, 'next_level_experience' => 250],
        );

        $settings = [
            [
                'key' => 'OPEN_AI_KEY',
                'value' => 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            ],
            [
                'key' => 'OPEN_AI_MODEL',
                'value' => 'gpt-3.5-turbo',
            ],
            [
                'key' => 'APP_MODE',
                'value' => 'demo',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
