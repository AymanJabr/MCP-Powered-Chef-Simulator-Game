import { useKitchenStore } from '@/state/game/kitchenStore'
import { eventBus } from './eventBus'
import { CookingActionType } from '@/types/models'

export interface PrepResult {
    success: boolean
    message: string
    stationId?: string
    preparationId?: string
    qualityScore?: number
}

interface IngredientInput {
    id: string
    name?: string
    type: CookingActionType
}

/**
 * Start preparing an ingredient on an available station of a given type.
 */
export function prepareIngredient(ingredient: IngredientInput, requiredStationType: string): PrepResult {
    const kitchenState = useKitchenStore.getState()

    const station = kitchenState.prepStations.find((s) => s.type === requiredStationType && s.status === 'idle')
    if (!station) {
        return { success: false, message: 'No available station' }
    }

    const prepId = `prep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    kitchenState.actions.startPreparation(station.id, {
        id: prepId,
        ingredientId: ingredient.id,
        type: ingredient.type,
        startTime: Date.now(),
        stationId: station.id,
    })

    eventBus.emit('preparationStarted', { stationId: station.id, ingredientId: ingredient.id, taskId: prepId })

    return { success: true, message: 'Preparation started', stationId: station.id, preparationId: prepId }
}

/**
 * Complete a preparation task, freeing the station and returning a quality score.
 */
export function completePreparation(stationId: string, preparationId: string, qualityScore: number): PrepResult {
    const kitchenState = useKitchenStore.getState()

    const task = kitchenState.activePreparations[preparationId]
    if (!task) return { success: false, message: 'Preparation task not found' }

    kitchenState.actions.completePreparation(stationId, preparationId, qualityScore)

    eventBus.emit('preparationCompleted', { taskId: preparationId, quality: qualityScore })

    return { success: true, message: 'Preparation completed', qualityScore }
} 