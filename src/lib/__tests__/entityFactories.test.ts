import {
    createCustomer,
    createOrder,
    createDish,
    createRecipe,
    createCookingStep,
    createIngredient,
    createEquipment,
    createPlayer,
    createPosition,
    createPlayerAction,
    createRestaurant,
    createSavedCommand,
    createMCPAssistant,
    createMCPCommand,
    createMCPAction,
    createGame
} from '../entityFactories';

describe('Entity Factories', () => {
    describe('createCustomer', () => {
        it('should create a customer with default values', () => {
            const customer = createCustomer();

            expect(customer.id).toContain('customer_');
            expect(customer.order).toBeNull();
            expect(customer.patience).toBe(100);
            expect(customer.status).toBe('waiting');
            expect(customer.satisfaction).toBe(0);
            expect(customer.tip).toBe(0);
            expect(customer.arrivalTime).toBeLessThanOrEqual(Date.now());
        });

        it('should override default values with provided partials', () => {
            const customer = createCustomer({
                patience: 50,
                satisfaction: 75,
                status: 'seated'
            });

            expect(customer.patience).toBe(50);
            expect(customer.satisfaction).toBe(75);
            expect(customer.status).toBe('seated');
            expect(customer.id).toContain('customer_'); // Default still applies
        });
    });

    describe('createOrder', () => {
        it('should create an order with default values', () => {
            const order = createOrder();

            expect(order.id).toContain('order_');
            expect(order.customerId).toBe('');
            expect(order.customizations).toEqual([]);
            expect(order.status).toBe('received');
            expect(order.startTime).toBeLessThanOrEqual(Date.now());
            expect(order.completionTime).toBeNull();
            expect(order.qualityScore).toBe(0);
        });

        it('should override default values with provided partials', () => {
            const order = createOrder({
                customerId: 'customer_123',
                status: 'cooking',
                qualityScore: 85
            });

            expect(order.customerId).toBe('customer_123');
            expect(order.status).toBe('cooking');
            expect(order.qualityScore).toBe(85);
        });
    });

    describe('createDish', () => {
        it('should create a dish with default values', () => {
            const dish = createDish();

            expect(dish.id).toContain('dish_');
            expect(dish.name).toBe('New Dish');
            expect(dish.basePrice).toBe(10);
            expect(dish.cookingDifficulty).toBe(1);
            expect(dish.preparationTime).toBe(60);
            expect(dish.plateAppearance).toBe(1);
            expect(dish.recipe).toBeDefined();
        });

        it('should override default values with provided partials', () => {
            const dish = createDish({
                name: 'Burger',
                basePrice: 15,
                cookingDifficulty: 2
            });

            expect(dish.name).toBe('Burger');
            expect(dish.basePrice).toBe(15);
            expect(dish.cookingDifficulty).toBe(2);
        });
    });

    describe('createRecipe', () => {
        it('should create a recipe with default values', () => {
            const recipe = createRecipe();

            expect(recipe.id).toContain('recipe_');
            expect(recipe.ingredients).toEqual([]);
            expect(recipe.cookingSteps).toEqual([]);
        });

        it('should override default values with provided partials', () => {
            const recipe = createRecipe({
                ingredients: ['ing_1', 'ing_2'],
                cookingSteps: [{ type: 'fry', duration: 60, ingredientId: 'ing_1', equipmentId: 'eq_1' }]
            });

            expect(recipe.ingredients).toEqual(['ing_1', 'ing_2']);
            expect(recipe.cookingSteps).toHaveLength(1);
            expect(recipe.cookingSteps[0].type).toBe('fry');
        });
    });

    describe('createCookingStep', () => {
        it('should create a cooking step with default values', () => {
            const step = createCookingStep();

            expect(step.type).toBe('chop');
            expect(step.duration).toBe(30);
            expect(step.ingredientId).toBe('');
            expect(step.equipmentId).toBe('');
        });

        it('should override default values with provided partials', () => {
            const step = createCookingStep({
                type: 'grill',
                duration: 120,
                ingredientId: 'ing_3'
            });

            expect(step.type).toBe('grill');
            expect(step.duration).toBe(120);
            expect(step.ingredientId).toBe('ing_3');
        });
    });

    describe('createIngredient', () => {
        it('should create an ingredient with default values', () => {
            const ingredient = createIngredient();

            expect(ingredient.id).toContain('ingredient_');
            expect(ingredient.name).toBe('New Ingredient');
            expect(ingredient.category).toBe('vegetable');
            expect(ingredient.quality).toBe(100);
            expect(ingredient.quantity).toBe(0);
            expect(ingredient.cost).toBe(5);
        });

        it('should override default values with provided partials', () => {
            const ingredient = createIngredient({
                name: 'Tomato',
                category: 'vegetable',
                quantity: 10
            });

            expect(ingredient.name).toBe('Tomato');
            expect(ingredient.category).toBe('vegetable');
            expect(ingredient.quantity).toBe(10);
        });
    });

    describe('createEquipment', () => {
        it('should create equipment with default values', () => {
            const equipment = createEquipment();

            expect(equipment.id).toContain('equipment_');
            expect(equipment.name).toBe('New Equipment');
            expect(equipment.status).toBe('idle');
            expect(equipment.capacity).toBe(1);
            expect(equipment.efficiency).toBe(1);
            expect(equipment.reliability).toBe(1);
        });

        it('should override default values with provided partials', () => {
            const equipment = createEquipment({
                name: 'Stove',
                capacity: 4,
                status: 'in_use'
            });

            expect(equipment.name).toBe('Stove');
            expect(equipment.capacity).toBe(4);
            expect(equipment.status).toBe('in_use');
        });
    });

    describe('createPlayer', () => {
        it('should create a player with default values', () => {
            const player = createPlayer();

            expect(player.id).toContain('player_');
            expect(player.name).toBe('Player');
            expect(player.score).toBe(0);
            expect(player.speed).toBe(1);
            expect(player.skill).toBe(1);
            expect(player.position).toBeDefined();
            expect(player.currentAction).toBeNull();
            expect(player.actionQueue).toEqual([]);
            expect(player.actionHistory).toEqual([]);
            expect(player.savedCommands).toEqual([]);
        });

        it('should override default values with provided partials', () => {
            const player = createPlayer({
                name: 'Chef Alex',
                score: 100,
                skill: 2
            });

            expect(player.name).toBe('Chef Alex');
            expect(player.score).toBe(100);
            expect(player.skill).toBe(2);
        });
    });

    describe('createPosition', () => {
        it('should create a position with default values', () => {
            const position = createPosition();

            expect(position.x).toBe(0);
            expect(position.y).toBe(0);
            expect(position.area).toBe('kitchen');
        });

        it('should override default values with provided partials', () => {
            const position = createPosition({
                x: 10,
                y: 20,
                area: 'dining'
            });

            expect(position.x).toBe(10);
            expect(position.y).toBe(20);
            expect(position.area).toBe('dining');
        });
    });

    describe('createPlayerAction', () => {
        it('should create a player action with default values', () => {
            const action = createPlayerAction();

            expect(action.id).toContain('action_');
            expect(action.type).toBe('move');
            expect(action.target).toBe('');
            expect(action.startTime).toBeLessThanOrEqual(Date.now());
            expect(action.duration).toBe(1000);
            expect(action.status).toBe('queued');
            expect(action.completionTime).toBeNull();
        });

        it('should override default values with provided partials', () => {
            const action = createPlayerAction({
                type: 'cook',
                target: 'ingredient_123',
                status: 'in_progress'
            });

            expect(action.type).toBe('cook');
            expect(action.target).toBe('ingredient_123');
            expect(action.status).toBe('in_progress');
        });
    });

    describe('createRestaurant', () => {
        it('should create a restaurant with default values', () => {
            const restaurant = createRestaurant();

            expect(restaurant.name).toBe('New Restaurant');
            expect(restaurant.level).toBe(1);
            expect(restaurant.reputation).toBe(50);
            expect(restaurant.funds).toBe(1000);
            expect(restaurant.customerCapacity).toBe(10);
            expect(restaurant.activeCustomers).toEqual([]);
            expect(restaurant.customerQueue).toEqual([]);
            expect(restaurant.activeOrders).toEqual([]);
            expect(restaurant.completedOrders).toEqual([]);
            expect(restaurant.inventory).toEqual([]);
            expect(restaurant.equipment).toEqual([]);
        });

        it('should override default values with provided partials', () => {
            const restaurant = createRestaurant({
                name: 'Gourmet Bistro',
                level: 3,
                funds: 5000
            });

            expect(restaurant.name).toBe('Gourmet Bistro');
            expect(restaurant.level).toBe(3);
            expect(restaurant.funds).toBe(5000);
        });
    });

    describe('createSavedCommand', () => {
        it('should create a saved command with default values', () => {
            const command = createSavedCommand();

            expect(command.id).toContain('command_');
            expect(command.name).toBe('New Command');
            expect(command.command).toBe('');
            expect(command.tags).toEqual([]);
        });

        it('should override default values with provided partials', () => {
            const command = createSavedCommand({
                name: 'Quick Serve',
                command: 'Serve all plated dishes',
                tags: ['service', 'efficiency']
            });

            expect(command.name).toBe('Quick Serve');
            expect(command.command).toBe('Serve all plated dishes');
            expect(command.tags).toEqual(['service', 'efficiency']);
        });
    });

    describe('createMCPAssistant', () => {
        it('should create an MCP assistant with default values', () => {
            const assistant = createMCPAssistant();

            expect(assistant.isActive).toBe(false);
            expect(assistant.currentCommand).toBeNull();
            expect(assistant.commandHistory).toEqual([]);
            expect(assistant.status).toBe('idle');

            // Performance metrics
            expect(assistant.performanceMetrics.successRate).toBe(0);
            expect(assistant.performanceMetrics.averageResponseTime).toBe(0);

            // Provider
            expect(assistant.provider.name).toBe('claude');
            expect(assistant.provider.model).toBeDefined();
        });

        it('should override default values with provided partials', () => {
            const assistant = createMCPAssistant({
                isActive: true,
                currentCommand: 'Take all orders',
                status: 'processing'
            });

            expect(assistant.isActive).toBe(true);
            expect(assistant.currentCommand).toBe('Take all orders');
            expect(assistant.status).toBe('processing');
        });
    });

    describe('createMCPCommand', () => {
        it('should create an MCP command with default values', () => {
            const command = createMCPCommand();

            expect(command.id).toContain('mcpcmd_');
            expect(command.input).toBe('');
            expect(command.response).toBeNull();
            expect(command.actions).toEqual([]);
            expect(command.startTime).toBeLessThanOrEqual(Date.now());
            expect(command.completionTime).toBeNull();
            expect(command.success).toBeNull();
        });

        it('should override default values with provided partials', () => {
            const command = createMCPCommand({
                input: 'Cook all dishes',
                response: 'Starting to cook',
                success: true
            });

            expect(command.input).toBe('Cook all dishes');
            expect(command.response).toBe('Starting to cook');
            expect(command.success).toBe(true);
        });
    });

    describe('createMCPAction', () => {
        it('should create an MCP action with default values', () => {
            const action = createMCPAction();

            expect(action.id).toContain('mcpaction_');
            expect(action.type).toBe('take_order');
            expect(action.target).toBe('');
            expect(action.params).toEqual({});
            expect(action.status).toBe('pending');
            expect(action.timestamp).toBeLessThanOrEqual(Date.now());
        });

        it('should override default values with provided partials', () => {
            const action = createMCPAction({
                type: 'cook_ingredient',
                target: 'ingredient_456',
                params: { cookingTime: 120 },
                status: 'successful'
            });

            expect(action.type).toBe('cook_ingredient');
            expect(action.target).toBe('ingredient_456');
            expect(action.params).toEqual({ cookingTime: 120 });
            expect(action.status).toBe('successful');
        });
    });

    describe('createGame', () => {
        it('should create a game with default values', () => {
            const game = createGame();

            expect(game.gameMode).toBe('manual');
            expect(game.difficulty).toBe(1);
            expect(game.timeElapsed).toBe(0);
            expect(game.isPaused).toBe(false);
            expect(game.gamePhase).toBe('preGame');

            // Check performance metrics
            expect(game.performanceMetrics.customerSatisfaction).toBe(0);
            expect(game.performanceMetrics.orderCompletionTime).toBe(0);
            expect(game.performanceMetrics.financialPerformance).toBe(0);
            expect(game.performanceMetrics.efficiency).toBe(0);

            // Check settings
            expect(game.settings.audioEnabled).toBe(true);
            expect(game.settings.sfxVolume).toBe(0.7);
            expect(game.settings.musicVolume).toBe(0.5);
            expect(game.settings.tutorialCompleted).toBe(false);
        });

        it('should override default values with provided partials', () => {
            const game = createGame({
                gameMode: 'mcp',
                difficulty: 3,
                gamePhase: 'active'
            });

            expect(game.gameMode).toBe('mcp');
            expect(game.difficulty).toBe(3);
            expect(game.gamePhase).toBe('active');
        });
    });
}); 