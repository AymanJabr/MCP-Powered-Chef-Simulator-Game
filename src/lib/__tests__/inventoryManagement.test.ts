import { purchaseIngredient, consumeIngredient } from '@/lib/inventoryManagement'
import { eventBus } from '@/lib/eventBus'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurantState = {
        restaurant: {
            inventory: [
                { id: 'ing_1', name: 'Tomato', quantity: 10, cost: 2 },
                { id: 'ing_2', name: 'Cheese', quantity: 3, cost: 5 },
            ],
            funds: 50,
        },
        actions: {
            updateFunds: jest.fn((amount: number) => {
                mockRestaurantState.restaurant.funds += amount
            }),
            updateIngredientQuantity: jest.fn((id: string, change: number) => {
                const ing = mockRestaurantState.restaurant.inventory.find((i) => i.id === id)
                if (ing) ing.quantity += change
            }),
        },
    }
    return {
        useRestaurantStore: {
            getState: jest.fn(() => mockRestaurantState),
        },
    }
})

jest.mock('@/lib/eventBus', () => ({
    eventBus: { emit: jest.fn() },
}))

import { useRestaurantStore } from '@/state/game/restaurantStore'

// ---------------------------------------------------------------------------
const restaurantState = (useRestaurantStore as any).getState()

// ---------------------------------------------------------------------------
describe('Inventory Management System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset funds & quantities
        restaurantState.restaurant.funds = 50
        restaurantState.restaurant.inventory[0].quantity = 10
        restaurantState.restaurant.inventory[1].quantity = 3
    })

    describe('purchaseIngredient', () => {
        it('successfully purchases when funds sufficient', () => {
            const res = purchaseIngredient('ing_1', 5)
            expect(res.success).toBe(true)
            expect(restaurantState.actions.updateFunds).toHaveBeenCalledWith(-10) // 5*2
            expect(restaurantState.actions.updateIngredientQuantity).toHaveBeenCalledWith('ing_1', 5)
            expect(eventBus.emit).toHaveBeenCalledWith('ingredient_purchased', expect.any(Object))
        })

        it('fails when funds insufficient', () => {
            const res = purchaseIngredient('ing_2', 20) // would cost 100
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/Insufficient funds/)
            expect(restaurantState.actions.updateFunds).not.toHaveBeenCalled()
        })

        it('fails when ingredient not found', () => {
            const res = purchaseIngredient('nonexistent', 1)
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/not found/)
        })
    })

    describe('consumeIngredient', () => {
        it('consumes ingredient when quantity sufficient', () => {
            const res = consumeIngredient('ing_1', 4)
            expect(res.success).toBe(true)
            expect(restaurantState.actions.updateIngredientQuantity).toHaveBeenCalledWith('ing_1', -4)
            expect(eventBus.emit).toHaveBeenCalledWith('ingredient_used', expect.any(Object))
        })

        it('fails when insufficient quantity', () => {
            const res = consumeIngredient('ing_2', 10)
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/Insufficient quantity/)
            expect(restaurantState.actions.updateIngredientQuantity).not.toHaveBeenCalled()
        })

        it('fails when ingredient not found', () => {
            const res = consumeIngredient('unknown', 1)
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/not found/)
        })
    })
}) 