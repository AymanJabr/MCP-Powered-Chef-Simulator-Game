// Customer model
export interface AnimationDetails {
    sheetUrl: string;
    sheetFrameWidth: number;
    sheetFrameHeight: number;
    characterArtWidth: number;
    characterArtHeight: number;
    steps: number;
    fps: number;
}

export interface CustomerSpriteConfig {
    idle?: AnimationDetails;
    walk?: AnimationDetails;
    // Future animation states like 'ordering', 'eating' can be added here
}

export interface Customer {
    id: string
    order: Order | null
    patience: number
    arrivalTime: number
    status: 'waiting' | 'seated' | 'served' | 'left'
    satisfaction: number
    tip: number
    tableId?: string // Added for tracking where customer is seated
    animationState?: 'idle' | 'walk'
    spriteConfig?: CustomerSpriteConfig; // New field for sprite configurations
}

// Order model
export interface Order {
    id: string
    customerId: string
    dish: Dish
    customizations: string[]
    status: 'received' | 'cooking' | 'plated' | 'served'
    startTime: number
    completionTime: number | null
    qualityScore: number
    tip: number
    isPriority?: boolean
}

// after Order interface add type alias
export type OrderStatus = 'received' | 'cooking' | 'plated' | 'served'

// Dish model
export interface Dish {
    id: string
    name: string
    basePrice: number
    recipeId: string
    cookingDifficulty: number
    preparationTime: number
    plateAppearance: number
    unlockDifficulty?: number
}

// Recipe model
export interface Recipe {
    id: string
    ingredients: string[] // IDs of required ingredients
    cookingSteps: CookingStep[]
}

// Cooking step
export interface CookingStep {
    type: CookingActionType
    duration: number
    ingredientIds: string[]
    equipmentId: string
}

// Ingredient model
export interface Ingredient {
    id: string
    name: string
    category: 'meat' | 'vegetable' | 'dairy' | 'grain' | 'sauce' | 'spice'
    quality: number
    quantity: number
    cost: number
    image?: string
}

// Equipment model
export interface Equipment {
    id: string
    name: string
    status: 'idle' | 'in_use' | 'broken'
    capacity: number
    efficiency: number
    reliability: number
}

// Cooking action type
export type CookingActionType = 'chop' | 'fry' | 'boil' | 'grill' | 'bake' | 'simmer' | 'mix' | 'freeze'

// Game model
export type GamePhase = 'tutorial' | 'preGame' | 'active' | 'gameOver'
export type GameMode = 'manual' | 'mcp'

export interface Game {
    gameMode: GameMode
    difficulty: number
    timeElapsed: number
    isPaused: boolean
    gamePhase: GamePhase
    performanceMetrics: {
        customerSatisfaction: number
        orderCompletionTime: number
        financialPerformance: number
        efficiency: number
    }
    settings: {
        audioEnabled: boolean
        sfxVolume: number
        musicVolume: number
        tutorialCompleted: boolean
    }
}

// Restaurant model
export interface Restaurant {  //TODO: maybe change from full Interfaces to just the IDs
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
    menuItems?: Dish[]
    unlockedMenuItems: string[] // IDs of dishes that have been unlocked
}

// Player model
export interface Player {
    id: string
    name: string
    score: number
    speed: number
    skill: number
    position: Position
    currentAction: PlayerAction | null
    actionQueue: PlayerAction[]
    actionHistory: PlayerAction[]
    savedCommands: SavedCommand[]
    direction: PlayerDirection;
    animationState: ChefAnimationType;
    spriteConfig?: ChefSpriteConfig;
}

// Player position
export interface Position {
    x: number
    y: number
    area: 'kitchen' | 'dining' | 'storage'
}

// Player action
export interface PlayerAction {
    id: string
    type: PlayerActionType
    target: string // ID of the target (ingredient, equipment, customer, etc.)
    startTime: number
    duration: number
    status: 'queued' | 'in_progress' | 'completed' | 'failed'
    completionTime: number | null
}

// Player action type
export type PlayerActionType =
    | 'move'
    | 'prepare_ingredient'
    | 'cook'
    | 'plate'
    | 'serve'
    | 'clean'
    | 'greet_customer'
    | 'take_order'

// Saved command for MCP
export interface SavedCommand {
    id: string
    name: string
    command: string
    tags: string[]
}

// Chef animation types
export type PlayerDirection = 'up' | 'down' | 'left' | 'right';

