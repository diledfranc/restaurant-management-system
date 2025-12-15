<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use App\Models\Modifier;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CafeMenuSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // 1. Create Ingredients
            $ingredients = [
                // Coffee & Tea
                ['name' => 'Espresso Beans', 'unit' => 'g', 'cost' => 2, 'stock' => 5000], // 2 cents per gram
                ['name' => 'Whole Milk', 'unit' => 'ml', 'cost' => 0.2, 'stock' => 10000], // 0.2 cents per ml
                ['name' => 'Oat Milk', 'unit' => 'ml', 'cost' => 0.4, 'stock' => 5000],
                ['name' => 'Almond Milk', 'unit' => 'ml', 'cost' => 0.4, 'stock' => 5000],
                ['name' => 'Soy Milk', 'unit' => 'ml', 'cost' => 0.3, 'stock' => 5000],
                ['name' => 'Green Tea Leaves', 'unit' => 'g', 'cost' => 3, 'stock' => 2000],
                ['name' => 'Thai Tea Mix', 'unit' => 'g', 'cost' => 1.5, 'stock' => 3000],
                ['name' => 'Sugar Syrup', 'unit' => 'ml', 'cost' => 0.1, 'stock' => 5000],
                ['name' => 'Chocolate Syrup', 'unit' => 'ml', 'cost' => 0.5, 'stock' => 2000],
                ['name' => 'Caramel Syrup', 'unit' => 'ml', 'cost' => 0.5, 'stock' => 2000],
                ['name' => 'Whipped Cream', 'unit' => 'g', 'cost' => 1, 'stock' => 1000],
                
                // Food
                ['name' => 'Sourdough Bread', 'unit' => 'slice', 'cost' => 15, 'stock' => 100],
                ['name' => 'Egg', 'unit' => 'piece', 'cost' => 10, 'stock' => 200],
                ['name' => 'Avocado', 'unit' => 'piece', 'cost' => 50, 'stock' => 50],
                ['name' => 'Bacon', 'unit' => 'slice', 'cost' => 20, 'stock' => 200],
                ['name' => 'Burger Bun', 'unit' => 'piece', 'cost' => 15, 'stock' => 100],
                ['name' => 'Beef Patty', 'unit' => 'piece', 'cost' => 100, 'stock' => 100],
                ['name' => 'Cheddar Cheese', 'unit' => 'slice', 'cost' => 10, 'stock' => 200],
                ['name' => 'Lettuce', 'unit' => 'leaf', 'cost' => 2, 'stock' => 500],
                ['name' => 'Tomato', 'unit' => 'slice', 'cost' => 3, 'stock' => 300],
                ['name' => 'Fries', 'unit' => 'g', 'cost' => 0.5, 'stock' => 5000],
                ['name' => 'Pasta', 'unit' => 'g', 'cost' => 0.5, 'stock' => 5000],
                ['name' => 'Cream Sauce', 'unit' => 'ml', 'cost' => 0.8, 'stock' => 2000],
                ['name' => 'Parmesan Cheese', 'unit' => 'g', 'cost' => 2, 'stock' => 1000],
                
                // Dessert
                ['name' => 'Cream Cheese', 'unit' => 'g', 'cost' => 1.5, 'stock' => 2000],
                ['name' => 'Flour', 'unit' => 'g', 'cost' => 0.1, 'stock' => 5000],
                ['name' => 'Cocoa Powder', 'unit' => 'g', 'cost' => 1, 'stock' => 1000],
            ];

            $ingModels = [];
            foreach ($ingredients as $ing) {
                $ingModels[$ing['name']] = Ingredient::firstOrCreate(
                    ['name' => $ing['name']],
                    [
                        'unit' => $ing['unit'],
                        'cost_per_unit_cents' => $ing['cost'] * 100, 
                        'current_stock' => $ing['stock'],
                        'reorder_level' => 100
                    ]
                );
            }

            // 2. Create Categories
            $categories = [
                'Coffee',
                'Tea & Drinks',
                'Breakfast',
                'Mains',
                'Desserts'
            ];

            $catModels = [];
            foreach ($categories as $cat) {
                $catModels[$cat] = MenuCategory::firstOrCreate(
                    ['name' => $cat],
                    ['slug' => Str::slug($cat)]
                );
            }

            // 3. Create Modifier Groups
            $modGroups = [
                'Milk Options' => [
                    'required' => true,
                    'multiple' => false,
                    'options' => [
                        ['name' => 'Whole Milk', 'price' => 0, 'ing' => 'Whole Milk', 'qty' => 200],
                        ['name' => 'Low Fat Milk', 'price' => 0, 'ing' => 'Whole Milk', 'qty' => 200], // Simulating
                        ['name' => 'Oat Milk', 'price' => 20, 'ing' => 'Oat Milk', 'qty' => 200],
                        ['name' => 'Soy Milk', 'price' => 15, 'ing' => 'Soy Milk', 'qty' => 200],
                        ['name' => 'Almond Milk', 'price' => 20, 'ing' => 'Almond Milk', 'qty' => 200],
                    ]
                ],
                'Sweetness' => [
                    'required' => true,
                    'multiple' => false,
                    'options' => [
                        ['name' => '0% Sugar', 'price' => 0, 'ing' => 'Sugar Syrup', 'qty' => 0],
                        ['name' => '25% Sugar', 'price' => 0, 'ing' => 'Sugar Syrup', 'qty' => 10],
                        ['name' => '50% Sugar', 'price' => 0, 'ing' => 'Sugar Syrup', 'qty' => 20],
                        ['name' => '100% Sugar', 'price' => 0, 'ing' => 'Sugar Syrup', 'qty' => 40],
                    ]
                ],
                'Toppings' => [
                    'required' => false,
                    'multiple' => true,
                    'options' => [
                        ['name' => 'Extra Shot', 'price' => 20, 'ing' => 'Espresso Beans', 'qty' => 18],
                        ['name' => 'Whipped Cream', 'price' => 15, 'ing' => 'Whipped Cream', 'qty' => 30],
                        ['name' => 'Caramel Drizzle', 'price' => 10, 'ing' => 'Caramel Syrup', 'qty' => 15],
                    ]
                ],
                'Burger Sides' => [
                    'required' => true,
                    'multiple' => false,
                    'options' => [
                        ['name' => 'French Fries', 'price' => 0, 'ing' => 'Fries', 'qty' => 150],
                        ['name' => 'Salad', 'price' => 0, 'ing' => 'Lettuce', 'qty' => 50],
                    ]
                ],
                'Doneness' => [
                    'required' => true,
                    'multiple' => false,
                    'options' => [
                        ['name' => 'Medium Rare', 'price' => 0],
                        ['name' => 'Medium', 'price' => 0],
                        ['name' => 'Well Done', 'price' => 0],
                    ]
                ]
            ];

            $modGroupModels = [];
            foreach ($modGroups as $name => $data) {
                $group = ModifierGroup::firstOrCreate(
                    ['name' => $name],
                    [
                        'min_selection' => $data['required'] ? 1 : 0,
                        'max_selection' => $data['multiple'] ? 5 : 1,
                    ]
                );
                $modGroupModels[$name] = $group;

                foreach ($data['options'] as $opt) {
                    $mod = Modifier::firstOrCreate(
                        ['name' => $opt['name'], 'modifier_group_id' => $group->id],
                        [
                            'price_cents' => $opt['price'] * 100,
                        ]
                    );
                    
                    if (isset($opt['ing']) && isset($ingModels[$opt['ing']])) {
                        $mod->ingredients()->syncWithoutDetaching([
                            $ingModels[$opt['ing']]->id => ['quantity' => $opt['qty']]
                        ]);
                    }
                }
            }

            // 4. Create Menu Items
            $items = [
                // Coffee
                [
                    'name' => 'Hot Latte',
                    'cat' => 'Coffee',
                    'price' => 85,
                    'desc' => 'Smooth espresso with steamed milk and a thin layer of foam.',
                    'ings' => [
                        'Espresso Beans' => 18,
                        'Whole Milk' => 200
                    ],
                    'mods' => ['Milk Options', 'Sweetness', 'Toppings']
                ],
                [
                    'name' => 'Iced Americano',
                    'cat' => 'Coffee',
                    'price' => 75,
                    'desc' => 'Espresso shots topped with cold water and ice.',
                    'ings' => [
                        'Espresso Beans' => 18,
                    ],
                    'mods' => ['Sweetness', 'Toppings']
                ],
                [
                    'name' => 'Caramel Macchiato',
                    'cat' => 'Coffee',
                    'price' => 95,
                    'desc' => 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and topped with a caramel drizzle.',
                    'ings' => [
                        'Espresso Beans' => 18,
                        'Whole Milk' => 180,
                        'Caramel Syrup' => 20
                    ],
                    'mods' => ['Milk Options', 'Sweetness', 'Toppings']
                ],
                
                // Tea
                [
                    'name' => 'Iced Green Tea Latte',
                    'cat' => 'Tea & Drinks',
                    'price' => 85,
                    'desc' => 'Premium matcha green tea blended with milk and ice.',
                    'ings' => [
                        'Green Tea Leaves' => 10,
                        'Whole Milk' => 200,
                        'Sugar Syrup' => 20
                    ],
                    'mods' => ['Milk Options', 'Sweetness', 'Toppings']
                ],
                [
                    'name' => 'Thai Iced Tea',
                    'cat' => 'Tea & Drinks',
                    'price' => 70,
                    'desc' => 'Classic Thai tea with condensed milk.',
                    'ings' => [
                        'Thai Tea Mix' => 15,
                        'Whole Milk' => 100,
                        'Sugar Syrup' => 30
                    ],
                    'mods' => ['Sweetness', 'Toppings']
                ],

                // Breakfast
                [
                    'name' => 'Avocado Toast',
                    'cat' => 'Breakfast',
                    'price' => 180,
                    'desc' => 'Sourdough toast topped with smashed avocado, poached egg, and chili flakes.',
                    'ings' => [
                        'Sourdough Bread' => 2,
                        'Avocado' => 1,
                        'Egg' => 1
                    ],
                    'mods' => []
                ],
                [
                    'name' => 'Classic Pancakes',
                    'cat' => 'Breakfast',
                    'price' => 150,
                    'desc' => 'Stack of fluffy pancakes served with butter and maple syrup.',
                    'ings' => [
                        'Flour' => 100,
                        'Egg' => 1,
                        'Whole Milk' => 100
                    ],
                    'mods' => ['Toppings']
                ],

                // Mains
                [
                    'name' => 'Cheeseburger',
                    'cat' => 'Mains',
                    'price' => 220,
                    'desc' => 'Juicy beef patty with cheddar cheese, lettuce, tomato, and house sauce.',
                    'ings' => [
                        'Burger Bun' => 1,
                        'Beef Patty' => 1,
                        'Cheddar Cheese' => 1,
                        'Lettuce' => 1,
                        'Tomato' => 2
                    ],
                    'mods' => ['Burger Sides', 'Doneness']
                ],
                [
                    'name' => 'Carbonara',
                    'cat' => 'Mains',
                    'price' => 240,
                    'desc' => 'Spaghetti with creamy egg sauce, bacon, and parmesan cheese.',
                    'ings' => [
                        'Pasta' => 150,
                        'Bacon' => 3,
                        'Egg' => 2,
                        'Parmesan Cheese' => 20
                    ],
                    'mods' => []
                ],

                // Desserts
                [
                    'name' => 'New York Cheesecake',
                    'cat' => 'Desserts',
                    'price' => 120,
                    'desc' => 'Rich and creamy cheesecake with a graham cracker crust.',
                    'ings' => [
                        'Cream Cheese' => 100,
                        'Sugar Syrup' => 20,
                        'Egg' => 1
                    ],
                    'mods' => []
                ],
                [
                    'name' => 'Fudge Brownie',
                    'cat' => 'Desserts',
                    'price' => 80,
                    'desc' => 'Warm chocolate fudge brownie.',
                    'ings' => [
                        'Cocoa Powder' => 30,
                        'Flour' => 50,
                        'Sugar Syrup' => 30
                    ],
                    'mods' => ['Toppings']
                ]
            ];

            foreach ($items as $itemData) {
                $menuItem = MenuItem::firstOrCreate(
                    ['name' => $itemData['name']],
                    [
                        'category_id' => $catModels[$itemData['cat']]->id,
                        'description' => $itemData['desc'],
                        'price_cents' => $itemData['price'] * 100,
                        'is_available' => true,
                    ]
                );

                // Attach Ingredients
                if (isset($itemData['ings'])) {
                    foreach ($itemData['ings'] as $ingName => $qty) {
                        if (isset($ingModels[$ingName])) {
                            $menuItem->ingredients()->syncWithoutDetaching([
                                $ingModels[$ingName]->id => ['quantity' => $qty]
                            ]);
                        }
                    }
                }

                // Attach Modifier Groups
                if (isset($itemData['mods'])) {
                    foreach ($itemData['mods'] as $index => $modGroupName) {
                        if (isset($modGroupModels[$modGroupName])) {
                            $menuItem->modifierGroups()->syncWithoutDetaching([
                                $modGroupModels[$modGroupName]->id => ['sort_order' => $index]
                            ]);
                        }
                    }
                }
            }
        });
    }
}
