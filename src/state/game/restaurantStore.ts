import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Customer, Order, Ingredient, Equipment } from '@/types/models'

interface RestaurantState {
    name: string
    level: number
    reputation: number
    funds: number
    customerCapacity: number
    activeCustomers: Customer[]
    customerQueue: Customer[]
    activeOrders: Order[]
    completedOrders: Order[]
    inventory: Ingredient[]
    equipment: Equipment[]
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
        equipment: [],
        actions: {
            setName: (name) => set((state) => {
                state.name = name
            }),

            setLevel: (level) => set((state) => {
                state.level = level
            }),

            updateFunds: (amount) => set((state) => {
                state.funds += amount
            }),

            addCustomerToQueue: (customer) => set((state) => {
                state.customerQueue.push(customer)
            }),

            removeCustomerFromQueue: (customerId) => set((state) => {
                state.customerQueue = state.customerQueue.filter((c: Customer) => c.id !== customerId)
            }),

            seatCustomer: (customerId, tableId) => {
                let success = false
                let message = 'Failed to seat customer'

                set((state) => {
                    // Check if customer exists in queue
                    const customerIndex = state.customerQueue.findIndex((c: Customer) => c.id === customerId)
                    if (customerIndex === -1) {
                        message = 'Customer not found in queue'
                        return
                    }

                    // Check if at capacity
                    if (state.activeCustomers.length >= state.customerCapacity) {
                        message = 'Restaurant is at full capacity'
                        return
                    }

                    // Move customer from queue to active customers
                    const customer = state.customerQueue[customerIndex]
                    customer.tableId = tableId
                    customer.status = 'seated'

                    state.activeCustomers.push(customer)
                    state.customerQueue.splice(customerIndex, 1)

                    success = true
                    message = 'Customer seated successfully'
                })

                return { success, message }
            },

            addActiveOrder: (order) => set((state) => {
                state.activeOrders.push(order)
            }),

            updateOrderStatus: (orderId, status) => set((state) => {
                const orderIndex = state.activeOrders.findIndex((o: Order) => o.id === orderId)
                if (orderIndex !== -1) {
                    state.activeOrders[orderIndex].status = status

                    // If order is now served, record the completion time
                    if (status === 'served' && !state.activeOrders[orderIndex].completionTime) {
                        state.activeOrders[orderIndex].completionTime = Date.now()
                    }
                }
            }),

            completeOrder: (orderId, tipAmount) => set((state) => {
                const orderIndex = state.activeOrders.findIndex((o: Order) => o.id === orderId)
                if (orderIndex !== -1) {
                    const order = state.activeOrders[orderIndex]

                    // Add tip amount to the order
                    order.tip = tipAmount

                    // Move from active to completed orders
                    state.completedOrders.push(order)
                    state.activeOrders.splice(orderIndex, 1)

                    // Update customer status if this customer exists
                    const customerId = order.customerId
                    const customerIndex = state.activeCustomers.findIndex((c: Customer) => c.id === customerId)
                    if (customerIndex !== -1) {
                        state.activeCustomers[customerIndex].status = 'served'
                    }
                }
            }),

            updateCustomerSatisfaction: (customerId, satisfactionScore) => set((state) => {
                const customerIndex = state.activeCustomers.findIndex((c: Customer) => c.id === customerId)
                if (customerIndex !== -1) {
                    state.activeCustomers[customerIndex].satisfaction = satisfactionScore

                    // Update tips based on satisfaction
                    const tipPercentage = satisfactionScore / 100
                    state.activeCustomers[customerIndex].tip = Math.floor(tipPercentage * 5)

                    // Update restaurant reputation
                    // Satisfaction above 50 increases reputation, below 50 decreases it
                    const reputationChange = (satisfactionScore - 50) / 10
                    state.reputation = Math.max(0, Math.min(100, state.reputation + reputationChange))
                }
            }),

            updateIngredientQuantity: (ingredientId, quantityChange) => set((state) => {
                const ingredientIndex = state.inventory.findIndex((i: Ingredient) => i.id === ingredientId)
                if (ingredientIndex !== -1) {
                    state.inventory[ingredientIndex].quantity += quantityChange
                }
            }),

            updateEquipmentStatus: (equipmentId, status) => set((state) => {
                const equipmentIndex = state.equipment.findIndex((e: Equipment) => e.id === equipmentId)
                if (equipmentIndex !== -1) {
                    state.equipment[equipmentIndex].status = status
                }
            })
        }
    }))
) 