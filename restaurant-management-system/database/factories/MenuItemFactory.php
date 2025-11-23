<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition()
    {
        return [
            'category_id' => MenuCategory::factory(),
            'name' => $this->faker->productName ?? $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'price_cents' => $this->faker->numberBetween(100, 2000),
            'is_available' => $this->faker->boolean(80),
            'image_path' => null,
        ];
    }
}
