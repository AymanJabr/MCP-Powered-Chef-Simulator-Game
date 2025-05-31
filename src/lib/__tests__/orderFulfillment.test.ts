import { serveOrder, checkOrderStatus, rushOrder } from '@/lib/orderFulfillment'
import { eventBus } from '@/lib/eventBus'
import { Order, Customer, Dish, Recipe } from '@/types/models'

// Define types for the mocked restaurant store
interface MockFulfillmentRestaurantActions {
    updateOrderStatus: jest.Mock
    updateCustomerSatisfaction: jest.Mock
}

// Define a more specific structure for the mocked restaurant object within the state
interface MockRestaurantForFulfillment {
    activeOrders: Order[]
    activeCustomers: Partial<Customer>[] // Customers can be partial, especially their nested order
    // Add other Restaurant properties if used by functions under test
}

interface MockFulfillmentRestaurantState {
    restaurant: MockRestaurantForFulfillment
    actions: MockFulfillmentRestaurantActions
}

jest.mock('@/state/game/restaurantStore', () => {
    const now = Date.now()
    // Construct mock objects that conform to the Order and Customer types more closely.
    const mockDish1: Dish = {
        id: 'dish_1', name: 'Burger', basePrice: 12,
        recipeId: 'r1',
        cookingDifficulty: 1, plateAppearance: 0
    }
    const mockDish2: Dish = {
        id: 'dish_2', name: 'Salad', basePrice: 10,
        recipeId: 'r2',
        cookingDifficulty: 1, plateAppearance: 0
    }

    const mockActiveOrders: Order[] = [
        {
            id: 'order_1',
            customerId: 'cust1',
            dish: mockDish1,
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
            dish: mockDish2,
            customizations: [],
            status: 'cooking',
            startTime: now - 10000,
            completionTime: null,
            qualityScore: 0,
            tip: 0,
        },
    ]

    // Make customer orders more compliant with the Order type
    const mockCustomerOrder1: Order = { ...mockActiveOrders[0] }; // Use a full order for cust1
    const mockCustomerOrder2: Order = { ...mockActiveOrders[1] }; // Use a full order for cust2

    const mockActiveCustomers: Partial<Customer>[] = [
        { id: 'cust1', order: mockCustomerOrder1, patience: 80, arrivalTime: now, status: 'waiting', satisfaction: 0, tip: 0 },
        { id: 'cust2', order: mockCustomerOrder2, patience: 90, arrivalTime: now, status: 'waiting', satisfaction: 0, tip: 0 },
    ]

    const mockRestaurantState: MockFulfillmentRestaurantState = {
        restaurant: {
            activeOrders: mockActiveOrders,
            activeCustomers: mockActiveCustomers,
        },
        actions: {
            updateOrderStatus: jest.fn(),
            updateCustomerSatisfaction: jest.fn(),
        },
    }
    return { useRestaurantStore: { getState: jest.fn(() => mockRestaurantState) } }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useRestaurantStore } from '@/state/game/restaurantStore'

// Correctly type the mocked store and its getState method
const mockAppRestaurantStore = useRestaurantStore
const restaurantState = mockAppRestaurantStore.getState()


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