import { startGameLoop, stopGameLoop, isGameLoopRunning } from '@/lib/gameLoop'
import { eventBus } from '@/lib/eventBus'
import { Game, Restaurant, Player, Customer } from '@/types/models'

// Mocks ---------------------------------------------------------------------

// Define types for mocked stores
interface MockGameActions {
    increaseTime: jest.Mock
    setGamePhase: jest.Mock
}
interface MockGameState {
    game: Partial<Game>
    actions: MockGameActions
}

interface MockRestaurantActions {
    addCustomerToQueue: jest.Mock
}
interface MockRestaurantState {
    restaurant: Partial<Restaurant> // Using Partial as the mock is simplified
    actions: MockRestaurantActions
}

interface MockPlayerActions {
    completeAction: jest.Mock
}
interface MockPlayerState {
    player: Partial<Player>
    actions: MockPlayerActions
}

jest.mock('@/state/game/gameStore', () => {
    const mockActions: MockGameActions = {
        increaseTime: jest.fn(),
        setGamePhase: jest.fn(),
    }
    const mockState: MockGameState = {
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
    const mockRestaurantState: MockRestaurantState = {
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
            setState: jest.fn((updater: (state: MockRestaurantState) => Partial<MockRestaurantState>) => {
                if (typeof updater === 'function') {
                    updater(mockRestaurantState)
                }
            }),
        },
    }
})

jest.mock('@/state/player/playerStore', () => {
    const mockPlayerState: MockPlayerState = {
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
    createCustomer: jest.fn((): Partial<Customer> => ({
        id: 'customer_mock',
        order: null,
        patience: 100,
        arrivalTime: Date.now(),
        status: 'waiting',
        satisfaction: 0,
        tip: 0,
    })),
}))

// Define an interface for the spy that includes the custom property
interface MockRaf extends jest.Mock {
    lastCallback?: FrameRequestCallback
}

// ---------------------------------------------------------------------------

describe('Game Loop', () => {
    const rafSpy: MockRaf = jest.fn()
    const cafSpy: jest.Mock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock requestAnimationFrame & cancelAnimationFrame
        global.requestAnimationFrame = rafSpy.mockImplementation((cb: FrameRequestCallback): number => {
            rafSpy.lastCallback = cb
            return 1
        })
        global.cancelAnimationFrame = cafSpy
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
        const mockGameStore = (jest.requireMock('@/state/game/gameStore')).useGameStore.getState()

        startGameLoop()
        expect(emitSpy).toHaveBeenCalledWith('game_started', { difficulty: mockGameStore.game.difficulty })

        stopGameLoop()
        expect(emitSpy).toHaveBeenCalledWith('game_paused', { elapsedTime: mockGameStore.game.timeElapsed })
    })
}) 