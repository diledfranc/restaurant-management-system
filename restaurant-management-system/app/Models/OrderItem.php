<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id','menu_item_id','quantity','unit_price_cents','total_price_cents','notes'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function modifiers()
    {
        return $this->belongsToMany(Modifier::class, 'order_item_modifiers', 'order_item_id', 'modifier_id')
            ->withPivot(['modifier_name', 'price_cents'])
            ->withTimestamps();
    }
}
