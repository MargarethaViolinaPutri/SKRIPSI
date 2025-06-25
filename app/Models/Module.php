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
        if (! $this->relationLoaded('questions')) {
            return null;
        }

        $answeredQuestions = $this->questions->filter(function ($question) {
            return $question->userAnswer !== null;
        });

        if ($answeredQuestions->isEmpty()) {
            return null;
        }

        $totalAttempts = $this->questions->sum('user_answers_count');

        $totalScore = $answeredQuestions->sum(function ($question) {
            return (float) $question->userAnswer->total_score;
        });
        
        $questionsAnsweredCount = $answeredQuestions->count();
        $totalQuestions = $this->questions->count();

        if ($totalQuestions === 0) {
            return [
                'average_score' => 0,
                'questions_answered' => $questionsAnsweredCount,
                'total_questions' => $totalQuestions,
                'average_attempts' => 0,
            ];
        }

        return [
            'average_score' => $questionsAnsweredCount > 0 ? $totalScore / $questionsAnsweredCount : 0,
            'questions_answered' => $questionsAnsweredCount,
            'total_questions' => $totalQuestions,
            'average_attempts' => $totalAttempts / $totalQuestions,
        ];
    }
}