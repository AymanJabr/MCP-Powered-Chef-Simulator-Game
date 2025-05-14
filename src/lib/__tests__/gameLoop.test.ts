import { startGameLoop, stopGameLoop, isGameLoopRunning } from '@/lib/gameLoop'
import { eventBus } from '@/lib/eventBus'

// Mocks ---------------------------------------------------------------------

jest.mock('@/state/game/gameStore', () => {
    const mockActions = {
        increaseTime: jest.fn(),
        setGamePhase: jest.fn(),
    }
    const mockState = {
        game: {
            isPaused: false,
            gamePhase: 'active',
            difficulty: 1,
            timeElapsed: 0,
        },
        actions: mockActions,
    }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurantState = {
        restaurant: {
            customerQueue: [],
            activeCustomers: [],
            funds: 100,
            customerCapacity: 8,
        },
        actions: {
            addCustomerToQueue: jest.fn(),
        },
    }

    return {
        useRestaurantStore: {
            getState: jest.fn(() => mockRestaurantState),
            setState: jest.fn((updater: any) => {
                if (typeof updater === 'function') {
                    updater(mockRestaurantState)
                }
            }),
        },
    }
})

jest.mock('@/state/player/playerStore', () => {
    const mockPlayerState = {
        player: {
            speed: 1,
            currentAction: null,
        },
        actions: {
            completeAction: jest.fn(),
        },
    }
    return {
        usePlayerStore: {
            getState: jest.fn(() => mockPlayerState),
        },
    }
})

jest.mock('@/lib/entityFactories', () => ({
    createCustomer: jest.fn(() => ({
        id: 'customer_mock',
        order: null,
        patience: 100,
        arrivalTime: Date.now(),
        status: 'waiting',
        satisfaction: 0,
        tip: 0,
    })),
}))

// ---------------------------------------------------------------------------

describe('Game Loop', () => {
    const rafSpy = jest.fn()
    const cafSpy = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock requestAnimationFrame & cancelAnimationFrame
        global.requestAnimationFrame = rafSpy.mockImplementation((cb: FrameRequestCallback) => {
            // Store the callback but do NOT execute immediately to avoid
            // unbounded recursion. Tests can invoke it manually if needed.
            (rafSpy as any).lastCallback = cb
            return 1
        }) as any
        global.cancelAnimationFrame = cafSpy as any
    })

    it('should start the game loop and schedule an animation frame', () => {
        startGameLoop()
        expect(global.requestAnimationFrame).toHaveBeenCalled()
        expect(isGameLoopRunning()).toBe(true)
    })

    it('should not start a second loop if already running', () => {
        startGameLoop()
        const callCount = (global.requestAnimationFrame as jest.Mock).mock.calls.length
        startGameLoop()
        expect(global.requestAnimationFrame).toHaveBeenCalledTimes(callCount)
    })

    it('should stop the game loop', () => {
        startGameLoop()
        stopGameLoop()
        expect(global.cancelAnimationFrame).toHaveBeenCalledWith(1)
        expect(isGameLoopRunning()).toBe(false)
    })

    it('should emit events on start and pause', () => {
        const emitSpy = jest.spyOn(eventBus, 'emit')
        startGameLoop()
        expect(emitSpy).toHaveBeenCalledWith('game_started')
        stopGameLoop()
        expect(emitSpy).toHaveBeenCalledWith('game_paused')
    })
}) 