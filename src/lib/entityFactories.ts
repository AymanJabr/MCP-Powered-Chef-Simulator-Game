import {
    Customer,
    Order,
    Dish,
    Ingredient,
    Equipment,
    Player,
    PlayerAction,
    Restaurant,
    Recipe,
    CookingStep,
    Position,
    SavedCommand,
    MCPAssistant,
    MCPCommand,
    MCPAction,
    Game
} from '@/types/models';
import { customerTemplates } from '@/config/customerTemplates';

export function createCustomer(partial: Partial<Customer> = {}): Customer {
    const template = customerTemplates[Math.floor(Math.random() * customerTemplates.length)];
    const randomPatience = Math.floor(Math.random() * 31) + 80;

    return {
        id: `customer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order: null,
        patience: randomPatience,
        arrivalTime: Date.now(),
        status: 'waiting',
        satisfaction: Math.floor(Math.random() * 21) + 60,
        tip: 0,
        animationState: template.animationState || 'idle',
        spriteConfig: template.spriteConfig,
        ...partial
    };
}

export function createOrder(partial: Partial<Order> = {}): Order {
    return {
        id: `order_${Date.now()}`,
        customerId: '',
        dish: createDish(),
        customizations: [],
        status: 'received',
        startTime: Date.now(),
        completionTime: null,
        qualityScore: 0,
        tip: 0,
        ...partial
    };
}

export function createDish(partial: Partial<Dish> = {}): Dish {
    return {
        id: `dish_${Date.now()}`,
        name: 'New Dish',
        basePrice: 10,
        recipeId: '',
        cookingDifficulty: 1,
        unlockDifficulty: 1,
        ...partial
    };
}

export function createRecipe(partial: Partial<Recipe> = {}): Recipe {
    return {
        id: `recipe_${Date.now()}`,
        ingredients: [],
        cookingSteps: [],
        ...partial
    };
}

export function createCookingStep(partial: Partial<CookingStep> = {}): CookingStep {
    return {
        type: 'chop',
        duration: 30, // seconds
        ingredientIds: [],
        equipmentId: '',
        ...partial
    };
}

export function createIngredient(partial: Partial<Ingredient> = {}): Ingredient {
    return {
        id: `ingredient_${Date.now()}`,
        name: 'New Ingredient',
        category: 'vegetable',
        quality: 100,
        quantity: 0,
        cost: 5,
        ...partial
    };
}

export function createEquipment(partial: Partial<Equipment> = {}): Equipment {
    return {
        id: `equipment_${Date.now()}`,
        name: 'New Equipment',
        status: 'idle',
        capacity: 1,
        efficiency: 1,
        reliability: 1,
        ...partial
    };
}

export function createPlayer(partial: Partial<Player> = {}): Player {
    return {
        id: `player_${Date.now()}`,
        name: 'Player',
        score: 0,
        speed: 1,
        skill: 1,
        position: createPosition(),
        currentAction: null,
        actionQueue: [],
        actionHistory: [],
        savedCommands: [],
        direction: 'down',
        animationState: 'idle',
        ...partial
    };
}

export function createPosition(partial: Partial<Position> = {}): Position {
    return {
        x: 0,
        y: 0,
        area: 'kitchen',
        ...partial
    };
}

export function createPlayerAction(partial: Partial<PlayerAction> = {}): PlayerAction {
    return {
        id: `action_${Date.now()}`,
        type: 'move',
        target: '',
        startTime: Date.now(),
        duration: 1000, // ms
        status: 'queued',
        completionTime: null,
        ...partial
    };
}

export function createRestaurant(partial: Partial<Restaurant> = {}): Restaurant {
    return {
        name: 'New Restaurant',
        level: 1,
        reputation: 50,
        funds: 1000,
        customerCapacity: 10,
        activeCustomers: [],
        customerQueue: [],
        activeOrders: [],
        completedOrders: [],
        inventory: [],
        equipment: [],
        menuItems: [],
        unlockedMenuItems: [],
        ...partial
    };
}

export function createSavedCommand(partial: Partial<SavedCommand> = {}): SavedCommand {
    return {
        id: `command_${Date.now()}`,
        name: 'New Command',
        command: '',
        tags: [],
        ...partial
    };
}

export function createMCPAssistant(partial: Partial<MCPAssistant> = {}): MCPAssistant {
    return {
        isActive: false,
        currentCommand: null,
        commandHistory: [],
        performanceMetrics: {
            successRate: 0,
            averageResponseTime: 0,
            customerSatisfactionDelta: 0,
            ordersPerMinute: 0,
            commandsExecuted: 0,
            failedCommands: 0
        },
        provider: {
            name: 'anthropic',
            model: 'claude-3-sonnet-20240229',
            temperature: 0.7,
            maxTokens: 4096
        },
        status: 'idle',
        ...partial
    };
}

export function createMCPCommand(partial: Partial<MCPCommand> = {}): MCPCommand {
    return {
        id: `mcpcmd_${Date.now()}`,
        input: '',
        response: null,
        actions: [],
        startTime: Date.now(),
        completionTime: null,
        success: null,
        ...partial
    };
}

export function createMCPAction(partial: Partial<MCPAction> = {}): MCPAction {
    return {
        id: `mcpaction_${Date.now()}`,
        type: 'take_order',
        target: '',
        params: {},
        status: 'pending',
        timestamp: Date.now(),
        ...partial
    };
}

export function createGame(partial: Partial<Game> = {}): Game {
    return {
        gameMode: 'manual',
        difficulty: 1,
        timeElapsed: 0,
        isPaused: false,
        gamePhase: 'preGame',
        performanceMetrics: {
            customerSatisfaction: 0,
            orderCompletionTime: 0,
            financialPerformance: 0,
            efficiency: 0
        },
        settings: {
            audioEnabled: true,
            sfxVolume: 0.7,
            musicVolume: 0.5,
            tutorialCompleted: false
        },
        ...partial
    };
} 