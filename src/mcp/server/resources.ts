import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { useGameStore } from '@/state/game/gameStore'

export const resources = [
    {
        name: 'game_state',
        description: 'Overall game status including difficulty and performance metrics',
        get: () => {
            const { game } = useGameStore.getState()
            return {
                phase: game.gamePhase,
                mode: game.gameMode,
                difficulty: game.difficulty,
                timeElapsed: Math.floor(game.timeElapsed),
                performance: game.performanceMetrics
            }
        }
    },
    {
        name: 'restaurant_state',
        description: 'Current restaurant information: customers, orders and inventory overview.',
        get: () => {
            const { restaurant } = useRestaurantStore.getState()
            return {
                funds: restaurant.funds,
                reputation: restaurant.reputation,
                queue: restaurant.customerQueue.length,
                activeCustomers: restaurant.activeCustomers.map((c) => ({
                    id: c.id,
                    status: c.status,
                    patience: c.patience,
                    tableId: c.tableId
                })),
                activeOrders: restaurant.activeOrders.map((o) => ({
                    id: o.id,
                    dish: o.dish.name,
                    status: o.status,
                    isPriority: o.isPriority ?? false
                })),
                inventory: restaurant.inventory.map((i) => ({ id: i.id, qty: i.quantity }))
            }
        }
    },
    {
        name: 'kitchen_state',
        description: 'Status of kitchen stations and active processes',
        get: () => {
            const kitchen = useKitchenStore.getState()
            return {
                prepStations: kitchen.prepStations,
                cookingStations: kitchen.cookingStations,
                platingStations: kitchen.platingStations,
                activePreparations: Object.values(kitchen.activePreparations).length,
                activeCooking: kitchen.activeCookingProcesses.length,
                activePlating: Object.values(kitchen.activePlating).length
            }
        }
    }
] as const 