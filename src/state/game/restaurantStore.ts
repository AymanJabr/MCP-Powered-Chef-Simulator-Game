import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Restaurant, Customer, Order, Ingredient, Equipment, Dish, Recipe } from '@/types/models'
import { useGameStore } from '@/state/game/gameStore'
import { calculateMaxOrderableDifficulty } from '@/lib/gameLoop'

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
        initializeFullMenu: () => Promise<void>;
        initializeEquipment: () => Promise<void>;
        initializeRecipes: () => Promise<void>;
        resetRestaurantState: () => void;
        incrementLostCustomers: () => void;
        useEquipment: (equipmentId: string) => void;
    }
}

export const useRestaurantStore = create<RestaurantState>()(
    immer((set) => ({
        restaurant: {
            name: 'MCP-Powered Chef Restaurant',
            level: 1,
            lostCustomers: 0,
            funds: 1000,
            customerCapacity: 8,
            activeCustomers: [] as Customer[],
            customerQueue: [] as Customer[],
            activeOrders: [] as Order[],
            completedOrders: [] as Order[],
            inventory: [] as Ingredient[],
            equipment: [] as Equipment[],
            menuItems: [] as Dish[],
            allRecipes: [] as Recipe[]
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
                const { game } = useGameStore.getState();
                const maxDifficulty = calculateMaxOrderableDifficulty(game.difficulty);

                set((state) => {
                    const customerIndex = state.restaurant.activeCustomers.findIndex(
                        (c: Customer) => c.tableId === tableId && c.status === 'seated' && !c.order
                    );

                    if (customerIndex === -1) {
                        message = 'No customer at this table is ready to order, or an order already exists.';
                        return;
                    }

                    const customer = state.restaurant.activeCustomers[customerIndex];
                    const dish = state.restaurant.menuItems?.find(d => d.id === dishId);

                    if (!dish) {
                        message = `Dish with ID ${dishId} not found in the menu.`;
                        return;
                    }

                    if (dish.cookingDifficulty > maxDifficulty) {
                        message = `Dish ${dish.name} is too difficult to prepare at the current game difficulty. Max allowed: ${maxDifficulty}`;
                        return;
                    }

                    const newOrder: Order = {
                        id: `order_${Date.now()}_${customer.id.slice(-3)}`,
                        customerId: customer.id,
                        dish: dish,
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

            useEquipment: (equipmentId: string) => set((state) => {
                const equipment = state.restaurant.equipment.find(e => e.id === equipmentId);
                if (equipment) {
                    // Decrease reliability by a small amount
                    equipment.reliability -= 0.1;

                    // If reliability hits 0, the equipment breaks
                    if (equipment.reliability <= 0) {
                        equipment.reliability = 0; // Prevent it from going negative
                        equipment.status = 'broken';
                        console.warn(`${equipment.name} has broken!`);
                    }
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
                    console.log('Restaurant inventory initialized from JSON with corrected image paths.');
                } catch (error) {
                    console.error("Failed to initialize inventory:", error);
                }
            },

            initializeFullMenu: async () => {
                try {
                    const response = await fetch('/assets/data/dishes/dishes.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const dishes: Dish[] = await response.json();
                    set((state) => {
                        state.restaurant.menuItems = dishes;
                    });
                    console.log('Restaurant full menu initialized from JSON.');
                } catch (error) {
                    console.error("Failed to initialize full menu:", error);
                }
            },

            initializeEquipment: async () => {
                try {
                    const response = await fetch('/assets/data/equipment/equipment.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const rawEquipment: Equipment[] = await response.json();

                    const processedEquipment = rawEquipment.map(eq => ({
                        ...eq,
                        image: `/assets/images/equipment${eq.image}`
                    }));

                    set((state) => {
                        state.restaurant.equipment = processedEquipment;
                    });
                    console.log('Restaurant equipment initialized from JSON.');
                } catch (error) {
                    console.error("Failed to initialize equipment:", error);
                }
            },

            initializeRecipes: async () => {
                try {
                    const response = await fetch('/assets/data/recipes/recipes.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const recipes: Recipe[] = await response.json();
                    set((state) => {
                        state.restaurant.allRecipes = recipes;
                    });
                    console.log('Restaurant recipes initialized from JSON.');
                } catch (error) {
                    console.error("Failed to initialize recipes:", error);
                }
            },

            resetRestaurantState: () => set((state) => {
                state.restaurant.activeCustomers = [];
                state.restaurant.customerQueue = [];
                state.restaurant.activeOrders = [];
                state.restaurant.completedOrders = [];
                state.restaurant.funds = 1000; // Initial funds
                state.restaurant.lostCustomers = 0; // Reset lostCustomers
            }),

            incrementLostCustomers: () => set((state) => {
                state.restaurant.lostCustomers += 1;
            })
        }
    }))
) 