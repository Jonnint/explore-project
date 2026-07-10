<?php

use App\Http\Controllers\Api\LinkClickController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Whatsapp\ShortLinkController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::get('/s/{code}', [ShortLinkController::class, 'redirect'])->name('short.redirect');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/link-clicks', [LinkClickController::class, 'index'])->name('admin.link-clicks.index');
});

require __DIR__.'/settings.php';
