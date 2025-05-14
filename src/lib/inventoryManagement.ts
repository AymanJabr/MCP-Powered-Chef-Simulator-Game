import { useRestaurantStore } from '@/state/game/restaurantStore'
import { eventBus } from './eventBus'

// ---------------------------------------------------------------------------
// Inventory Management System
// ---------------------------------------------------------------------------
// Handles purchasing and consumption of ingredients, updating restaurant funds
// and emitting events for UI & analytics.
// ---------------------------------------------------------------------------

export interface InventoryResult {
    success: boolean
    message: string
    remainingFunds?: number
    newQuantity?: number
    remainingQuantity?: number
}

/**
 * Purchase additional quantity of an ingredient.
 * Returns an object describing the result.
 */
export function purchaseIngredient(ingredientId: string, quantity: number): InventoryResult {
    if (quantity <= 0) {
        return { success: false, message: 'Quantity must be greater than 0' }
    }

    const restaurantState = useRestaurantStore.getState()
    const { inventory, funds } = restaurantState.restaurant

    const ingredient = inventory.find((i) => i.id === ingredientId)
    if (!ingredient) {
        return { success: false, message: 'Ingredient not found' }
    }

    const totalCost = ingredient.cost * quantity
    if (funds < totalCost) {
        return { success: false, message: 'Insufficient funds' }
    }

    // Perform transaction
    restaurantState.actions.updateFunds(-totalCost)
    restaurantState.actions.updateIngredientQuantity(ingredientId, quantity)

    eventBus.emit('ingredient_purchased', {
        ingredientId,
        quantity,
        totalCost,
        remainingFunds: funds - totalCost,
    })

    return {
        success: true,
        message: `Purchased ${quantity} ${ingredient.name}`,
        newQuantity: ingredient.quantity + quantity,
        remainingFunds: funds - totalCost,
    }
}

/**
 * Consume (use) a quantity of an ingredient during cooking/preparation.
 */
export function consumeIngredient(ingredientId: string, quantity = 1): InventoryResult {
    if (quantity <= 0) {
        return { success: false, message: 'Quantity must be greater than 0' }
    }

    const restaurantState = useRestaurantStore.getState()
    const ingredient = restaurantState.restaurant.inventory.find((i) => i.id === ingredientId)

    if (!ingredient) {
        return { success: false, message: 'Ingredient not found' }
    }

    if (ingredient.quantity < quantity) {
        return { success: false, message: 'Insufficient quantity' }
    }

    // Update store quantity
    restaurantState.actions.updateIngredientQuantity(ingredientId, -quantity)

    eventBus.emit('ingredient_used', {
        ingredientId,
        quantity,
        remainingQuantity: ingredient.quantity - quantity,
    })

    return {
        success: true,
        message: `Used ${quantity} ${ingredient.name}`,
        remainingQuantity: ingredient.quantity - quantity,
    }
} 