export type ChefAnimationType =
    | 'idle'
    | 'running_down' | 'running_up' | 'running_left' | 'running_right'
    | 'lifting_down' | 'lifting_up' | 'lifting_left' | 'lifting_right'
    | 'interacting_down' | 'interacting_up' | 'interacting_left' | 'interacting_right'
    | 'dropping_down' | 'dropping_up' | 'dropping_left' | 'dropping_right'
    | 'running_lifting_down' | 'running_lifting_up' | 'running_lifting_left' | 'running_lifting_right';

export interface ChefSpriteConfig {
    idle?: AnimationDetails;
    running_down?: AnimationDetails;
    running_up?: AnimationDetails;
    running_left?: AnimationDetails;
    running_right?: AnimationDetails;
    lifting_down?: AnimationDetails;
    lifting_up?: AnimationDetails;
    lifting_left?: AnimationDetails;
    lifting_right?: AnimationDetails;
    interacting_down?: AnimationDetails;
    interacting_up?: AnimationDetails;
    interacting_left?: AnimationDetails;
    interacting_right?: AnimationDetails;
    dropping_down?: AnimationDetails;
    dropping_up?: AnimationDetails;
    dropping_left?: AnimationDetails;
    dropping_right?: AnimationDetails;
    running_lifting_down?: AnimationDetails;
    running_lifting_up?: AnimationDetails;
    running_lifting_left?: AnimationDetails;
    running_lifting_right?: AnimationDetails;
}

// MCP Assistant model
export interface MCPAssistant {
    isActive: boolean
    currentCommand: string | null
    commandHistory: MCPCommand[]
    performanceMetrics: MCPPerformanceMetrics
    provider: LLMProvider
    status: 'idle' | 'processing' | 'executing'
}

// MCP Command
export interface MCPCommand {
    id: string
    input: string // What the user told the assistant to do
    response: string | null // The assistant's response
    actions: MCPAction[] // Actions the assistant took based on the command
    startTime: number
    completionTime: number | null
    success: boolean | null // Whether the command was successful
}

// Define ParameterDefinition and ToolParameters before MCPAction
export interface ParameterDefinition {
    type: string;
    description: string;
}

export interface ToolParameters {
    [key: string]: ParameterDefinition;
}

// Define the union type for MCPActionResult values
export type MCPActionResultValue = string | number | boolean | Position | undefined;

// Define MCPActionResult before MCPAction
export interface MCPActionResult {
    success: boolean;
    message?: string;
    [key: string]: MCPActionResultValue;
}

// MCP Action
export interface MCPAction {
    id: string
    type: MCPActionType
    target: string
    params: Record<string, ToolParameters>
    status: 'pending' | 'successful' | 'failed'
    timestamp: number
    result?: MCPActionResult
}

// MCP Action Type
export type MCPActionType =
    | 'greet_customer'
    | 'take_order'
    | 'serve_order'
    | 'prepare_ingredient'
    | 'cook_ingredient'
    | 'plate_dish'
    | 'purchase_ingredients'

// MCP Performance Metrics
export interface MCPPerformanceMetrics {
    successRate: number
    averageResponseTime: number
    customerSatisfactionDelta: number
    ordersPerMinute: number
    commandsExecuted: number
    failedCommands: number
}

// LLM Provider
export interface LLMProvider {
    name: SupportedProvider
    model: string;
    apiKey?: string;
    temperature: number;
    maxTokens: number;
}

// New types based on the example provided
export type SupportedProvider = 'openai' | 'anthropic' | 'gemini';

// export interface ApiKeyConfig { TODO: see if this is needed
//     provider: SupportedProvider;
//     apiKey: string;
//     model: string; // The selected model ID
//     temperature?: number;
//     maxTokens?: number;
// }

export interface ModelInfo {
    id: string;    // e.g., 'gpt-4-turbo', 'claude-3-opus-20240229'
    name: string;  // e.g., 'GPT-4 Turbo', 'Claude 3 Opus'
    provider?: SupportedProvider; // Optional: to know which provider this model belongs to if not obvious from id
}

export type PrepStationType =
    | 'cutting_board'
    | 'mixing_bowl'
    | 'blender'
    | 'rolling_pin'
    | 'mortar_pestle'

export type PrepStationStatus = 'idle' | 'busy'

export interface PrepStation {
    id: string
    type: PrepStationType
    status: PrepStationStatus
}

