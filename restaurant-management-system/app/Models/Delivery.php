<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = ['order_id','assigned_user_id','status','pickup_time','delivered_time'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    // alias expected by resources/controllers
    public function staff()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
}
