import { Dish, Recipe, CookingStep } from '@/types/models';

/**
 * Calculates the total preparation time for a given dish based on its recipe.
 * The time is summed from the durations of all cooking steps in the recipe.
 *
 * @param dish The dish for which to calculate the preparation time.
 * @param allRecipes An array of all available recipes in the game.
 * @returns The total preparation time in the recipe's defined units (e.g., seconds or minutes),
 *          or 0 if the recipe is not found or has no steps.
 */
export function calculateDishPreparationTime(
    dish: Dish | undefined,
    allRecipes: Recipe[] | undefined
): number {
    if (!dish || !allRecipes) {
        return 0;
    }

    const recipe = allRecipes.find(r => r.id === dish.recipeId);

    if (!recipe || !recipe.cookingSteps) {
        return 0;
    }

    return recipe.cookingSteps.reduce((totalDuration, step: CookingStep) => {
        return totalDuration + (step.duration || 0); // Ensure duration exists and is a number
    }, 0);
} 