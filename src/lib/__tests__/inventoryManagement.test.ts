import { purchaseIngredient, consumeIngredient } from '@/lib/inventoryManagement'
import { eventBus } from '@/lib/eventBus'
import { Ingredient } from '@/types/models'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Define types for the mocked restaurant store
interface MockInventoryRestaurantActions {
    updateFunds: jest.Mock
    updateIngredientQuantity: jest.Mock
}

interface MockInventoryRestaurantState {
    restaurant: {
        inventory: Ingredient[]
        funds: number
        // Add other properties from Restaurant if they are used by the functions under test,
        // or use Partial<Restaurant> if only a subset is relevant.
        // For this mock, only inventory and funds seem directly relevant from the 'restaurant' object itself.
    }
    actions: MockInventoryRestaurantActions
}

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurantState: MockInventoryRestaurantState = {
        restaurant: {
            inventory: [
                { id: 'ing_1', name: 'Tomato', quantity: 10, cost: 2, category: 'vegetable', quality: 0 },
                { id: 'ing_2', name: 'Cheese', quantity: 3, cost: 5, category: 'dairy', quality: 0 },
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
const mockAppRestaurantStore = useRestaurantStore
const restaurantState = mockAppRestaurantStore.getState()

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