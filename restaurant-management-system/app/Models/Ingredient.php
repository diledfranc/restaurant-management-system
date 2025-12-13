<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit',
        'current_stock',
        'reorder_level',
        'cost_per_unit_cents',
    ];

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'menu_item_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function modifiers()
    {
        return $this->belongsToMany(Modifier::class, 'modifier_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function batches()
    {
        return $this->hasMany(IngredientBatch::class);
    }

    public function wasteLogs()
    {
        return $this->hasMany(WasteLog::class);
    }
}
