<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    public function questions()
    {
        return $this->hasMany(TestQuestion::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}