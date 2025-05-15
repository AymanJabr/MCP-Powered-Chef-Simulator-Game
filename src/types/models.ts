// Customer model
export interface Customer {
    id: string
    order: Order | null
    patience: number
    arrivalTime: number
    status: 'waiting' | 'seated' | 'served' | 'left'
    satisfaction: number
    tip: number
    tableId?: string // Added for tracking where customer is seated
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
    recipe: Recipe
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
    ingredientId: string
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
export type CookingActionType = 'chop' | 'dice' | 'mince' | 'fry' | 'boil' | 'grill' | 'bake' | 'simmer'

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
export interface Restaurant {
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

// MCP Action
export interface MCPAction {
    id: string
    type: MCPActionType
    target: string
    params: Record<string, any>
    status: 'pending' | 'successful' | 'failed'
    timestamp: number
    result?: any
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
    name: 'claude' | 'gpt' | 'gemini' | 'mock'
    model: string
    apiKey?: string
    temperature: number
    maxTokens: number
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

export type PreparationType = 'chop' | 'dice' | 'mince' | 'slice' | 'mix' | 'marinate'

export interface PreparationTask {
    id: string
    ingredientId: string
    preparationType: PreparationType
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

export type CookingMethod = 'fry' | 'grill' | 'bake' | 'boil' | 'steam'

export type CookingProcessStatus = 'in_progress' | 'completed' | 'failed'

export interface CookingProcess {
    id: string
    stationId: string
    ingredients: string[]
    cookingMethod: CookingMethod
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