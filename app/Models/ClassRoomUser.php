<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoomUser extends Model
{
    /** @use HasFactory<\Database\Factories\ClassRoomUserFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'class_room_id',
    ];

    /**
     * Get the user that belongs to this classroom membership.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the classroom that belongs to this membership.
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class);
    }
}
