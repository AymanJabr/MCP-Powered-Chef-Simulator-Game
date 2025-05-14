import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Restaurant, Customer, Order, Ingredient, Equipment } from '@/types/models'

interface RestaurantState {
    restaurant: Restaurant
    actions: {
        setName: (name: string) => void
        setLevel: (level: number) => void
        updateFunds: (amount: number) => void
        addCustomerToQueue: (customer: Customer) => void
        removeCustomerFromQueue: (customerId: string) => void
        seatCustomer: (customerId: string, tableId: string) => { success: boolean, message?: string }
        addActiveOrder: (order: Order) => void
        updateOrderStatus: (orderId: string, status: Order['status']) => void
        completeOrder: (orderId: string, tipAmount: number) => void
        updateCustomerSatisfaction: (customerId: string, satisfactionScore: number) => void
        updateIngredientQuantity: (ingredientId: string, quantityChange: number) => void
        updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void
    }
}

export const useRestaurantStore = create<RestaurantState>()(
    immer((set) => ({
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
            inventory: [],
            equipment: []
        },
        actions: {
            setName: (name) => set((state) => {
                state.restaurant.name = name
            }),

            setLevel: (level) => set((state) => {
                state.restaurant.level = level
            }),

            updateFunds: (amount) => set((state) => {
                state.restaurant.funds += amount
            }),

            addCustomerToQueue: (customer) => set((state) => {
                state.restaurant.customerQueue.push(customer)
            }),

            removeCustomerFromQueue: (customerId) => set((state) => {
                state.restaurant.customerQueue = state.restaurant.customerQueue.filter(
                    (c: Customer) => c.id !== customerId
                )
            }),

            seatCustomer: (customerId, tableId) => {
                let success = false
                let message = 'Failed to seat customer'

                set((state) => {
                    // Check if customer exists in queue
                    const customerIndex = state.restaurant.customerQueue.findIndex(
                        (c: Customer) => c.id === customerId
                    )
                    if (customerIndex === -1) {
                        message = 'Customer not found in queue'
                        return
                    }

                    // Check if at capacity
                    if (state.restaurant.activeCustomers.length >= state.restaurant.customerCapacity) {
                        message = 'Restaurant is at full capacity'
                        return
                    }

                    // Move customer from queue to active customers
                    const customer = state.restaurant.customerQueue[customerIndex]
                    customer.tableId = tableId
                    customer.status = 'seated'

                    state.restaurant.activeCustomers.push(customer)
                    state.restaurant.customerQueue.splice(customerIndex, 1)

                    success = true
                    message = 'Customer seated successfully'
                })

                return { success, message }
            },

            addActiveOrder: (order) => set((state) => {
                state.restaurant.activeOrders.push(order)
            }),

            updateOrderStatus: (orderId, status) => set((state) => {
                const orderIndex = state.restaurant.activeOrders.findIndex(
                    (o: Order) => o.id === orderId
                )
                if (orderIndex !== -1) {
                    state.restaurant.activeOrders[orderIndex].status = status

                    // If order is now served, record the completion time
                    if (status === 'served' && !state.restaurant.activeOrders[orderIndex].completionTime) {
                        state.restaurant.activeOrders[orderIndex].completionTime = Date.now()
                    }
                }
            }),

            completeOrder: (orderId, tipAmount) => set((state) => {
                const orderIndex = state.restaurant.activeOrders.findIndex(
                    (o: Order) => o.id === orderId
                )
                if (orderIndex !== -1) {
                    const order = state.restaurant.activeOrders[orderIndex]

                    // Add tip amount to the order
                    order.tip = tipAmount

                    // Move from active to completed orders
                    state.restaurant.completedOrders.push(order)
                    state.restaurant.activeOrders.splice(orderIndex, 1)

                    // Update customer status if this customer exists
                    const customerId = order.customerId
                    const customerIndex = state.restaurant.activeCustomers.findIndex(
                        (c: Customer) => c.id === customerId
                    )
                    if (customerIndex !== -1) {
                        state.restaurant.activeCustomers[customerIndex].status = 'served'
                    }
                }
            }),

            updateCustomerSatisfaction: (customerId, satisfactionScore) => set((state) => {
                const customerIndex = state.restaurant.activeCustomers.findIndex(
                    (c: Customer) => c.id === customerId
                )
                if (customerIndex !== -1) {
                    state.restaurant.activeCustomers[customerIndex].satisfaction = satisfactionScore

                    // Update tips based on satisfaction
                    const tipPercentage = satisfactionScore / 100
                    state.restaurant.activeCustomers[customerIndex].tip = Math.floor(tipPercentage * 5)

                    // Update restaurant reputation
                    // Satisfaction above 50 increases reputation, below 50 decreases it
                    const reputationChange = (satisfactionScore - 50) / 10
                    state.restaurant.reputation = Math.max(0, Math.min(100, state.restaurant.reputation + reputationChange))
                }
            }),

            updateIngredientQuantity: (ingredientId, quantityChange) => set((state) => {
                const ingredientIndex = state.restaurant.inventory.findIndex(
                    (i: Ingredient) => i.id === ingredientId
                )
                if (ingredientIndex !== -1) {
                    state.restaurant.inventory[ingredientIndex].quantity += quantityChange
                }
            }),

            updateEquipmentStatus: (equipmentId, status) => set((state) => {
                const equipmentIndex = state.restaurant.equipment.findIndex(
                    (e: Equipment) => e.id === equipmentId
                )
                if (equipmentIndex !== -1) {
                    state.restaurant.equipment[equipmentIndex].status = status
                }
            })
        }
    }))
) 