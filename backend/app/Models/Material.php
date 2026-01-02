<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'seat_number',
        'subject_name',
        'material_name',
        'hall',
        'seat',
        'stage',
        'received',
        'received_at',
        'received_by',
    ];

    protected $casts = [
        'stage' => 'string',
    ];

    /**
     * Get the index definitions for migrations
     */
    public static function getIndexes(): array
    {
        return [
            'seat_number' => ['seat_number'],
        ];
    }
}