export type PreparationStatus = 'in_progress' | 'completed' | 'failed'

export interface PreparationTask {
    id: string
    ingredientId: string
    type: CookingActionType
    startTime: number
    stationId: string
    qualityScore?: number
    status: PreparationStatus
}

// Cooking station and process types

export type CookingStationType = 'stove' | 'oven' | 'grill' | 'fryer' | 'steamer'
export type CookingStationStatus = 'idle' | 'busy' | 'broken'

export interface CookingStation {
    id: string
    type: CookingStationType
    status: CookingStationStatus
    temperature: number // °C
}

export type CookingProcessStatus = 'in_progress' | 'completed' | 'failed'

export interface CookingProcess {
    id: string
    stationId: string
    ingredients: string[]
    type: CookingActionType
    startTime: number
    optimalCookingTime: number // ms
    progress: number // 0-100+
    status: CookingProcessStatus
    qualityScore?: number
}

// Plating models

export type PlatingStationStatus = 'idle' | 'busy'
export interface PlatingStation {
    id: string
    status: PlatingStationStatus
}

export type PlatingStatus = 'in_progress' | 'completed' | 'failed'

export interface PlatingTask {
    id: string
    stationId: string
    orderId: string
    items: string[]
    garnishes: string[]
    startTime: number
    qualityScore?: number
    status: PlatingStatus
}

// Order fulfillment result types
export interface ServeResult {
    success: boolean
    message: string
    orderId?: string
    customerSatisfaction?: number
}

export interface OrderStatusInfo {
    orderId: string
    status: OrderStatus
    elapsedTime: number
    isPriority: boolean
}

export interface RushResult {
    success: boolean
    orderId: string
    isPriority: boolean
}

export type SfxName =
    | 'cookingStart'
    | 'cookingComplete'
    | 'chop'
    | 'sizzle'
    | 'customerHappy'
    | 'customerAngry'
    | 'bell'

export type MusicIntensity = 'calm' | 'medium' | 'intense'

export type AnimationPreset = 'fade' | 'slideInRight' | 'popIn' | 'shake'

// MCP Context Types

// Context for game_state resource
export type GameStateContext = {
    phase: GamePhase;
    mode: GameMode;
    difficulty: number;
    timeElapsed: number;
    performance: Game['performanceMetrics'];
};

// Context for restaurant_state resource
export type RestaurantStateContext = {
    funds: number;
    reputation: number;
    queue: number;
    activeCustomers: Array<{
        id: string;
        status: Customer['status'];
        patience: number;
        tableId?: string;
    }>;
    activeOrders: Array<{
        id: string;
        dish: string; // Dish name
        status: OrderStatus;
        isPriority: boolean;
    }>;
    inventory: Array<{ id: string; qty: number }>;
};

// Context for kitchen_state resource
export type KitchenStateContext = {
    prepStations: PrepStation[];
    cookingStations: CookingStation[];
    platingStations: PlatingStation[];
    activePreparations: number;
    activeCooking: number;
    activePlating: number;
};

// Context for recipe_information resource
export type RecipeInfoContextItem = {
    id: string;
    name: string;
    cookingDifficulty: number;
    unlockDifficulty: number;
};
export type RecipeInformationContext = RecipeInfoContextItem[];

// Context for performance_metrics resource
export type PerformanceMetricsContext = {
    gameMetrics: Game['performanceMetrics'];
    mcpMetrics: MCPAssistant['performanceMetrics'];
};

// Union of all possible individual resource data types
export type MCPResourceDataType =
    | GameStateContext
    | RestaurantStateContext
    | KitchenStateContext
    | RecipeInformationContext
    | PerformanceMetricsContext;

// Type for error within context
export type MCPErrorContext = { error: string };

// The final composite context object structure returned by gameStateToContext()
export type MCPContext = {
    game_state?: GameStateContext | MCPErrorContext;
    restaurant_state?: RestaurantStateContext | MCPErrorContext;
    kitchen_state?: KitchenStateContext | MCPErrorContext;
    recipe_information?: RecipeInformationContext | MCPErrorContext;
    performance_metrics?: PerformanceMetricsContext | MCPErrorContext;
    [key: string]: MCPResourceDataType | MCPErrorContext | undefined; // General fallback for other/dynamic resources
};

