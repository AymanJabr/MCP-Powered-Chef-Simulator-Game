import { updateDifficulty, getCurrentDifficultyModifiers } from '@/lib/difficultyScaling'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@/state/game/gameStore', () => {
    const mockState = {
        game: {
            timeElapsed: 0,
            difficulty: 1,
        },
        actions: {
            setDifficulty: jest.fn((d: number) => {
                mockState.game.difficulty = d
            }),
        },
    }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

import { useGameStore } from '@/state/game/gameStore'

// ---------------------------------------------------------------------------
const store = (useGameStore as any).getState()

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