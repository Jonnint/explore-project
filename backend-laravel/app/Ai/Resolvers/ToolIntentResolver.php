<?php

namespace App\Ai\Resolvers;

class ToolIntentResolver
{
    public static function shouldDisable(string $input): bool
    {
        $input = trim(strtolower($input));

        // if (strlen($input) <= 4) {
        //     return true;
        // }

        if (self::isGreeting($input)) {
            return true;
        }

        return false;
    }

    private static function isGreeting(string $input): bool
    {
        $greetings = [
            'halo',
            'hi',
            'pagi',
            'siang',
            'sore',
            'malam',
            'hello',
            'hey',
            'hei',
            'selamat pagi',
            'selamat siang',
            'selamat sore',
            'selamat malam',
            'assalamualaikum',
            'assalamu\'alaikum',
            'askum',
            'mikum',
            'ping',
            'p',
            'test',
            'tes',
            'ready',
            'ready?',
            'siapa',
            'siapa ini',
        ];

        return in_array($input, $greetings, true);
    }
}
