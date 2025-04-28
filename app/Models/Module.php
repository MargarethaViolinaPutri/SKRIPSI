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
        'file',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getFileAttribute()
    {
        return $this->getMedia('file')->last();
    }
}
