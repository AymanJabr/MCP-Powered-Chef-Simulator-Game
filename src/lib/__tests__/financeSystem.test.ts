import { processPayment, calculateDailyExpenses } from '@/lib/financeSystem'
import { eventBus } from '@/lib/eventBus'
import { Order, Dish, Recipe } from '@/types/models'

// ---------------------------------------------------------------------------
// Mock restaurant store
// ---------------------------------------------------------------------------

// Define types for the mocked restaurant store
interface MockFinanceActions {
    updateFunds: jest.Mock
    completeOrder: jest.Mock
}

interface MockRestaurantForFinance {
    funds: number
    activeOrders: Partial<Order>[]
    // Other Restaurant properties if needed by tests
}

interface MockFinanceRestaurantState {
    restaurant: MockRestaurantForFinance
    actions: MockFinanceActions
}

jest.mock('@/state/game/restaurantStore', () => {
    const now = Date.now()

    // Define full Dish objects for the mock
    const mockDish1: Dish = {
        id: 'dish_1', name: 'Burger', basePrice: 20,
        recipeId: 'r1',
        cookingDifficulty: 1, plateAppearance: 5
    }
    const mockDish2: Dish = {
        id: 'dish_2', name: 'Pizza', basePrice: 15,
        recipeId: 'r2',
        cookingDifficulty: 1, plateAppearance: 4
    }

    const mockRestaurantState: MockFinanceRestaurantState = {
        restaurant: {
            funds: 100,
            activeOrders: [
                {
                    id: 'order_1',
                    dish: mockDish1,
                    status: 'served',
                    qualityScore: 80,
                    startTime: now - 30000,
                    completionTime: now - 5000,
                    customerId: 'cust_mock_1',
                    customizations: [],
                    tip: 0
                },
                {
                    id: 'order_2',
                    dish: mockDish2,
                    status: 'cooking',
                    qualityScore: 0,
                    startTime: now - 20000,
                    completionTime: null,
                    customerId: 'cust_mock_2',
                    customizations: [],
                    tip: 0
                },
            ],
        },
        actions: {
            updateFunds: jest.fn((delta: number) => {
                mockRestaurantState.restaurant.funds += delta
            }),
            completeOrder: jest.fn(),
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

const mockAppRestaurantStore = useRestaurantStore
const restaurantState = mockAppRestaurantStore.getState()

// ---------------------------------------------------------------------------
describe('Finance System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        restaurantState.restaurant.funds = 100
    })

    describe('processPayment', () => {
        it('processes payment for served orders', () => {
            const res = processPayment('order_1')
            expect(res.success).toBe(true)
            expect(res.total).toBeGreaterThan(res.basePrice!)
            expect(restaurantState.actions.updateFunds).toHaveBeenCalledWith(res.total!)
            expect(restaurantState.actions.completeOrder).toHaveBeenCalledWith('order_1', res.tip)
            expect(eventBus.emit).toHaveBeenCalledWith('order_completed', expect.any(Object))
        })

        it('fails if order not served', () => {
            const res = processPayment('order_2')
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/not yet served/)
            expect(restaurantState.actions.updateFunds).not.toHaveBeenCalled()
        })

        it('fails if order not found', () => {
            const res = processPayment('unknown')
            expect(res.success).toBe(false)
            expect(res.message).toMatch(/not found/)
        })
    })

    describe('calculateDailyExpenses', () => {
        it('deducts fixed costs and emits funds change', () => {
            const beforeFunds = restaurantState.restaurant.funds
            const result = calculateDailyExpenses()
            expect(result.fixedCosts).toBeGreaterThan(0)
            expect(restaurantState.actions.updateFunds).toHaveBeenCalledWith(-result.fixedCosts)
            expect(eventBus.emit).toHaveBeenCalledWith('funds_changed', expect.any(Object))
            expect(restaurantState.restaurant.funds).toBe(beforeFunds - result.fixedCosts)
        })
    })
}) 