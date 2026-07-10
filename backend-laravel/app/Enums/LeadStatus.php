<?php

namespace App\Enums;

enum LeadStatus: string
{
    case Hot = 'hot';
    case Warm = 'warm';
    case Cold = 'cold';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
