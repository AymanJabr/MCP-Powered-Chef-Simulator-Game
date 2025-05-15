import { startPlating, addItem, addGarnish, checkPlating, completePlating } from '@/lib/platingSystem'
import { eventBus } from '@/lib/eventBus'

jest.mock('@/state/game/kitchenStore', () => {
    const mockKitchenState = {
        platingStations: [{ id: 'plating_1', status: 'idle' }],
        activePlating: {} as any,
        actions: {
            startPlating: jest.fn((stationId: string, orderId: string, plateId: string) => {
                mockKitchenState.activePlating[plateId] = {
                    id: plateId,
                    stationId,
                    orderId,
                    items: [],
                    garnishes: [],
                    startTime: Date.now(),
                    status: 'in_progress',
                }
                const st = mockKitchenState.platingStations.find((s) => s.id === stationId)
                if (st) st.status = 'busy'
            }),
            addItemToPlate: jest.fn((plateId: string, itemId: string) => {
                mockKitchenState.activePlating[plateId].items.push(itemId)
            }),
            addGarnishToPlate: jest.fn((plateId: string, garnishId: string) => {
                mockKitchenState.activePlating[plateId].garnishes.push(garnishId)
            }),
            completePlating: jest.fn((plateId: string, quality: number) => {
                mockKitchenState.activePlating[plateId].status = 'completed'
                mockKitchenState.activePlating[plateId].qualityScore = quality
                mockKitchenState.platingStations[0].status = 'idle'
            }),
        },
    }
    return { useKitchenStore: { getState: jest.fn(() => mockKitchenState) } }
})

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurantState = {
        restaurant: {
            activeOrders: [
                {
                    id: 'order_1',
                    dish: {
                        id: 'dish_1',
                        name: 'Salad',
                        basePrice: 10,
                        recipe: { ingredients: ['item_a', 'item_b'], cookingSteps: [] },
                    },
                    status: 'cooking',
                },
            ],
        },
    }
    return { useRestaurantStore: { getState: jest.fn(() => mockRestaurantState) } }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useKitchenStore } from '@/state/game/kitchenStore'
const kitchenState = (useKitchenStore as any).getState()


describe('Plating System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        kitchenState.platingStations[0].status = 'idle'
        kitchenState.activePlating = {}
    })

    it('starts plating on available station', () => {
        const res = startPlating('order_1')
        expect(res.success).toBe(true)
        expect(kitchenState.actions.startPlating).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('platingStarted', expect.any(Object))
    })

    it('fails when no station free', () => {
        kitchenState.platingStations[0].status = 'busy'
        const res = startPlating('order_1')
        expect(res.success).toBe(false)
    })

    it('adds items and garnishes, completes plating', () => {
        const { platingId } = startPlating('order_1')
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