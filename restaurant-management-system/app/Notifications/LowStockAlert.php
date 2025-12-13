<?php

namespace App\Notifications;

use App\Models\Ingredient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public $ingredient;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ingredient $ingredient)
    {
        $this->ingredient = $ingredient;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Low Stock Alert: ' . $this->ingredient->name)
            ->line('The stock for ' . $this->ingredient->name . ' is low.')
            ->line('Current Stock: ' . $this->ingredient->current_stock . ' ' . $this->ingredient->unit)
            ->line('Reorder Level: ' . $this->ingredient->reorder_level)
            ->action('View Inventory', url('/inventory'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ingredient_id' => $this->ingredient->id,
            'name' => $this->ingredient->name,
            'current_stock' => $this->ingredient->current_stock,
            'message' => "Low stock alert: {$this->ingredient->name} is below reorder level.",
        ];
    }
}
            //
        ];
    }
}
