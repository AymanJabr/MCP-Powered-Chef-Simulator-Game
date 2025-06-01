import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { eventBus } from '@/lib/eventBus'
import {
    Order,
    Dish,
    CookingProcess,
    PreparationTask,
    PlayerActionType,
    CookingActionType
} from '@/types/models'
import { usePlayerStore } from '@/state/player/playerStore'

/* -------------------------------------------------------------------------- */
/* Helper utilities                                                            */
/* -------------------------------------------------------------------------- */

function now() {
    return Date.now()
}

function generateId(prefix: string) {
    return `${prefix}_${now()}_${Math.floor(Math.random() * 1000)}`
}

/* -------------------------------------------------------------------------- */
/* Tool implementations                                                        */
/* -------------------------------------------------------------------------- */

export const tools = [
    {
        name: 'greet_customer',
        description: 'Greet a waiting customer from the queue and seat them at a table.',
        parameters: {
            customerId: { type: 'string', description: 'ID of the customer to greet' },
            tableId: { type: 'string', description: 'ID of the table where the customer will be seated' }
        },
        execute: async ({ customerId, tableId }: { customerId: string; tableId: string }) => {
            const { actions } = useRestaurantStore.getState()
            const result = actions.seatCustomer(customerId, tableId)
            if (result.success) {
                eventBus.emit('customer_seated', { customerId, tableId })
            }
            return result
        }
    },
    {
        name: 'take_order',
        description: 'Take an order from a seated customer.',
        parameters: {
            customerId: { type: 'string', description: 'ID of the customer placing the order' },
            dishId: { type: 'string', description: 'ID of the dish being ordered' }
        },
        execute: async ({ customerId, dishId }: { customerId: string; dishId: string }) => {
            const { restaurant, actions } = useRestaurantStore.getState()
            // Verify customer exists
            const customer = restaurant.activeCustomers.find((c) => c.id === customerId)
            if (!customer) {
                return { success: false, message: 'Customer not found or not seated' }
            }

            // Verify the dish exists in unlocked menu (simplified – assume it does)
            // TODO: Actually fetch dish details from a menu or recipe list
            const dish: Dish = {
                id: dishId,
                name: `Dish ${dishId.substring(dishId.length - 4)}`, // Placeholder name
                basePrice: 10, // Placeholder price
                recipeId: `recipe_${dishId.replace('dish_', '')}`, // Derive recipeId
                cookingDifficulty: 3,
            }

            // Build order
            const order: Order = {
                id: generateId('order'),
                customerId: customerId,
                dish,
                customizations: [],
                status: 'received',
                startTime: now(),
                completionTime: null,
                qualityScore: 0,
                tip: 0
            }
            actions.addActiveOrder(order)
            eventBus.emit('order_received', order)
            return { success: true, orderId: order.id }
        }
    },
    {
        name: 'serve_order',
        description: 'Serve a plated order to its customer.',
        parameters: {
            orderId: { type: 'string', description: 'ID of the order to serve' }
        },
        execute: async ({ orderId }: { orderId: string }) => {
            const { restaurant, actions } = useRestaurantStore.getState()
            const order = restaurant.activeOrders.find((o) => o.id === orderId)
            if (!order) {
                return { success: false, message: 'Order not found' }
            }
            if (order.status !== 'plated') {
                return { success: false, message: 'Order is not ready to be served' }
            }
            actions.updateOrderStatus(orderId, 'served')
            eventBus.emit('order_served', { orderId, customerId: order.customerId })
            return { success: true }
        }
    },
    {
        name: 'prepare_ingredient',
        description: 'Prepare an ingredient using a prep station (e.g., chop, dice).',
        parameters: {
            ingredientId: { type: 'string', description: 'ID of the ingredient to prepare' },
            preparation_type: { type: 'string', description: 'Type of preparation (chop, dice, etc.)' },
            stationId: { type: 'string', description: 'ID of the prep station to use' }
        },
        execute: async ({ ingredientId, preparation_type, stationId }:
            { ingredientId: string; preparation_type: string; stationId: string }) => {
            const { prepStations, actions } = useKitchenStore.getState()
            const station = prepStations.find((s) => s.id === stationId && s.status === 'idle')
            if (!station) {
                return { success: false, message: 'Prep station not available' }
            }
            const taskId = generateId('prep')
            const task: PreparationTask = {
                id: taskId,
                ingredientId: ingredientId,
                type: preparation_type as CookingActionType,
                startTime: now(),
                stationId: stationId,
                status: 'in_progress'
            }
            actions.startPreparation(stationId, task)
            eventBus.emit('preparationStarted', { stationId, ingredientId, taskId })
            return { success: true, preparationId: taskId }
        }
    },
    {
        name: 'cook_ingredient',
        description: 'Cook ingredients using a cooking station.',
        parameters: {
            stationId: { type: 'string', description: 'ID of the cooking station' },
            ingredientIds: { type: 'array', description: 'Array of prepared ingredient IDs' },
            cooking_method: { type: 'string', description: 'Cooking method (fry, grill, etc.)' },
            optimal_time_ms: { type: 'number', description: 'Expected optimal cooking time in milliseconds' }
        },
        execute: async ({ stationId, ingredientIds, cooking_method, optimal_time_ms }:
            { stationId: string; ingredientIds: string[]; cooking_method: string; optimal_time_ms: number }) => {
            const { cookingStations, actions } = useKitchenStore.getState()
            const station = cookingStations.find((s) => s.id === stationId && s.status === 'idle')
            if (!station) {
                return { success: false, message: 'Cooking station not available' }
            }
            const processId = generateId('cook')
            const process: CookingProcess = {
                id: processId,
                stationId: stationId,
                ingredients: ingredientIds,
                type: cooking_method as CookingActionType,
                startTime: now(),
                optimalCookingTime: optimal_time_ms,
                progress: 0,
                status: 'in_progress'
            }
            actions.startCookingProcess(stationId, process)
            eventBus.emit('cookingStarted', { stationId, processId })
            return { success: true, cookingId: processId }
        }
    },
    {
        name: 'plate_dish',
        description: 'Plate a cooked dish, arranging items and optional garnishes.',
        parameters: {
            orderId: { type: 'string', description: 'ID of the order being plated' },
            items: { type: 'array', description: 'IDs of cooked items to place on the plate' },
            garnishId: { type: 'string', description: 'Optional garnish ID', optional: true }
        },
        execute: async ({ orderId, items, garnishId }:
            { orderId: string; items: string[]; garnishId?: string }) => {
            const { platingStations, actions } = useKitchenStore.getState()
            const station = platingStations.find((s) => s.status === 'idle')
            if (!station) {
                return { success: false, message: 'No plating station available' }
            }
            const platingId = generateId('plate')
            actions.startPlating(station.id, orderId, platingId)
            items.forEach((itemId) => actions.addItemToPlate(platingId, itemId))
            if (garnishId) {
                actions.addGarnishToPlate(platingId, garnishId)
            }
            eventBus.emit('platingStarted', { orderId, platingId, stationId: station.id })
            return { success: true, platingId }
        }
    },
    {
        name: 'purchase_ingredients',
        description: 'Purchase additional ingredients to restock inventory.',
        parameters: {
            ingredientId: { type: 'string', description: 'Ingredient ID to purchase' },
            quantity: { type: 'number', description: 'Quantity to purchase' }
        },
        execute: async ({ ingredientId, quantity }:
            { ingredientId: string; quantity: number }) => {
            if (quantity <= 0) {
                return { success: false, message: 'Quantity must be positive' }
            }
            const { restaurant, actions } = useRestaurantStore.getState()
            const ingredient = restaurant.inventory.find((i) => i.id === ingredientId)
            if (!ingredient) {
                return { success: false, message: 'Ingredient not found' }
            }
            const totalCost = ingredient.cost * quantity
            if (restaurant.funds < totalCost) {
                return { success: false, message: 'Insufficient funds' }
            }
            actions.updateFunds(-totalCost)
            actions.updateIngredientQuantity(ingredientId, quantity)
            eventBus.emit('ingredient_purchased', { ingredientId, quantity, totalCost })
            return { success: true, remainingFunds: restaurant.funds - totalCost }
        }
    },
    {
        name: 'move_player',
        description: 'Move the player to a specified area/coordinate.',
        parameters: {
            area: { type: 'string', description: 'Destination area (kitchen, dining, storage)' },
            x: { type: 'number', description: 'X coordinate within the area' },
            y: { type: 'number', description: 'Y coordinate within the area' }
        },
        execute: async ({ area, x, y }: { area: 'kitchen' | 'dining' | 'storage'; x: number; y: number }) => {
            const { actions, player } = usePlayerStore.getState()
            actions.moveToArea(area, x, y)
            eventBus.emit('player_moved', { playerId: player.id, area, x, y })
            return { success: true, position: { area, x, y } }
        }
    },
    {
        name: 'clean_area',
        description: 'Perform a cleaning action on a target (table, station, etc.).',
        parameters: {
            targetId: { type: 'string', description: 'ID of the thing to clean' },
            duration_ms: { type: 'number', description: 'Expected cleaning time in milliseconds' }
        },
        execute: async ({ targetId, duration_ms }: { targetId: string; duration_ms: number }) => {
            const { actions, player } = usePlayerStore.getState()
            const actionId = actions.startAction('clean' as PlayerActionType, targetId, duration_ms)
            eventBus.emit('player_action_started', { playerId: player.id, type: 'clean', targetId, duration_ms, actionId })
            return { success: true, actionId }
        }
    }
] as const 