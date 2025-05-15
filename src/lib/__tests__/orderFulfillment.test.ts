import { serveOrder, checkOrderStatus, rushOrder } from '@/lib/orderFulfillment'
import { eventBus } from '@/lib/eventBus'

jest.mock('@/state/game/restaurantStore', () => {
    const now = Date.now()
    const mockRestaurant = {
        restaurant: {
            activeOrders: [
                {
                    id: 'order_1',
                    customerId: 'cust1',
                    dish: { id: 'dish_1', name: 'Burger', basePrice: 12, recipe: { ingredients: [] }, cookingDifficulty: 1, preparationTime: 0, plateAppearance: 0 },
                    customizations: [],
                    status: 'plated',
                    startTime: now - 30000,
                    completionTime: now - 5000,
                    qualityScore: 90,
                    tip: 0,
                },
                {
                    id: 'order_2',
                    customerId: 'cust2',
                    dish: { id: 'dish_2', name: 'Salad', basePrice: 10, recipe: { ingredients: [] }, cookingDifficulty: 1, preparationTime: 0, plateAppearance: 0 },
                    customizations: [],
                    status: 'cooking',
                    startTime: now - 10000,
                    completionTime: null,
                    qualityScore: 0,
                    tip: 0,
                },
            ],
            activeCustomers: [
                { id: 'cust1', order: { id: 'order_1' }, patience: 80, arrivalTime: now, status: 'waiting', satisfaction: 0, tip: 0 },
                { id: 'cust2', order: { id: 'order_2' }, patience: 90, arrivalTime: now, status: 'waiting', satisfaction: 0, tip: 0 },
            ],
        },
        actions: {
            updateOrderStatus: jest.fn(),
            updateCustomerSatisfaction: jest.fn(),
        },
    }
    return { useRestaurantStore: { getState: jest.fn(() => mockRestaurant) } }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useRestaurantStore } from '@/state/game/restaurantStore'
const restaurantState = (useRestaurantStore as any).getState()


describe('Order Fulfillment System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('serves plated order and updates satisfaction', () => {
        const res = serveOrder('order_1')
        expect(res.success).toBe(true)
        expect(restaurantState.actions.updateOrderStatus).toHaveBeenCalledWith('order_1', 'served')
        expect(restaurantState.actions.updateCustomerSatisfaction).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('orderServed', expect.any(Object))
    })

    it('fails serving order not plated', () => {
        const res = serveOrder('order_2')
        expect(res.success).toBe(false)
    })

    it('checks order status', () => {
        const info = checkOrderStatus('order_2')!
        expect(info.orderId).toBe('order_2')
        expect(info.status).toBe('cooking')
        expect(info.isPriority).toBeFalsy()
    })

    it('rushes an order', () => {
        const result = rushOrder('order_2')
        expect(result.success).toBe(true)
        expect(result.isPriority).toBe(true)
        const info = checkOrderStatus('order_2')!
        expect(info.isPriority).toBe(true)
        expect(eventBus.emit).toHaveBeenCalledWith('orderRushed', { orderId: 'order_2' })
    })
}) 