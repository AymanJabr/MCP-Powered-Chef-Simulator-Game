import { updateDifficulty, getCurrentDifficultyModifiers } from '@/lib/difficultyScaling'
import { Game } from '@/types/models'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Define types for the mocked game store state
interface MockDifficultyGameActions {
    setDifficulty: jest.Mock
}

interface MockDifficultyGameState {
    game: Partial<Game>
    actions: MockDifficultyGameActions
}

jest.mock('@/state/game/gameStore', () => {
    const mockActions: MockDifficultyGameActions = {
        setDifficulty: jest.fn((d: number) => {
            // This reference to mockState inside the mock itself is a bit tricky,
            // ensure mockState is defined in a scope accessible here if this pattern is kept.
            // For now, assuming it works due to closure or direct definition context.
            // A safer way might be to update a shared, mutable mockState object.
            // However, to adhere to existing structure and fix typing:
            (mockState as MockDifficultyGameState).game.difficulty = d
        }),
    }
    const mockState: MockDifficultyGameState = {
        game: {
            timeElapsed: 0,
            difficulty: 1,
        },
        actions: mockActions,
    }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

import { useGameStore } from '@/state/game/gameStore'

// ---------------------------------------------------------------------------
const mockAppGameStore = useGameStore
const store = mockAppGameStore.getState()

// ---------------------------------------------------------------------------
describe('Difficulty Scaling System (uncapped)', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset state for each test
        store.game.timeElapsed = 0
        store.game.difficulty = 1
    })

    it('increases difficulty linearly over time without an upper bound', () => {
        // 2 hours => 7200 seconds => 120 minutes
        store.game.timeElapsed = 7200
        const diff = updateDifficulty()

        // Expected: 1 + 120 * 0.1 = 13
        expect(diff).toBeCloseTo(13)
        expect(store.actions.setDifficulty).toHaveBeenCalledWith(13)
    })

    it('does not call setDifficulty if difficulty unchanged', () => {
        store.game.timeElapsed = 0
        store.game.difficulty = 1
        updateDifficulty()
        expect(store.actions.setDifficulty).not.toHaveBeenCalled()
    })

    it('clamps customer patience modifier but allows other modifiers to grow', () => {
        // Set a very high difficulty
        store.game.difficulty = 100
        const mods = getCurrentDifficultyModifiers()

        // Patience mod should be clamped at 0.4 (minimum)
        expect(mods.customerPatienceMod).toBe(0.4)

        // Other mods should scale linearly
        expect(mods.orderFrequencyMod).toBeCloseTo(1 + 100 * 0.1)
        expect(mods.cookingDifficultyMod).toBeCloseTo(1 + 100 * 0.05)
    })
}) 