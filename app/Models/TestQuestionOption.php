<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestQuestionOption extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function testQuestion()
    {
        return $this->belongsTo(TestQuestion::class);
    }
}