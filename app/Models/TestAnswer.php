<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestAnswer extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function testAttempt(): BelongsTo
    {
        return $this->belongsTo(TestAttempt::class);
    }
    public function question(): BelongsTo
    {
        return $this->belongsTo(TestQuestion::class, 'test_question_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(TestQuestionOption::class, 'test_question_option_id');
    }
}