'use client'

import { Order } from '@/types/models'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { calculateDishPreparationTime } from '@/lib/recipeUtils'

interface ActiveOrdersProps {
    orders: Order[]
    onOrderSelect: (id: string) => void
    selectedOrderId: string | null
}

function OrderCard({
    order,
    isSelected,
    onClick
}: {
    order: Order
    isSelected: boolean
    onClick: () => void
}) {
    const allRecipes = useRestaurantStore(state => state.restaurant.allRecipes)

    const getStatusColor = () => {
        switch (order.status) {
            case 'received': return 'bg-gray-200 border-gray-400'
            case 'cooking': return 'bg-orange-200 border-orange-500'
            case 'plated': return 'bg-green-200 border-green-500'
            case 'served': return 'bg-blue-200 border-blue-500'
            default: return 'bg-gray-200 border-gray-400'
        }
    }

    const getStatusIcon = () => {
        switch (order.status) {
            case 'received': return '📄'
            case 'cooking': return '🍳'
            case 'plated': return '🍽️'
            case 'served': return '✅'
            default: return '❓'
        }
    }

    const getProgressPercentage = () => {
        const now = Date.now()
        const elapsed = now - order.startTime
        const totalTime = calculateDishPreparationTime(order.dish, allRecipes) * 1000
        if (totalTime === 0) return 0
        return Math.min((elapsed / totalTime) * 100, 100)
    }

    const progress = order.status === 'served' ? 100 : getProgressPercentage()

    return (
        <div
            className={`
                min-w-48 h-16 rounded-lg border-2 cursor-pointer transition-all relative p-2
                ${getStatusColor()}
                ${isSelected ? 'ring-2 ring-purple-400 transform scale-105' : ''}
                hover:shadow-md
            `}
            onClick={onClick}
        >
            <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getStatusIcon()}</span>
                        <span className="font-medium text-sm">{order.dish.name}</span>
                        {order.isPriority && (
                            <span className="text-red-500 text-xs">🔥</span>
                        )}
                    </div>

                    <div className="text-xs text-gray-600">
                        Customer: {order.customerId.slice(-6)}
                    </div>
                </div>

                <div className="text-xs text-center">
                    <div className="capitalize font-medium">{order.status}</div>
                    <div className="text-gray-500">{progress.toFixed(0)}%</div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-b">
                <div
                    className="h-1 bg-purple-500 rounded-b transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Priority indicator */}
            {order.isPriority && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
        </div>
    )
}

export default function ActiveOrders({
    orders,
    onOrderSelect,
    selectedOrderId
}: ActiveOrdersProps) {
    const sortedOrders = [...orders].sort((a, b) => {
        // Priority orders first, then by status order
        if (a.isPriority !== b.isPriority) {
            return a.isPriority ? -1 : 1
        }

        const statusOrder = { 'received': 1, 'cooking': 2, 'plated': 3, 'served': 4 }
        return statusOrder[a.status] - statusOrder[b.status]
    })

    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-bold text-purple-800">
                    📋 Active Orders ({orders.length})
                </div>

                <div className="flex gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-200 border border-gray-400 rounded"></div>
                        <span>Received</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-200 border border-orange-500 rounded"></div>
                        <span>Cooking</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-200 border border-green-500 rounded"></div>
                        <span>Plated</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-200 border border-blue-500 rounded"></div>
                        <span>Served</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {sortedOrders.length === 0 ? (
                    <div className="w-full text-center text-gray-500 py-4">
                        <div className="text-2xl mb-2">📭</div>
                        <div>No active orders</div>
                    </div>
                ) : (
                    sortedOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isSelected={selectedOrderId === order.id}
                            onClick={() => onOrderSelect(order.id)}
                        />
                    ))
                )}
            </div>
        </div>
    )
} 