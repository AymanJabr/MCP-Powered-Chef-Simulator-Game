# Missing Game Assets

This file lists ingredients, equipment, and cooking action types that are mentioned in `public/assets/data/recipes/recipes.json` but are not found in their respective definition files (`ingredients.json`, `equipment.json`) or type declarations (`src/types/models.ts`).

## Missing Ingredients

The following ingredient IDs are used in recipes but are not defined in `public/assets/data/ingredients/ingredients.json`:

=>'ingredient_burger_bun'
=>'ingredient_cream_cheese'
=>'ingredient_coffee'
=>'ingredient_rice'
=>'ingredient_salt_and_pepper'
=> `ingredient_flour` (Referenced in comments for recipe_cake_berry, recipe_cake_honey_caramel, recipe_cake_mango_lemon_with_golden_berries, recipe_cake_mint_pistacchio, recipe_cake_raspberry_shortcake, recipe_cupcake, recipe_croissant, recipe_pie, recipe_pudding, recipe_pudding_raspberry, recipe_waffle_batter_or_mix)
=> `ingredient_egg` (Referenced in comments for recipe_cake_berry, recipe_cake_cheesecake_orange, recipe_cake_honey_caramel, recipe_cake_mango_lemon_with_golden_berries, recipe_cake_mint_pistacchio, recipe_cake_raspberry_shortcake, recipe_cupcake, recipe_egg_soup, recipe_eggs_with_rice, recipe_pudding, recipe_pudding_raspberry, recipe_waffle_batter_or_mix)
=> `ingredient_butter` (Referenced in comments for recipe_cake_cheesecake_orange, recipe_cake_mango_lemon_with_golden_berries, recipe_cake_mint_pistacchio, recipe_cake_raspberry_shortcake, recipe_cupcake, recipe_pie, recipe_fish, recipe_fish_with_potatoes_and_carrots, recipe_lamb_chop_with_potatoes, recipe_steak_cooked, recipe_steak_with_tomatoes, recipe_turkey)
=> `ingredient_raspberry` (Referenced in recipe_cake_cheesecake_raspberry, recipe_cake_raspberry_shortcake, recipe_pudding_raspberry)
=> `ingredient_sugar` (Referenced in comments for recipe_cake_honey_caramel, recipe_cake_mango_lemon_with_golden_berries, recipe_cake_mint_pistacchio, recipe_cake_raspberry_shortcake, recipe_creamcaramel_coffee, recipe_frappe, recipe_icecream_chocolate_caramel, recipe_ice_cream, recipe_croissant, recipe_steamed_buns, recipe_waffle_batter_or_mix)
=> `ingredient_mango` (Referenced in comments for recipe_cake_mango_lemon_with_golden_berries)
=> `ingredient_golden_berries` (Referenced in comments for recipe_cake_mango_lemon_with_golden_berries)
=> `ingredient_pistachios` (Referenced in comments for recipe_cake_mint_pistacchio)
=> `ingredient_potato` (Referenced in recipe_cheese_potato_soup, recipe_fish_with_potatoes_and_carrots, recipe_lamb_chop_with_potatoes, recipe_meat_soup)recipe_pork_belly_roasted, recipe_salmon_with_avocado_cucumber, recipe_skewer_vegetables, recipe_steak_cooked, recipe_steak_cooked_with_leafs, recipe_steak_with_tomatoes, recipe_taco, recipe_turkey, recipe_whole_leg)
=> `ingredient_root_beer` (Referenced in comments for recipe_chocolate_milk_shake_root_beer)
=> `ingredient_cocktail_mixer` (Referenced in comments for recipe_cocktail_fruit_iced, recipe_cocktail_lemon, recipe_cocktail)
=> `ingredient_cucumber` (Referenced in recipe_cucumber_salad, recipe_salmon_with_avocado_cucumber)
=> `ingredient_hotdog_bun` (Referenced in recipe_hotdog)


## Missing Equipment

The following equipment IDs/types are mentioned or implied in recipes but are not defined in `public/assets/data/equipment/equipment.json`:

=> `equipment_pot_or_saucepan` (Implied for boiling/simmering if `equipment_rice_cooker` or `equipment_sauce_station` are not suitable, e.g., recipe_cheese_potato_soup, recipe_coffee_with_milk)
=> `equipment_freezer` (Referenced in comments for recipe_icecream_chocolate_caramel, recipe_ice_cream, recipe_popsicle_chocolate)

## Missing CookingActionTypes

The following `CookingActionType` values are used in `recipes.json`'s `cookingSteps` but are not defined in the `CookingActionType` type alias in `src/types/models.ts`:

- `type: 'toast'` (Used in recipe_burger_cheese_double, recipe_burger, recipe_hotdog, recipe_sandwich, recipe_sub, recipe_waffles_with_honey, recipe_waffle_with_sauce)
- `type: 'mix'` (Used in recipe_chocolate_milk_shake_root_beer, recipe_cocktail, recipe_frappe, recipe_milkshake_chocolate, recipe_milkshake_desert_chocolate_sweet, recipe_popsicle_chocolate)
