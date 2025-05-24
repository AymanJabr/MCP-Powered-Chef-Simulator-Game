import { calculateInitialPatience, reducePatience } from '@/lib/customerPatience'
import { Game } from '@/types/models'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Define types for the mocked game store state
interface MockPatienceGameActions {
    // No actions are directly used by the functions under test from this mock's actions
    // So, an empty object or Record<string, jest.Mock> would be fine.
    // For consistency, let's use Record<string, jest.Mock> for potential future use.
    [key: string]: jest.Mock;
}

interface MockPatienceGameState {
    game: Partial<Game>;
    actions: MockPatienceGameActions;
}

jest.mock('@/state/game/gameStore', () => {
    const mockState: MockPatienceGameState = {
        game: {
            difficulty: 1,
        },
        actions: {},
    }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

jest.mock('@/lib/difficultyScaling', () => ({
    getCurrentDifficultyModifiers: jest.fn(() => ({
        customerPatienceMod: 1,
        orderFrequencyMod: 1,
        cookingDifficultyMod: 1,
    })),
}))

jest.mock('@/lib/eventBus', () => ({
    eventBus: { emit: jest.fn() },
}))

import { useGameStore } from '@/state/game/gameStore'
import { getCurrentDifficultyModifiers } from '@/lib/difficultyScaling'
import { eventBus } from '@/lib/eventBus'

// ---------------------------------------------------------------------------
const mockAppGameStore = useGameStore
const store = mockAppGameStore.getState()
const modsMock = getCurrentDifficultyModifiers as jest.Mock

// ---------------------------------------------------------------------------
describe('Customer Patience System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        store.game.difficulty = 1
        modsMock.mockReturnValue({
            customerPatienceMod: 0.95,
            orderFrequencyMod: 1.1,
            cookingDifficultyMod: 1.05,
        })
    })

    describe('calculateInitialPatience', () => {
        it('calculates baseline patience from difficulty modifiers', () => {
            const patience = calculateInitialPatience()
            expect(patience).toBeCloseTo(95)
        })

        it('never falls below 40 of the baseline due to clamping', () => {
            // High difficulty – modifiers should be clamped to 0.4
            store.game.difficulty = 100
            modsMock.mockReturnValue({
                customerPatienceMod: 0.4,
                orderFrequencyMod: 11,
                cookingDifficultyMod: 6.5,
            })
            const patience = calculateInitialPatience()
            expect(patience).toBe(40)
        })
    })

    describe('reducePatience', () => {
        it('reduces patience faster at higher difficulties', () => {
            const initial = 100
            const delta = 10

            // diff 1
            store.game.difficulty = 1
            const patienceNormal = reducePatience(initial, delta)

            // diff 10
            store.game.difficulty = 10
            const patienceHard = reducePatience(initial, delta)

            expect(patienceHard).toBeLessThan(patienceNormal)
        })

        it('emits critical event when patience below 30', () => {
            store.game.difficulty = 5 // decay per second = 3.5
            const newPatience = reducePatience(35, 2, 'cust_1') // reduction 7 -> 28
            expect(newPatience).toBeLessThan(30)
            expect(eventBus.emit).toHaveBeenCalledWith('customerPatienceCritical', expect.objectContaining({ customerId: 'cust_1', patience: newPatience }))
        })

        it('emits customerLeft when patience hits zero', () => {
            store.game.difficulty = 5
            const newPatience = reducePatience(5, 5, 'cust_2') // should reach 0
            expect(newPatience).toBe(0)
            expect(eventBus.emit).toHaveBeenCalledWith('customerLeft', expect.objectContaining({ customerId: 'cust_2' }))
        })
    })
}) 