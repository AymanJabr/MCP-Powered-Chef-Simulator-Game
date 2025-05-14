import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { createCustomer } from './entityFactories'
import { eventBus } from './eventBus'

// ---------------------------------------------------------------------------
// Customer Generation System
// ---------------------------------------------------------------------------
//  • shouldGenerateCustomer(deltaSeconds) – probabilistically decides whether a
//    new customer should appear during this frame.
//  • generateCustomer() – creates and enqueues the customer, returning the
//    Customer instance.
// ---------------------------------------------------------------------------

export const MAX_QUEUE_LENGTH = 15

/**
 * Determine whether we should spawn a customer this frame.
 * The probability grows with difficulty and shrinks with current queue length.
 */
export function shouldGenerateCustomer(deltaSeconds: number): boolean {
    const { game } = useGameStore.getState()
    const restaurant = useRestaurantStore.getState().restaurant

    // If queue already full just skip
    if (restaurant.customerQueue.length >= MAX_QUEUE_LENGTH) return false

    // Base spawn probability per second
    const base = 0.02 // 2% at difficulty 0

    // Difficulty scaling – linear for now (can be tuned later)
    const diffFactor = base + game.difficulty * 0.03 // up to around 0.32 at diff=10

    // Queue penalty: more people waiting → lower chance
    const queueFactor = Math.max(0.4, 1 - restaurant.customerQueue.length * 0.05)

    const probabilityPerSecond = diffFactor * queueFactor

    return Math.random() < probabilityPerSecond * deltaSeconds
}

/**
 * Spawn a new customer, adjusting patience based on difficulty and pushing to
 * the waiting queue.
 */
export function generateCustomer() {
    const difficulty = useGameStore.getState().game.difficulty
    const restaurantState = useRestaurantStore.getState()

    // Patience scales down with difficulty (min 40)
    const patienceModifier = Math.max(0.4, 1 - difficulty * 0.06)
    const newCustomer = createCustomer({ patience: 100 * patienceModifier })

    restaurantState.actions.addCustomerToQueue(newCustomer)

    // Emit arrival event for UI / metrics
    eventBus.emit('customer_arrived', { customerId: newCustomer.id })

    return newCustomer
} 