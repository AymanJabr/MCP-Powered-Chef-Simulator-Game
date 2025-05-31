import { useKitchenStore } from '@/state/game/kitchenStore'
import { CookingActionType, CookingProcess } from '@/types/models'
import { eventBus } from './eventBus'

export interface StartCookingResult {
    success: boolean
    message: string
    cookingId?: string
    stationId?: string
}

export interface CookingProgress {
    cookingId: string
    progress: number
    isOvercooked: boolean
}

export interface CookingComplete {
    success: boolean
    cookingId: string
    qualityScore: number
    isOvercooked: boolean
}

/**
 * Start a cooking process on the first available station that matches method.
 */
export function startCooking(ingredients: { id: string }[], type: CookingActionType): StartCookingResult {
    const kitchenState = useKitchenStore.getState()
    // Map type to station type preference simple mapping
    const stationPreference: Record<CookingActionType, string> = {
        fry: 'stove',
        grill: 'grill',
        bake: 'oven',
        boil: 'stove',
        chop: 'cutting_board',
        simmer: 'stove',
        mix: 'mixing_bowl',
        freeze: 'freezer',
    }
    const targetStationType = stationPreference[type];
    if (!targetStationType) {
        return { success: false, message: `No suitable station type defined for action: ${type}` }
    }
    const station = kitchenState.cookingStations.find((s) => s.type === targetStationType && s.status === 'idle')

    if (!station) return { success: false, message: 'No available cooking station' }

    const cookingId = `cook_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const optimalTime = 60000 // default 60s for now TODO difficulty

    kitchenState.actions.startCookingProcess(station.id, {
        id: cookingId,
        ingredients: ingredients.map((i) => i.id),
        type,
        startTime: Date.now(),
        optimalCookingTime: optimalTime,
    } as CookingProcess)

    eventBus.emit('cookingStarted', { stationId: station.id, processId: cookingId })

    return { success: true, message: 'Cooking started', cookingId, stationId: station.id }
}

/**
 * Check the current progress (0-100+) of a cooking process.
 */
export function checkCookingProgress(processId: string): CookingProgress | null {
    const kitchenState = useKitchenStore.getState()
    const proc = kitchenState.activeCookingProcesses.find((p) => p.id === processId)
    if (!proc) return null

    const elapsed = Date.now() - proc.startTime
    const progress = (elapsed / proc.optimalCookingTime) * 100
    const isOvercooked = progress > 120 // arbitrary threshold

    kitchenState.actions.updateCookingProgress(processId, progress, isOvercooked)
    eventBus.emit('cookingProgress', { processId: processId, progress })

    return { cookingId: processId, progress, isOvercooked }
}

/**
 * Finish cooking, calculate quality score and free station.
 */
export function completeCooking(processId: string): CookingComplete {
    const kitchenState = useKitchenStore.getState()
    const proc = kitchenState.activeCookingProcesses.find((p) => p.id === processId)
    if (!proc) {
        return { success: false, cookingId: processId, qualityScore: 0, isOvercooked: false }
    }

    const progress = checkCookingProgress(processId)?.progress ?? 0
    const isOvercooked = progress > 110
    // Simple quality calc
    let quality = 100 - Math.abs(progress - 100)
    if (isOvercooked) quality -= 30
    quality = Math.max(0, Math.min(quality, 100))

    kitchenState.actions.finishCookingProcess(processId, quality)
    eventBus.emit('cookingCompleted', { processId: processId, quality: quality })

    return { success: true, cookingId: processId, qualityScore: quality, isOvercooked }
} 