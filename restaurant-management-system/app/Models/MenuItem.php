<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['category_id','name','description','price_cents','is_available','image_path'];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'menu_item_id');
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'menu_item_modifier_group')
            ->withPivot('sort_order')
            ->orderBy('pivot_sort_order')
            ->withTimestamps();
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'menu_item_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function getCostCentsAttribute()
    {
        return $this->ingredients->sum(function ($ingredient) {
            return $ingredient->cost_per_unit_cents * $ingredient->pivot->quantity;
        });
    }
}
