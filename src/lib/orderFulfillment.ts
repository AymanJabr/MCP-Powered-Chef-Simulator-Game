import { useRestaurantStore } from '@/state/game/restaurantStore'
import { eventBus } from './eventBus'
import { OrderStatus } from '@/types/models'
import { ServeResult, OrderStatusInfo, RushResult } from '@/types/models'

/**
 * Serve a plated order to its customer, update satisfaction and funds handled elsewhere.
 */
export function serveOrder(orderId: string): ServeResult {
    const restaurant = useRestaurantStore.getState()
    const order = restaurant.restaurant.activeOrders.find((o) => o.id === orderId)
    if (!order) return { success: false, message: 'Order not found' }
    if (order.status !== 'plated') return { success: false, message: 'Order is not plated' }

    // Compute satisfaction: quality + speed vs patience simplistic
    const customer = restaurant.restaurant.activeCustomers.find((c) => c.order?.id === orderId)
    const waitTime = Date.now() - order.startTime
    let satisfaction = order.qualityScore
    satisfaction -= waitTime / 1000 // one point per sec waited
    satisfaction = Math.max(0, Math.min(100, satisfaction))

    restaurant.actions.updateOrderStatus(orderId, 'served')
    if (customer) {
        restaurant.actions.updateCustomerSatisfaction(customer.id, satisfaction)
    }

    eventBus.emit('orderServed', { orderId, customerId: customer?.id, satisfaction })
    return { success: true, message: 'Order served', orderId, customerSatisfaction: satisfaction }
}

/**
 * Get status and elapsed time for an order.
 */
export function checkOrderStatus(orderId: string): OrderStatusInfo | null {
    const restaurant = useRestaurantStore.getState().restaurant
    const order = restaurant.activeOrders.find((o) => o.id === orderId)
    if (!order) return null

    return {
        orderId,
        status: order.status as OrderStatus,
        elapsedTime: Date.now() - order.startTime,
        isPriority: !!order.isPriority,
    }
}

/**
 * Mark an order as priority (rush) for earlier processing.
 */
export function rushOrder(orderId: string): RushResult {
    const store = useRestaurantStore.getState()
    const order = store.restaurant.activeOrders.find((o) => o.id === orderId)
    if (!order) return { success: false, orderId, isPriority: false }
    order.isPriority = true
    eventBus.emit('orderRushed', { orderId })
    return { success: true, orderId, isPriority: true }
} 