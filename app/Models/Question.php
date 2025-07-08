<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Question extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionFactory> */
    use HasFactory;

    protected $guarded  = [];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function userAnswer()
    {
        return $this->hasOne(Answer::class)
            ->where('user_id', 3)
            ->latestOfMany();
    }

    public function userAnswers()
    {
        return $this->hasMany(Answer::class)->where('user_id', 3);
    }
}
