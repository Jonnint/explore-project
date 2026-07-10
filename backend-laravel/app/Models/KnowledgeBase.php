<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeBase extends Model
{
    protected $table = 'knowledge_base';

    protected $fillable = [
        'user_id',
        'title',
        'category',
        'content',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    const MAX_BODY_LENGTH = 4000;

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, ?string $q)
    {
        if (blank($q)) {
            return $query;
        }

        $words = preg_split('/\s+/', $q, -1, PREG_SPLIT_NO_EMPTY);
        $words = array_filter($words, fn ($w) => strlen($w) > 2);

        if (empty($words)) {
            return $query;
        }

        return $query->where(function ($qry) use ($words) {
            foreach ($words as $word) {
                $qry->orWhere(function ($sub) use ($word) {
                    $like = "%{$word}%";
                    $sub->where('title', 'ilike', $like)
                        ->orWhere('content->body', 'ilike', $like)
                        ->orWhere('content->keywords', 'ilike', $like)
                        ->orWhere('tags', 'ilike', $like)
                        ->orWhere('category', 'ilike', $like);
                });
            }
        });
    }

    public static function appendOrCreate(int $userId, string $category, string $title, string $body, array $keywords = [], array $relatedProducts = [], array $tags = []): self
    {
        $latest = static::active()->forCategory($category)
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if ($latest && strlen($latest->content['body'] ?? '') < static::MAX_BODY_LENGTH) {
            $currentBody = $latest->content['body'] ?? '';
            $newBody = $currentBody."\n\n".$body;

            if (strlen($newBody) > static::MAX_BODY_LENGTH) {
                return static::create([
                    'user_id' => $userId,
                    'title' => $title,
                    'category' => $category,
                    'content' => [
                        'body' => $body,
                        'keywords' => $keywords,
                        'related_products' => $relatedProducts,
                    ],
                    'tags' => $tags,
                    'is_active' => true,
                ]);
            }

            $latest->update([
                'content' => [
                    'body' => $newBody,
                    'keywords' => array_unique(array_merge($latest->content['keywords'] ?? [], $keywords)),
                    'related_products' => array_unique(array_merge($latest->content['related_products'] ?? [], $relatedProducts)),
                ],
            ]);

            return $latest->fresh();
        }

        return static::create([
            'user_id' => $userId,
            'title' => $title,
            'category' => $category,
            'content' => [
                'body' => $body,
                'keywords' => $keywords,
                'related_products' => $relatedProducts,
            ],
            'tags' => $tags,
            'is_active' => true,
        ]);
    }
}
