<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use LevelUp\Experience\Concerns\GiveExperience;
use LevelUp\Experience\Concerns\HasAchievements;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, GiveExperience, HasAchievements;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the classrooms where this user is a teacher.
     */
    public function classRooms()
    {
        return $this->belongsToMany(ClassRoom::class, 'class_room_users')
            ->withTimestamps();
    }

    /**
     * Get all classroom memberships for this user.
     */
    public function classRoomUsers()
    {
        return $this->hasMany(ClassRoomUser::class);
    }

    /**
     * Get the latest classroom membership for this user.
     */
    public function latestClassRoomUser()
    {
        return $this->hasOne(ClassRoomUser::class)->latest();
    }

    /**
     * Get the latest classroom this user is a member of.
     */
    public function latestClassRoom()
    {
        return $this->latestClassRoomUser()->with('classRoom');
    }
}
