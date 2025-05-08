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
        'materials',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('materials');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getMaterialsAttribute()
    {
        return $this->getMedia('materials');
    }
}
