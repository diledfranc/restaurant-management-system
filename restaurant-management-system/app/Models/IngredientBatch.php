<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngredientBatch extends Model
{
    protected $fillable = [
        'ingredient_id',
        'batch_number',
        'quantity',
        'original_quantity',
        'cost_per_unit_cents',
        'expiration_date',
        'received_at',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'original_quantity' => 'decimal:3',
        'expiration_date' => 'date',
        'received_at' => 'datetime',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
