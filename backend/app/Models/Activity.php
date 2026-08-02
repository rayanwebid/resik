<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'video_url',
        'event_date',
    ];
}
