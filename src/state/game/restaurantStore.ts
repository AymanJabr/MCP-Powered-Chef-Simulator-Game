import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Restaurant, Customer, Order, Ingredient, Equipment, Dish } from '@/types/models'

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
        takeOrder: (tableId: string, dishId: string) => { success: boolean, message?: string, order?: Order }
        completeOrder: (orderId: string, tipAmount: number) => void
        updateCustomerSatisfaction: (customerId: string, satisfactionScore: number) => void
        updateIngredientQuantity: (ingredientId: string, quantityChange: number) => void
        updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void
        initializeInventory: () => Promise<void>;
    }
}

export const useRestaurantStore = create<RestaurantState>()(
    immer((set, get) => ({
        restaurant: {
            name: 'MCP-Powered Chef Restaurant',
            level: 1,
            reputation: 2.5,
            funds: 1000,
            customerCapacity: 8,
            activeCustomers: [] as Customer[],
            customerQueue: [
                {
                    id: 'girl_1',
                    order: null,
                    patience: 85,
                    arrivalTime: Date.now() - 30000,
                    status: 'waiting' as const,
                    satisfaction: 75,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/girl_1/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 30,
                            characterArtHeight: 75,
                            steps: 9,
                            fps: 10,
                        }
                    }
                },
                {
                    id: 'girl_2',
                    order: null,
                    patience: 88,
                    arrivalTime: Date.now() - 25000,
                    status: 'waiting' as const,
                    satisfaction: 70,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/girl_2/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 35,
                            characterArtHeight: 75,
                            steps: 7,
                            fps: 8,
                        }
                    }
                },
                {
                    id: 'man_1',
                    order: null,
                    patience: 92,
                    arrivalTime: Date.now() - 15000,
                    status: 'waiting' as const,
                    satisfaction: 80,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/man_1/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 35,
                            characterArtHeight: 75,
                            steps: 5,
                            fps: 5,
                        }
                    }
                },
                {
                    id: 'girl_3',
                    order: null,
                    patience: 80,
                    arrivalTime: Date.now() - 20000,
                    status: 'waiting' as const,
                    satisfaction: 65,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/girl_3/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 35,
                            characterArtHeight: 75,
                            steps: 6,
                            fps: 5,
                        }
                    }
                },
                {
                    id: 'girl_4',
                    order: null,
                    patience: 90,
                    arrivalTime: Date.now() - 10000,
                    status: 'waiting' as const,
                    satisfaction: 78,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/girl_4/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 50,
                            characterArtHeight: 75,
                            steps: 5,
                            fps: 5,
                        }
                    }
                },
                {
                    id: 'girl_5',
                    order: null,
                    patience: 82,
                    arrivalTime: Date.now() - 5000,
                    status: 'waiting' as const,
                    satisfaction: 72,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/girl_5/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 50,
                            characterArtHeight: 75,
                            steps: 5,
                            fps: 5,
                        }
                    }
                },
                {
                    id: 'man_2',
                    order: null,
                    patience: 95,
                    arrivalTime: Date.now() - 28000,
                    status: 'waiting' as const,
                    satisfaction: 82,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/man_2/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 70,
                            characterArtHeight: 70,
                            steps: 6,
                            fps: 6,
                        }
                    }
                },

                {
                    id: 'man_3',
                    order: null,
                    patience: 87,
                    arrivalTime: Date.now() - 22000,
                    status: 'waiting' as const,
                    satisfaction: 77,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/man_3/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 70,
                            characterArtHeight: 75,
                            steps: 6,
                            fps: 6,
                        }
                    }
                },
                {
                    id: 'man_4',
                    order: null,
                    patience: 93,
                    arrivalTime: Date.now() - 12000,
                    status: 'waiting' as const,
                    satisfaction: 85,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/man_4/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 70,
                            characterArtHeight: 75,
                            steps: 7,
                            fps: 7,
                        }
                    }
                },
                {
                    id: 'man_5',
                    order: null,
                    patience: 89,
                    arrivalTime: Date.now() - 8000,
                    status: 'waiting' as const,
                    satisfaction: 79,
                    tip: 0,
                    animationState: 'idle',
                    spriteConfig: {
                        idle: {
                            sheetUrl: '/assets/images/characters/man_5/Idle.png',
                            sheetFrameWidth: 128,
                            sheetFrameHeight: 128,
                            characterArtWidth: 70,
                            characterArtHeight: 75,
                            steps: 7,
                            fps: 7,
                        }
                    }
                }
            ],
            activeOrders: [],
            completedOrders: [],
            inventory: [],
            equipment: [],
            unlockedMenuItems: [] as string[]
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
                    const customerIndex = state.restaurant.customerQueue.findIndex(
                        (c: Customer) => c.id === customerId
                    )
                    if (customerIndex === -1) {
                        message = 'Customer not found in queue'
                        return
                    }

                    if (state.restaurant.activeCustomers.length >= state.restaurant.customerCapacity) {
                        message = 'Restaurant is at full capacity'
                        return
                    }

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

            takeOrder: (tableId, dishId) => {
                let success = false;
                let message = 'Failed to take order';
                let order: Order | undefined = undefined;

                set((state) => {
                    const customerIndex = state.restaurant.activeCustomers.findIndex(
                        (c: Customer) => c.tableId === tableId && c.status === 'seated' && !c.order
                    );

                    if (customerIndex === -1) {
                        message = 'No customer at this table is ready to order, or an order already exists.';
                        return;
                    }

                    const customer = state.restaurant.activeCustomers[customerIndex];
                    const dish: Dish = state.restaurant.menuItems?.find(d => d.id === dishId) || {
                        id: dishId,
                        name: 'Placeholder Dish ' + dishId.slice(-3),
                        basePrice: 10,
                        recipeId: 'recipe_placeholder',
                        cookingDifficulty: 3,
                        preparationTime: 300,
                        plateAppearance: 3,
                    };

                    const newOrder: Order = {
                        id: `order_${Date.now()}_${customer.id.slice(-3)}`,
                        customerId: customer.id,
                        dish: dish,
                        customizations: [],
                        status: 'received',
                        startTime: Date.now(),
                        completionTime: null,
                        qualityScore: 0,
                        tip: 0,
                        isPriority: Math.random() < 0.2
                    };

                    state.restaurant.activeOrders.push(newOrder);
                    state.restaurant.activeCustomers[customerIndex].order = newOrder;
                    order = newOrder;
                    success = true;
                    message = `Order for ${dish.name} taken for customer ${customer.id}.`;
                });

                return { success, message, order };
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
                    order.tip = tipAmount
                    state.restaurant.completedOrders.push(order)
                    state.restaurant.activeOrders.splice(orderIndex, 1)
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
                    const tipPercentage = satisfactionScore / 100
                    state.restaurant.activeCustomers[customerIndex].tip = Math.floor(tipPercentage * 5)
                    const reputationChange = (satisfactionScore - 50) / 10
                    state.restaurant.reputation = Math.max(0, Math.min(5, state.restaurant.reputation + reputationChange))
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
            }),

            initializeInventory: async () => {
                try {
                    const response = await fetch('/assets/data/ingredients/ingredients.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const rawIngredients: Ingredient[] = await response.json();

                    const processedIngredients = rawIngredients.map(ing => ({
                        ...ing,
                        image: ing.image ? `/assets/images/ingredients${ing.image.startsWith('/') ? ing.image : '/' + ing.image}` : undefined
                    }));

                    set((state) => {
                        state.restaurant.inventory = processedIngredients;
                    });
                    console.log('Restaurant inventory initialized from JSON.');
                } catch (error) {
                    console.error("Failed to initialize inventory:", error);
                    // Optionally, set some default/fallback inventory or handle error state
                }
            }
        }
    }))
) 