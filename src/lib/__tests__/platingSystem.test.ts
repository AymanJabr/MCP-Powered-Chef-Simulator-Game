import { startPlating, addItem, addGarnish, checkPlating, completePlating } from '@/lib/platingSystem'
import { eventBus } from '@/lib/eventBus'
import { PlatingStation, PlatingTask, Order, Dish, Recipe } from '@/types/models'

// Define interfaces for the mocked kitchen store actions and state related to plating
interface MockKitchenPlatingActions {
    startPlating: jest.Mock
    addItemToPlate: jest.Mock
    addGarnishToPlate: jest.Mock
    completePlating: jest.Mock
}

interface MockKitchenPlatingState {
    platingStations: PlatingStation[]
    activePlating: Record<string, PlatingTask>
    actions: MockKitchenPlatingActions
}

// Define interfaces for the mocked restaurant store state
interface MockRestaurantStateWithOrders {
    restaurant: {
        activeOrders: Partial<Order>[]
    }
}

jest.mock('@/state/game/kitchenStore', () => {
    const mockKitchenState: MockKitchenPlatingState = {
        platingStations: [{ id: 'plating_1', status: 'idle' }],
        activePlating: {},
        actions: {
            startPlating: jest.fn((stationId: string, orderId: string, plateId: string) => {
                const task: PlatingTask = {
                    id: plateId,
                    stationId,
                    orderId,
                    items: [],
                    garnishes: [],
                    startTime: Date.now(),
                    status: 'in_progress',
                }
                mockKitchenState.activePlating[plateId] = task
                const st = mockKitchenState.platingStations.find((s) => s.id === stationId)
                if (st) st.status = 'busy'
            }),
            addItemToPlate: jest.fn((plateId: string, itemId: string) => {
                if (mockKitchenState.activePlating[plateId]) {
                    mockKitchenState.activePlating[plateId].items.push(itemId)
                }
            }),
            addGarnishToPlate: jest.fn((plateId: string, garnishId: string) => {
                if (mockKitchenState.activePlating[plateId]) {
                    mockKitchenState.activePlating[plateId].garnishes.push(garnishId)
                }
            }),
            completePlating: jest.fn((plateId: string, quality: number) => {
                if (mockKitchenState.activePlating[plateId]) {
                    mockKitchenState.activePlating[plateId].status = 'completed'
                    mockKitchenState.activePlating[plateId].qualityScore = quality
                    const station = mockKitchenState.platingStations.find(s => s.id === mockKitchenState.activePlating[plateId].stationId)
                    if (station) station.status = 'idle'
                }
            }),
        },
    }
    return { useKitchenStore: { getState: jest.fn(() => mockKitchenState) } }
})

jest.mock('@/state/game/restaurantStore', () => {
    // Simplified Dish and Recipe for the mock
    const mockDish: Partial<Dish> = {
        id: 'dish_1',
        name: 'Salad',
        basePrice: 10,
        recipe: { id: 'recipe_1', ingredients: ['item_a', 'item_b'], cookingSteps: [] } as Recipe,
    }
    const mockOrder: Partial<Order> = {
        id: 'order_1',
        dish: mockDish as Dish, // Cast to full Dish as it's expected by Order type
        status: 'cooking',
    }
    const mockRestaurantState: MockRestaurantStateWithOrders = {
        restaurant: {
            activeOrders: [mockOrder],
        },
    }
    return { useRestaurantStore: { getState: jest.fn(() => mockRestaurantState) } }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useKitchenStore } from '@/state/game/kitchenStore'

// Correctly type the mocked store and its getState method
const mockAppKitchenStore = useKitchenStore
const kitchenState = mockAppKitchenStore.getState()


describe('Plating System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        if (kitchenState.platingStations[0]) { // Ensure station exists
            kitchenState.platingStations[0].status = 'idle'
        }
        kitchenState.activePlating = {}
    })

    it('starts plating on available station', () => {
        const res = startPlating('order_1')
        expect(res.success).toBe(true)
        expect(kitchenState.actions.startPlating).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('platingStarted', expect.any(Object))
    })

    it('fails when no station free', () => {
        if (kitchenState.platingStations[0]) { // Ensure station exists
            kitchenState.platingStations[0].status = 'busy'
        }
        const res = startPlating('order_1')
        expect(res.success).toBe(false)
    })

    it('adds items and garnishes, completes plating', () => {
        const { platingId } = startPlating('order_1')
        expect(platingId).toBeDefined() // Ensure platingId is defined
        addItem(platingId!, 'item_a')
        addItem(platingId!, 'item_b')
        addGarnish(platingId!, 'garn_1')
        const status = checkPlating(platingId!)
        expect(status.isComplete).toBe(true)

        const res = completePlating(platingId!)
        expect(res.success).toBe(true)
        expect(kitchenState.actions.completePlating).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('platingCompleted', expect.any(Object))
    })
}) 