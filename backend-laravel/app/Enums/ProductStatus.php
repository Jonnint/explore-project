<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Hot = 'hot';
    case Growing = 'growing';
    case Stable = 'stable';

    public function label(): string
    {
        return match ($this) {
            self::Hot => 'Hot',
            self::Growing => 'Growing',
            self::Stable => 'Stable',
        };
    }

    public static function options(): array
    {
        return [
            self::Hot->value => self::Hot->name,
            self::Growing->value => self::Growing->name,
            self::Stable->value => self::Stable->name,
        ];
    }
}
