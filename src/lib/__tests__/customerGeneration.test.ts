import { shouldGenerateCustomer, generateCustomer } from '@/lib/customerGeneration'
import { eventBus } from '@/lib/eventBus'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@/state/game/gameStore', () => {
    const mockState = { game: { difficulty: 1 }, actions: {} }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurantState = {
        restaurant: {
            customerQueue: [] as any[],
            activeCustomers: [] as any[],
        },
        actions: {
            addCustomerToQueue: jest.fn(),
        },
    }
    return {
        useRestaurantStore: {
            getState: jest.fn(() => mockRestaurantState),
        },
    }
})

jest.mock('@/lib/entityFactories', () => ({
    createCustomer: jest.fn((partial = {}) => ({
        id: 'cust_mock',
        order: null,
        patience: 100,
        arrivalTime: Date.now(),
        status: 'waiting',
        satisfaction: 0,
        tip: 0,
        ...partial,
    })),
}))

jest.mock('@/lib/eventBus', () => ({
    eventBus: {
        emit: jest.fn(),
    },
}))

// Pull mocked modules
import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { createCustomer } from '@/lib/entityFactories'

// ---------------------------------------------------------------------------
const gameState = (useGameStore as any).getState()
const restaurantState = (useRestaurantStore as any).getState()

// Helper to set Math.random deterministically
const mathRandomSpy = jest.spyOn(global.Math, 'random')

// ---------------------------------------------------------------------------
describe('Customer Generation System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        restaurantState.restaurant.customerQueue.length = 0
        mathRandomSpy.mockReturnValue(0.01)
        gameState.game.difficulty = 1
    })

    describe('shouldGenerateCustomer', () => {
        it('returns true when probability condition met', () => {
            const res = shouldGenerateCustomer(1)
            expect(res).toBe(true)
        })

        it('returns false when queue is full', () => {
            // populate queue
            restaurantState.restaurant.customerQueue = new Array(20).fill({})
            const res = shouldGenerateCustomer(1)
            expect(res).toBe(false)
        })
    })

    describe('generateCustomer', () => {
        it('creates and enqueues a customer', () => {
            const customer = generateCustomer()
            expect(createCustomer).toHaveBeenCalled()
            expect(restaurantState.actions.addCustomerToQueue).toHaveBeenCalledWith(customer)
            expect(eventBus.emit).toHaveBeenCalledWith('customer_arrived', { customerId: customer.id })
        })

        it('reduces patience as difficulty increases', () => {
            const basePatience = generateCustomer().patience
            gameState.game.difficulty = 5
            const harderPatience = generateCustomer().patience
            expect(harderPatience).toBeLessThan(basePatience)
        })
    })
})

