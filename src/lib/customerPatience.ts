import { useGameStore } from '@/state/game/gameStore'
import { eventBus } from './eventBus'
import { getCurrentDifficultyModifiers } from './difficultyScaling'

export function calculateInitialPatience(): number {
    const mods = getCurrentDifficultyModifiers()
    return 100 * mods.customerPatienceMod
}

export function reducePatience(current: number, deltaSeconds: number, customerId?: string): number {
    const diff = useGameStore.getState().game.difficulty
    const decayPerSecond = 1 + diff * 0.5
    let newPatience = current - decayPerSecond * deltaSeconds
    if (newPatience <= 0) {
        newPatience = 0
        if (customerId) eventBus.emit('customerLeft', { customerId })
    } else if (newPatience < 30 && customerId) {
        eventBus.emit('customerPatienceCritical', { customerId, patience: newPatience })
    }
    return newPatience
} 