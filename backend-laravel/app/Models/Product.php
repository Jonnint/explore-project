<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'product_id',
        'category_id',
        'name',
        'slug',
        'link',
        'description',
        'price',
        'recommendation_count',
        'status',
    ];

    public function links()
    {
        return $this->hasMany(LinkClick::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Alias yang lebih mudah dibaca
     */
    public function linkClicks(): HasMany
    {
        return $this->links();
    }

    // Helper Methods
    public function totalLinkGenerated(): int
    {
        return $this->linkClicks()->count();
    }

    public function totalClicks(): int
    {
        return $this->linkClicks()
            ->whereNotNull('clicked_at')
            ->count();
    }

    public function clicksToday(): int
    {
        return $this->linkClicks()
            ->whereNotNull('clicked_at')
            ->whereDate('clicked_at', today())
            ->count();
    }
}
