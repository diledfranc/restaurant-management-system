<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\ModifierGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModifierTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_modifier_groups_and_modifiers()
    {
        $group = ModifierGroup::create([
            'name' => 'Size',
            'min_selection' => 1,
            'max_selection' => 1,
        ]);

        $modifier = Modifier::create([
            'modifier_group_id' => $group->id,
            'name' => 'Large',
            'price_cents' => 50,
        ]);

        $this->assertDatabaseHas('modifier_groups', ['name' => 'Size']);
        $this->assertDatabaseHas('modifiers', ['name' => 'Large', 'price_cents' => 50]);
        $this->assertEquals($group->id, $modifier->group->id);
    }

    public function test_can_attach_modifier_group_to_menu_item()
    {
        $category = MenuCategory::create(['name' => 'Coffee', 'slug' => 'coffee']);
        $item = MenuItem::create([
            'category_id' => $category->id,
            'name' => 'Latte',
            'price_cents' => 400,
        ]);

        $group = ModifierGroup::create(['name' => 'Milk']);
        
        $item->modifierGroups()->attach($group->id, ['sort_order' => 1]);

        $this->assertTrue($item->modifierGroups->contains($group));
        $this->assertEquals(1, $item->modifierGroups->first()->pivot->sort_order);
    }
}
