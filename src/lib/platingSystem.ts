import { useKitchenStore } from '@/state/game/kitchenStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { eventBus } from './eventBus'

export interface StartPlatingResult {
    success: boolean
    message: string
    stationId?: string
    platingId?: string
}

export interface PlatingCheckResult {
    isComplete: boolean
    missingItems: string[]
    suggestedGarnishes: string[]
    currentQualityScore: number
}

export interface CompletePlatingResult {
    success: boolean
    qualityScore: number
}

export function startPlating(orderId: string): StartPlatingResult {
    const kitchenState = useKitchenStore.getState()
    const restaurant = useRestaurantStore.getState().restaurant

    const order = restaurant.activeOrders.find((o) => o.id === orderId)
    if (!order) return { success: false, message: 'Order not found' }

    const station = kitchenState.platingStations.find((s) => s.status === 'idle')
    if (!station) return { success: false, message: 'No plating station available' }

    const platingId = `plate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    kitchenState.actions.startPlating(station.id, orderId, platingId)
    eventBus.emit('platingStarted', { orderId, stationId: station.id })
    return { success: true, message: 'Plating started', stationId: station.id, platingId }
}

export function addItem(platingId: string, itemId: string) {
    const kitchenState = useKitchenStore.getState()
    kitchenState.actions.addItemToPlate(platingId, itemId)
    eventBus.emit('platingItemAdded', { platingId, itemId })
}

export function addGarnish(platingId: string, garnishId: string) {
    const kitchenState = useKitchenStore.getState()
    kitchenState.actions.addGarnishToPlate(platingId, garnishId)
    eventBus.emit('platingGarnishAdded', { platingId, garnishId })
}

export function checkPlating(platingId: string): PlatingCheckResult {
    const kitchenState = useKitchenStore.getState()
    const restaurant = useRestaurantStore.getState().restaurant

    const plating = kitchenState.activePlating[platingId]
    if (!plating) throw new Error('Plating not found')
    const order = restaurant.activeOrders.find((o) => o.id === plating.orderId)
    if (!order) throw new Error('Order not found')

    const requiredItems = order.dish.recipe.ingredients.map((i) => i)
    const missingItems = requiredItems.filter((id) => !plating.items.includes(id))

    const suggestedGarnishes: string[] = order.dish.recipe.ingredients.slice(0, 1) // simplistic

    // simple quality calc: base 80 + item completeness - missing
    const completeness = 20 - missingItems.length * 5
    const currentQuality = Math.max(0, 80 + completeness)

    return {
        isComplete: missingItems.length === 0,
        missingItems,
        suggestedGarnishes,
        currentQualityScore: currentQuality,
    }
}

export function completePlating(platingId: string): CompletePlatingResult {
    const kitchenState = useKitchenStore.getState()
    const plating = kitchenState.activePlating[platingId]
    if (!plating) return { success: false, qualityScore: 0 }

    const check = checkPlating(platingId)
    if (!check.isComplete) return { success: false, qualityScore: 0 }

    // final quality adds garnish bonus
    const quality = Math.min(100, check.currentQualityScore + plating.garnishes.length * 5)

    kitchenState.actions.completePlating(platingId, quality)
    eventBus.emit('platingCompleted', { platingId, orderId: plating.orderId, qualityScore: quality })
    return { success: true, qualityScore: quality }
} 