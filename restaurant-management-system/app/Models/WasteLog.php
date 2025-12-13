<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WasteLog extends Model
{
    protected $fillable = [
        'ingredient_id',
        'ingredient_batch_id',
        'user_id',
        'quantity',
        'reason',
        'loss_amount_cents',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function batch()
    {
        return $this->belongsTo(IngredientBatch::class, 'ingredient_batch_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
