<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

class Test extends Model
{
    use HasFactory;
    protected $guarded = [];

    const PRE_TEST = 'pretest';
    const POST_TEST = 'posttest';
    const DELAY_TEST = 'delaytest';

    protected $casts = [
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    public function scopeAvailableForStudents($query)
    {
        return $query->where('status', 'published')
                     ->where(function ($q) {
                         $q->where(function ($q2) {
                             $q2->whereNotNull('available_from')
                                ->whereNotNull('available_until')
                                ->where('available_from', '<=', now())
                                ->where('available_until', '>=', now());
                         })->orWhere(function ($q3) {
                             $q3->whereNull('available_from')
                                ->whereNull('available_until');
                         });
                     });
    }

    public function userLatestCompletedAttempt(): HasOne
    {
        return $this->hasOne(TestAttempt::class)
                    ->where('user_id', Auth::id())
                    ->whereNotNull('finished_at')
                    ->latestOfMany();
    }

    public function questions()
    {
        return $this->hasMany(TestQuestion::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}