import { useRestaurantStore } from '@/state/game/restaurantStore'
import { Order } from '@/types/models'
import { eventBus } from './eventBus'

// ---------------------------------------------------------------------------
// Finance System
// ---------------------------------------------------------------------------
// Handles customer payments and daily expense deductions.
// ---------------------------------------------------------------------------

export interface PaymentResult {
    success: boolean
    message?: string
    basePrice?: number
    tip?: number
    total?: number
}

export interface ExpenseResult {
    fixedCosts: number
    totalExpenses: number
}

/**
 * Process payment for a served order.
 * Adds funds, updates order status to completed, and emits events.
 */
export function processPayment(orderId: string): PaymentResult {
    const restaurantState = useRestaurantStore.getState()
    const { activeOrders } = restaurantState.restaurant

    const order = activeOrders.find((o) => o.id === orderId)
    if (!order) {
        return { success: false, message: 'Order not found' }
    }

    if (order.status !== 'served') {
        return { success: false, message: 'Order not yet served' }
    }

    // Calculate payment
    const basePrice = order.dish.basePrice

    const qualityMultiplier = Math.max(0, order.qualityScore) / 100 // 0-1 range
    const timeTaken = (order.completionTime ?? Date.now()) - order.startTime // ms
    const speedMultiplier = Math.max(0.5, 1 - timeTaken / 60000) // 60s baseline

    const tipPercentage = (qualityMultiplier + speedMultiplier) / 2
    const tip = Math.round(basePrice * tipPercentage)
    const total = basePrice + tip

    // Update funds & order records
    restaurantState.actions.updateFunds(total)
    restaurantState.actions.completeOrder(orderId, tip)

    eventBus.emit('funds_changed', { delta: total, reason: 'order_payment', orderId })
    eventBus.emit('order_completed', { orderId, total, tip })

    return { success: true, basePrice, tip, total }
}

const DAILY_FIXED_COSTS = 50

/**
 * Deduct daily fixed expenses (rent, utilities, etc.). Can be called at end of
 * in-game day.
 */
export function calculateDailyExpenses(): ExpenseResult {
    const restaurantState = useRestaurantStore.getState()

    restaurantState.actions.updateFunds(-DAILY_FIXED_COSTS)
    eventBus.emit('funds_changed', { delta: -DAILY_FIXED_COSTS, reason: 'daily_expenses' })

    return { fixedCosts: DAILY_FIXED_COSTS, totalExpenses: DAILY_FIXED_COSTS }
} 