import { useRestaurantStore } from '../restaurantStore'
import { Customer, Order, Dish, Ingredient, Equipment } from '@/types/models'

// Mock data
const mockCustomer: Customer = {
    id: 'customer_1',
    order: null,
    patience: 100,
    arrivalTime: Date.now(),
    status: 'waiting',
    satisfaction: 0,
    tip: 0
}

const mockDish: Dish = {
    id: 'dish_1',
    name: 'Test Dish',
    basePrice: 10,
    recipeId: 'recipe_1',
    cookingDifficulty: 1
}

const mockOrder: Order = {
    id: 'order_1',
    customerId: 'customer_1',
    dish: mockDish,
    customizations: [],
    status: 'received',
    startTime: Date.now(),
    completionTime: null,
    qualityScore: 0,
    tip: 0
}

const mockIngredient: Ingredient = {
    id: 'ingredient_1',
    name: 'Test Ingredient',
    category: 'vegetable',
    quality: 5,
    quantity: 10,
    cost: 2
}

const mockEquipment: Equipment = {
    id: 'equipment_1',
    name: 'Test Equipment',
    status: 'idle',
    capacity: 1,
    efficiency: 1,
    reliability: 1
}

describe('Restaurant Store', () => {
    beforeEach(() => {
        // Reset store to a predictable state for testing
        useRestaurantStore.setState({
            restaurant: {
                name: 'MCP-Powered Chef Restaurant',
                level: 1,
                reputation: 50,
                funds: 1000,
                customerCapacity: 8,
                activeCustomers: [],
                customerQueue: [],
                activeOrders: [],
                completedOrders: [],
                inventory: [{ ...mockIngredient }], // Copy to avoid reference issues
                equipment: [{ ...mockEquipment }],
                menuItems: [],
                unlockedMenuItems: []
            }
        })
    })

    it('should initialize with default values', () => {
        const { restaurant } = useRestaurantStore.getState()
        expect(restaurant.name).toBe('MCP-Powered Chef Restaurant')
        expect(restaurant.level).toBe(1)
        expect(restaurant.reputation).toBe(50)
        expect(restaurant.funds).toBe(1000)
        expect(restaurant.customerCapacity).toBe(8)
        expect(restaurant.activeCustomers).toEqual([])
        expect(restaurant.customerQueue).toEqual([])
    })

    it('should add customer to queue', () => {
        const { actions } = useRestaurantStore.getState()
        actions.addCustomerToQueue({ ...mockCustomer })

        const { restaurant } = useRestaurantStore.getState()
        expect(restaurant.customerQueue).toHaveLength(1)
        expect(restaurant.customerQueue[0].id).toBe('customer_1')
    })

    it('should remove customer from queue', () => {
        const { actions } = useRestaurantStore.getState()
        actions.addCustomerToQueue({ ...mockCustomer })

        // Check customer was added
        expect(useRestaurantStore.getState().restaurant.customerQueue).toHaveLength(1)

        // Remove the customer
        actions.removeCustomerFromQueue('customer_1')

        // Check customer was removed
        expect(useRestaurantStore.getState().restaurant.customerQueue).toHaveLength(0)
    })

    it('should seat customer', () => {
        const { actions } = useRestaurantStore.getState()
        actions.addCustomerToQueue({ ...mockCustomer })

        const result = actions.seatCustomer('customer_1', 'table_1')

        expect(result.success).toBe(true)

        const { restaurant } = useRestaurantStore.getState()
        expect(restaurant.customerQueue).toHaveLength(0)
        expect(restaurant.activeCustomers).toHaveLength(1)
        expect(restaurant.activeCustomers[0].id).toBe('customer_1')
        expect(restaurant.activeCustomers[0].tableId).toBe('table_1')
        expect(restaurant.activeCustomers[0].status).toBe('seated')
    })

    it('should fail when seating non-existent customer', () => {
        const { actions } = useRestaurantStore.getState()

        const result = actions.seatCustomer('non_existent_customer', 'table_1')

        expect(result.success).toBe(false)
        expect(result.message).toContain('not found')
    })

    it('should fail when restaurant is at capacity', () => {
        const { actions } = useRestaurantStore.getState()

        // Fill restaurant to capacity
        for (let i = 0; i < 8; i++) {
            actions.addCustomerToQueue({
                ...mockCustomer,
                id: `customer_${i + 1}`
            })
            actions.seatCustomer(`customer_${i + 1}`, `table_${i + 1}`)
        }

        // Add one more customer
        actions.addCustomerToQueue({
            ...mockCustomer,
            id: 'customer_overflow'
        })

        // Try to seat the overflow customer
        const result = actions.seatCustomer('customer_overflow', 'table_extra')

        expect(result.success).toBe(false)
        expect(result.message).toContain('full capacity')
    })

    it('should manage active orders', () => {
        const { actions } = useRestaurantStore.getState()

        // Add an order
        actions.addActiveOrder({ ...mockOrder })

        let { restaurant } = useRestaurantStore.getState()
        expect(restaurant.activeOrders).toHaveLength(1)

        // Update order status
        actions.updateOrderStatus('order_1', 'cooking')

        restaurant = useRestaurantStore.getState().restaurant
        expect(restaurant.activeOrders[0].status).toBe('cooking')

        // Set to served and check completion time is set
        actions.updateOrderStatus('order_1', 'served')

        restaurant = useRestaurantStore.getState().restaurant
        expect(restaurant.activeOrders[0].status).toBe('served')
        expect(restaurant.activeOrders[0].completionTime).not.toBeNull()
    })

    it('should complete an order and update customer status', () => {
        const { actions } = useRestaurantStore.getState()

        // Add a customer
        actions.addCustomerToQueue({ ...mockCustomer })
        actions.seatCustomer('customer_1', 'table_1')

        // Add an order
        actions.addActiveOrder({ ...mockOrder })

        // Complete the order
        actions.completeOrder('order_1', 5)

        const { restaurant } = useRestaurantStore.getState()

        // Order should be moved to completed orders
        expect(restaurant.activeOrders).toHaveLength(0)
        expect(restaurant.completedOrders).toHaveLength(1)
        expect(restaurant.completedOrders[0].tip).toBe(5)

        // Customer should be marked as served
        expect(restaurant.activeCustomers[0].status).toBe('served')
    })

    it('should update customer satisfaction and calculate tips', () => {
        const { actions } = useRestaurantStore.getState()

        // Add a customer
        actions.addCustomerToQueue({ ...mockCustomer })
        actions.seatCustomer('customer_1', 'table_1')

        // Update satisfaction to a high value
        actions.updateCustomerSatisfaction('customer_1', 80)

        const { restaurant } = useRestaurantStore.getState()
        expect(restaurant.activeCustomers[0].satisfaction).toBe(80)

        // Tips should be calculated based on satisfaction
        // Using the formula tipPercentage = satisfaction / 100, then tip = Math.floor(tipPercentage * 5)
        const expectedTip = Math.floor((80 / 100) * 5)
        expect(restaurant.activeCustomers[0].tip).toBe(expectedTip)

        // Reputation should have increased (80 - 50) / 10 = 3
        expect(restaurant.reputation).toBe(53)
    })

    it('should update ingredient quantity', () => {
        const { actions } = useRestaurantStore.getState()

        // Increase quantity
        actions.updateIngredientQuantity('ingredient_1', 5)

        let { restaurant } = useRestaurantStore.getState()
        expect(restaurant.inventory[0].quantity).toBe(15) // 10 + 5

        // Decrease quantity
        actions.updateIngredientQuantity('ingredient_1', -3)

        restaurant = useRestaurantStore.getState().restaurant
        expect(restaurant.inventory[0].quantity).toBe(12) // 15 - 3
    })

    it('should update equipment status', () => {
        const { actions } = useRestaurantStore.getState()

        // Update equipment to in_use
        actions.updateEquipmentStatus('equipment_1', 'in_use')

        let { restaurant } = useRestaurantStore.getState()
        expect(restaurant.equipment[0].status).toBe('in_use')

        // Update equipment to broken
        actions.updateEquipmentStatus('equipment_1', 'broken')

        restaurant = useRestaurantStore.getState().restaurant
        expect(restaurant.equipment[0].status).toBe('broken')
    })
}) 