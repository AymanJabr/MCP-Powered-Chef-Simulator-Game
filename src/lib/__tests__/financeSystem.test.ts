import { processPayment, calculateDailyExpenses } from '@/lib/financeSystem'
import { eventBus } from '@/lib/eventBus'

// ---------------------------------------------------------------------------
// Mock restaurant store
// ---------------------------------------------------------------------------

jest.mock('@/state/game/restaurantStore', () => {
    const now = Date.now()
    const mockRestaurantState = {
        restaurant: {
            funds: 100,
            activeOrders: [
                {
                    id: 'order_1',
                    dish: { id: 'dish_1', name: 'Burger', basePrice: 20 },
                    status: 'served',
                    qualityScore: 80,
                    startTime: now - 30000, // 30s ago
                    completionTime: now - 5000, // 5s ago
                },
                {
                    id: 'order_2',
                    dish: { id: 'dish_2', name: 'Pizza', basePrice: 15 },
                    status: 'cooking',
                    qualityScore: 0,
                    startTime: now - 20000,
                    completionTime: null,
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

const restaurantState = (useRestaurantStore as any).getState()

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