<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    protected $guarded  = [];

    protected $casts = [
        'threshold' => 'float',
    ];

    protected $appends = ['threshold_system'];

    public function getThresholdSystemAttribute(): float
    {
        if (! $this->relationLoaded('tests')) {
            $this->load('tests');
        }
        
        $pretest = $this->tests->firstWhere('type', Test::PRE_TEST);
        if (!$pretest) {
            return 0.0;
        }

        $average = TestAttempt::where('test_id', $pretest->id)
                              ->whereNotNull('finished_at')
                              ->avg('total_score');

        return round($average ?? 0.0, 2);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }

    public function tests()
    {
        return $this->hasMany(Test::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user')
                    ->withPivot('class_group')
                    ->withTimestamps();
    }
}
