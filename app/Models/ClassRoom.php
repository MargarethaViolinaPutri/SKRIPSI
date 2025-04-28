<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model
{
    /** @use HasFactory<\Database\Factories\ClassRoomFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'level',
        'name',
        'code',
    ];

    /**
     * Get the teacher that owns the classroom.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get all classroom memberships for this classroom.
     */
    public function classRoomUsers()
    {
        return $this->hasMany(ClassRoomUser::class);
    }

    /**
     * Get all members (users) of this classroom.
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'class_room_users')
            ->withTimestamps();
    }
}
