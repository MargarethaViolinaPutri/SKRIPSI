<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Answer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question_id',
        'user_id',
        'source',
        'student_code',
        'student_code_path',
        'output_accuracy_score',
        'structure_score',
        'total_score',
        'execution_output',
        'blank_results',
        'started_at',
        'finished_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'blank_results' => 'array',
    ];

    protected $appends = ['time_spent_in_seconds', 'blank_results'];
    
    /**
     * Get the question that the answer belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the user (student) that owns the answer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get duration.
     */
    public function getTimeSpentInSecondsAttribute(): int
    {
        if (empty($this->attributes['started_at']) || empty($this->attributes['finished_at'])) {
            return 0;
        }

        try {
            $finishTime = Carbon::parse($this->attributes['finished_at']);
            $startTime = Carbon::parse($this->attributes['started_at']);

            return abs($finishTime->diffInSeconds($startTime));

        } catch (\Exception $e) {
            return 0;
        }
    }

    public function getBlankResultsAttribute($value)
    {
        return $this->castAttribute('blank_results', $value);
    }
}
