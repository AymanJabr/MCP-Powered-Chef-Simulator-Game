import { resources } from '../resources'

jest.mock('@/state/game/restaurantStore', () => ({
    useRestaurantStore: {
        getState: jest.fn(() => ({
            restaurant: {
                funds: 500,
                reputation: 60,
                customerQueue: [],
                activeCustomers: [],
                activeOrders: [],
                inventory: [],
                name: 'Test',
                level: 1,
                customerCapacity: 8
            }
        }))
    }
}))

jest.mock('@/state/game/kitchenStore', () => ({
    useKitchenStore: {
        getState: jest.fn(() => ({
            prepStations: [],
            cookingStations: [],
            platingStations: [],
            activePreparations: {},
            activeCookingProcesses: [],
            activePlating: {}
        }))
    }
}))

jest.mock('@/state/game/gameStore', () => ({
    useGameStore: {
        getState: jest.fn(() => ({
            game: {
                gameMode: 'manual',
                gamePhase: 'preGame',
                difficulty: 1,
                timeElapsed: 0,
                performanceMetrics: {} as any
            }
        }))
    }
}))

describe('MCP Resources', () => {
    it('should export resources array with entries', () => {
        expect(Array.isArray(resources)).toBe(true)
        expect(resources.length).toBeGreaterThan(0)
    })

    it('each resource should return data without throwing', () => {
        resources.forEach((r) => {
            expect(() => r.get()).not.toThrow()
        })
    })

    it('performance_metrics resource merges game and mcp metrics', () => {
        const perfRes = resources.find((r) => r.name === 'performance_metrics')!
        const data = perfRes.get()
        expect(data).toHaveProperty('gameMetrics')
        expect(data).toHaveProperty('mcpMetrics')
    })
}) 