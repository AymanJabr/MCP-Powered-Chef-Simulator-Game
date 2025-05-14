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
}

// Dish model
export interface Dish {
    id: string
    name: string
    basePrice: number
    recipe: Recipe
    cookingDifficulty: number
    preparationTime: number
    plateAppearance: number
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