// Event system types
export type GameEventType =
    // Game state events
    | 'game_started'
    | 'game_paused'
    | 'game_resumed'
    | 'game_over'
    | 'difficulty_changed'
    | 'timeElapsed_changed'

    // Customer events
    | 'customer_arrived'
    | 'customer_seated'
    | 'customer_ordered'
    | 'customer_served'
    | 'customer_left'
    | 'customer_patience_critical'
    | 'customer_satisfaction_changed'

    // Order events
    | 'order_received'
    | 'order_started'
    | 'order_cooking'
    | 'order_plated'
    | 'order_served'
    | 'order_completed'
    | 'order_failed'
    | 'order_rushed'

    // Cooking events
    | 'preparationStarted'
    | 'preparationCompleted'
    | 'cookingStarted'
    | 'cookingProgress'
    | 'cookingCompleted'
    | 'cookingFailed'
    | 'platingStarted'
    | 'platingCompleted'

    // Inventory events
    | 'ingredient_purchased'
    | 'ingredient_used'
    | 'equipment_status_changed'
    | 'funds_changed'

    // Player events
    | 'player_moved'
    | 'player_action_started'
    | 'player_action_completed'
    | 'player_action_failed'

    // MCP events
    | 'mcp_activated'
    | 'mcp_deactivated'
    | 'mcp_command_sent'
    | 'mcp_command_received'
    | 'mcp_action_started'
    | 'mcp_action_completed'
    | 'mcp_action_failed'

    // UI and misc events
    | 'ui_updated'
    | 'frameUpdate'
    | 'settings_changed'

    // Allow for custom event types as well
    | string;

// Define all possible payload types for events
export type EventPayload = {
    // Game state events
    'game_started': { difficulty: number };
    'game_paused': { elapsedTime: number };
    'game_resumed': { elapsedTime: number };
    'game_over': { score: number, reason: string };
    'difficulty_changed': { newDifficulty: number, oldDifficulty: number };
    'timeElapsed_changed': { elapsedTime: number };

    // Customer events
    'customer_arrived': { customer: Customer };
    'customer_seated': { customerId: string, tableId: string };
    'customer_ordered': { customerId: string, order: Order };
    'customer_served': { customerId: string, orderId: string };
    'customer_left': { customerId: string, satisfaction: number };
    'customer_patience_critical': { customerId: string, patience: number };
    'customer_satisfaction_changed': { customerId: string, satisfaction: number };

    // Order events
    'order_received': Order;
    'order_started': { orderId: string };
    'order_cooking': { orderId: string };
    'order_plated': { orderId: string };
    'order_served': { orderId: string, customerId: string };
    'order_completed': { orderId: string, quality: number };
    'order_failed': { orderId: string, reason: string };
    'order_rushed': { orderId: string, isPriority: boolean };

    // Cooking events
    'preparationStarted': { stationId: string, ingredientId: string, taskId: string };
    'preparationCompleted': { taskId: string, quality: number };
    'cookingStarted': { stationId: string, processId: string };
    'cookingProgress': { processId: string, progress: number };
    'cookingCompleted': { processId: string, quality: number };
    'cookingFailed': { processId: string, reason: string };
    'platingStarted': { orderId: string, platingId: string, stationId: string };
    'platingCompleted': { platingId: string, quality: number };

    // Inventory events
    'ingredient_purchased': { ingredientId: string, quantity: number, totalCost: number };
    'ingredient_used': { ingredientId: string, quantity: number };
    'equipment_status_changed': { equipmentId: string, status: Equipment['status'] };
    'funds_changed': { amount: number, newTotal: number };

    // Player events
    'player_moved': { playerId: string, area: Position['area'], x: number, y: number };
    'player_action_started': { playerId: string, type: PlayerActionType, targetId: string, duration_ms: number, actionId: string };
    'player_action_completed': { actionId: string };
    'player_action_failed': { actionId: string, reason: string };

    // MCP events
    'mcp_activated': { provider: LLMProvider['name'] };
    'mcp_deactivated': { reason?: string };
    'mcp_command_sent': { command: string };
    'mcp_command_received': { command: MCPCommand };
    'mcp_action_started': { action: MCPAction };
    'mcp_action_completed': { actionId: string, result: MCPActionResult };
    'mcp_action_failed': { actionId: string, error: string };

    // UI and misc events
    'ui_updated': { component: string };
    'frameUpdate': { deltaTime: number };
    'settings_changed': { setting: string, value: boolean | number | string };

    // Default for custom events
    [key: string]: unknown;
}; 