<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Module extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\ModuleFactory> */
    use HasFactory, InteractsWithMedia;

    public $timestamps = true;

    protected $guarded  = [];

    protected $appends = [
        'materials', 'performance',
    ];

    protected $casts = [
        'material_paths' => 'array',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('materials')
            ->useDisk('public')
            ->useFallbackUrl('/materials/default.pdf')
            ->useFallbackPath(public_path('/materials/default.pdf'));
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function getMaterialsAttribute()
    {
        if (empty($this->material_paths)) {
            return [];
        }

        $materialsData = [];
        
        foreach ((array) $this->material_paths as $path) {
            $materialsData[] = [
                'name' => $this->name,
                'url'  => asset('storage/' . $path),
            ];
        }

        return $materialsData;
    }

    public function getPerformanceAttribute()
    {
        if (! $this->relationLoaded('questions.userAnswers')) {
            $this->load('questions.userAnswers');
        }

        $answeredQuestions = $this->questions->filter(function ($question) {
            return $question->userAnswers->isNotEmpty();
        });

        if ($answeredQuestions->isEmpty()) {
            return null;
        }
        
        $totalScore = $answeredQuestions->sum(function ($question) {
            $latestAnswer = $question->userAnswers->sortByDesc('id')->first();
            return (float) $latestAnswer->total_score;
        });

        $totalAttempts = $this->questions->reduce(function ($carry, $question) {
            return $carry + $question->userAnswers->count();
        }, 0);
        
        $totalTimeSpentSeconds = $this->questions->reduce(function ($carry, $question) {
            return $carry + $question->userAnswers->sum('time_spent_in_seconds');
        }, 0);
        $questionsAnsweredCount = $answeredQuestions->count();
        $totalQuestions = $this->questions->count();

        return [
            'average_score' => $questionsAnsweredCount > 0 ? $totalScore / $questionsAnsweredCount : 0,
            'questions_answered' => $questionsAnsweredCount,
            'total_questions' => $totalQuestions,
            'total_attempts' => $totalAttempts,
            'total_time_spent_seconds' => $totalTimeSpentSeconds,
        ];
    }
}