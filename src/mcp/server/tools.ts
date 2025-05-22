import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { eventBus } from '@/lib/eventBus'
import {
    Order,
    Dish,
    CookingProcess,
    PreparationTask,
    PlayerActionType,
    PreparationType,
    CookingMethod
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
            customer_id: { type: 'string', description: 'ID of the customer to greet' },
            table_id: { type: 'string', description: 'ID of the table where the customer will be seated' }
        },
        execute: async ({ customer_id, table_id }: { customer_id: string; table_id: string }) => {
            const { actions } = useRestaurantStore.getState()
            const result = actions.seatCustomer(customer_id, table_id)
            if (result.success) {
                eventBus.emit('customer_seated', { customer_id, table_id })
            }
            return result
        }
    },
    {
        name: 'take_order',
        description: 'Take an order from a seated customer.',
        parameters: {
            customer_id: { type: 'string', description: 'ID of the customer placing the order' },
            dish_id: { type: 'string', description: 'ID of the dish being ordered' }
        },
        execute: async ({ customer_id, dish_id }: { customer_id: string; dish_id: string }) => {
            const { restaurant, actions } = useRestaurantStore.getState()
            // Verify customer exists
            const customer = restaurant.activeCustomers.find((c) => c.id === customer_id)
            if (!customer) {
                return { success: false, message: 'Customer not found or not seated' }
            }

            // Verify the dish exists in unlocked menu (simplified – assume it does)
            const dish: Dish = { id: dish_id, name: dish_id, basePrice: 10, recipe: { id: 'recipe', ingredients: [], cookingSteps: [] }, cookingDifficulty: 1, preparationTime: 60, plateAppearance: 50 }

            // Build order
            const order: Order = {
                id: generateId('order'),
                customerId: customer_id,
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
            order_id: { type: 'string', description: 'ID of the order to serve' }
        },
        execute: async ({ order_id }: { order_id: string }) => {
            const { restaurant, actions } = useRestaurantStore.getState()
            const order = restaurant.activeOrders.find((o) => o.id === order_id)
            if (!order) {
                return { success: false, message: 'Order not found' }
            }
            if (order.status !== 'plated') {
                return { success: false, message: 'Order is not ready to be served' }
            }
            actions.updateOrderStatus(order_id, 'served')
            eventBus.emit('order_served', { order_id, customer_id: order.customerId })
            return { success: true }
        }
    },
    {
        name: 'prepare_ingredient',
        description: 'Prepare an ingredient using a prep station (e.g., chop, dice).',
        parameters: {
            ingredient_id: { type: 'string', description: 'ID of the ingredient to prepare' },
            preparation_type: { type: 'string', description: 'Type of preparation (chop, dice, etc.)' },
            station_id: { type: 'string', description: 'ID of the prep station to use' }
        },
        execute: async ({ ingredient_id, preparation_type, station_id }:
            { ingredient_id: string; preparation_type: string; station_id: string }) => {
            const { prepStations, actions } = useKitchenStore.getState()
            const station = prepStations.find((s) => s.id === station_id && s.status === 'idle')
            if (!station) {
                return { success: false, message: 'Prep station not available' }
            }
            const taskId = generateId('prep')
            const task: PreparationTask = {
                id: taskId,
                ingredientId: ingredient_id,
                preparationType: preparation_type as PreparationType,
                startTime: now(),
                stationId: station_id,
                status: 'in_progress'
            }
            actions.startPreparation(station_id, task)
            eventBus.emit('preparationStarted', { station_id, ingredient_id, taskId })
            return { success: true, preparationId: taskId }
        }
    },
    {
        name: 'cook_ingredient',
        description: 'Cook ingredients using a cooking station.',
        parameters: {
            station_id: { type: 'string', description: 'ID of the cooking station' },
            ingredient_ids: { type: 'array', description: 'Array of prepared ingredient IDs' },
            cooking_method: { type: 'string', description: 'Cooking method (fry, grill, etc.)' },
            optimal_time_ms: { type: 'number', description: 'Expected optimal cooking time in milliseconds' }
        },
        execute: async ({ station_id, ingredient_ids, cooking_method, optimal_time_ms }:
            { station_id: string; ingredient_ids: string[]; cooking_method: string; optimal_time_ms: number }) => {
            const { cookingStations, actions } = useKitchenStore.getState()
            const station = cookingStations.find((s) => s.id === station_id && s.status === 'idle')
            if (!station) {
                return { success: false, message: 'Cooking station not available' }
            }
            const processId = generateId('cook')
            const process: CookingProcess = {
                id: processId,
                stationId: station_id,
                ingredients: ingredient_ids,
                cookingMethod: cooking_method as CookingMethod,
                startTime: now(),
                optimalCookingTime: optimal_time_ms,
                progress: 0,
                status: 'in_progress'
            }
            actions.startCookingProcess(station_id, process)
            eventBus.emit('cookingStarted', { station_id, processId })
            return { success: true, cookingId: processId }
        }
    },
    {
        name: 'plate_dish',
        description: 'Plate a cooked dish, arranging items and optional garnishes.',
        parameters: {
            order_id: { type: 'string', description: 'ID of the order being plated' },
            items: { type: 'array', description: 'IDs of cooked items to place on the plate' },
            garnish_id: { type: 'string', description: 'Optional garnish ID', optional: true }
        },
        execute: async ({ order_id, items, garnish_id }:
            { order_id: string; items: string[]; garnish_id?: string }) => {
            const { platingStations, actions } = useKitchenStore.getState()
            const station = platingStations.find((s) => s.status === 'idle')
            if (!station) {
                return { success: false, message: 'No plating station available' }
            }
            const platingId = generateId('plate')
            actions.startPlating(station.id, order_id, platingId)
            items.forEach((itemId) => actions.addItemToPlate(platingId, itemId))
            if (garnish_id) {
                actions.addGarnishToPlate(platingId, garnish_id)
            }
            eventBus.emit('platingStarted', { order_id, platingId, stationId: station.id })
            return { success: true, platingId }
        }
    },
    {
        name: 'purchase_ingredients',
        description: 'Purchase additional ingredients to restock inventory.',
        parameters: {
            ingredient_id: { type: 'string', description: 'Ingredient ID to purchase' },
            quantity: { type: 'number', description: 'Quantity to purchase' }
        },
        execute: async ({ ingredient_id, quantity }:
            { ingredient_id: string; quantity: number }) => {
            if (quantity <= 0) {
                return { success: false, message: 'Quantity must be positive' }
            }
            const { restaurant, actions } = useRestaurantStore.getState()
            const ingredient = restaurant.inventory.find((i) => i.id === ingredient_id)
            if (!ingredient) {
                return { success: false, message: 'Ingredient not found' }
            }
            const totalCost = ingredient.cost * quantity
            if (restaurant.funds < totalCost) {
                return { success: false, message: 'Insufficient funds' }
            }
            actions.updateFunds(-totalCost)
            actions.updateIngredientQuantity(ingredient_id, quantity)
            eventBus.emit('ingredient_purchased', { ingredient_id, quantity, totalCost })
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
            target_id: { type: 'string', description: 'ID of the thing to clean' },
            duration_ms: { type: 'number', description: 'Expected cleaning time in milliseconds' }
        },
        execute: async ({ target_id, duration_ms }: { target_id: string; duration_ms: number }) => {
            const { actions, player } = usePlayerStore.getState()
            const actionId = actions.startAction('clean' as PlayerActionType, target_id, duration_ms)
            eventBus.emit('player_action_started', { playerId: player.id, type: 'clean', target_id, duration_ms, actionId })
            return { success: true, actionId }
        }
    }
] as const 