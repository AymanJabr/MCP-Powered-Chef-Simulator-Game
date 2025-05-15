import { useGameStore } from '@/state/game/gameStore'

export interface DifficultyModifiers {
    customerPatienceMod: number // multiply patience
    orderFrequencyMod: number // multiply spawn prob
    cookingDifficultyMod: number // multiply cooking error chance
}

const DIFFICULTY_INCREMENT = 0.1

/**
 * Update difficulty based on elapsed time (called each minute).
 *
 * The difficulty increases linearly over time without an upper bound, but
 * downstream systems (e.g. modifiers) are clamped to sensible limits so the
 * game never becomes outright impossible. This ensures continual challenge
 * progression while avoiding negative or nonsensical values such as negative
 * patience seconds.
 */
export function updateDifficulty(): number {
    const state = useGameStore.getState()
    const minutes = Math.floor(state.game.timeElapsed / 60)
    const newDiff = 1 + minutes * DIFFICULTY_INCREMENT

    if (newDiff !== state.game.difficulty) {
        state.actions.setDifficulty(newDiff)
    }

    return newDiff
}

export function getCurrentDifficultyModifiers(): DifficultyModifiers {
    const diff = useGameStore.getState().game.difficulty
    return {
        // Never let patience drop below 40% of the baseline so waiting time
        // cannot become negative or too small to react.
        customerPatienceMod: Math.max(0.4, 1 - diff * 0.05),
        // Order frequency and cooking difficulty scale linearly with
        // difficulty to keep pressure on the player.
        orderFrequencyMod: 1 + diff * 0.1,
        cookingDifficultyMod: 1 + diff * 0.05,
    }
} 