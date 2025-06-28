<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestAttempt extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'score' => 'float',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'question_order' => 'array',
    ];

    protected $appends = ['time_spent_in_seconds'];

    public function getTimeSpentInSecondsAttribute(): int
    {
        if (!$this->started_at || !$this->finished_at) {
            return 0;
        }
        
        return abs($this->finished_at->diffInSeconds($this->started_at));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TestAnswer::class);
    }
}