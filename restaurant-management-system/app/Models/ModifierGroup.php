<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModifierGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'internal_name',
        'min_selection',
        'max_selection',
        'is_active',
    ];

    public function modifiers()
    {
        return $this->hasMany(Modifier::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'menu_item_modifier_group')
            ->withPivot('sort_order')
            ->withTimestamps();
    }
}
