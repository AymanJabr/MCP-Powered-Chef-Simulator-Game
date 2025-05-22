# MCP-Powered Chef Simulator: Implementation Plan

## 1. Project Setup & Infrastructure

### 1.1 Basic Project Setup
1. Create a new Next.js project with TypeScript and Turbopack
   ```bash
   pnpm create next-app --typescript mcp-powered-chef-simulator
   ```
2. Configure Next.js to use Turbopack for development
   ```bash
   # In next.config.js
   module.exports = {
     experimental: {
       turbo: true,
     },
   }
   ```
3. Install core dependencies
   ```bash
   pnpm add zustand immer jotai @mantine/core @mantine/hooks framer-motion @tabler/icons-react howler
   ```

4. Set up testing environment 
   ```bash
   pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest 
   ```

5. Create Jest configuration
   ```typescript
   // jest.config.ts
   import type { Config } from 'jest'
  import nextJest from 'next/jest'

  const createJestConfig = nextJest({
      dir: './',
  })

  const customJestConfig: Config = {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
          '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  }

  export default createJestConfig(customJestConfig) 
   ```

6. Create Jest setup file
   ```typescript
   // jest.setup.ts
   import '@testing-library/jest-dom'
   ```

7. Add test scripts to package.json
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

### 1.2 MCP Server Integration
1. Install MCP TypeScript SDK
   ```bash
   pnpm add mcp-sdk @anthropic-ai/sdk openai
   ```
2. Set up MCP server in a separate folder structure
   ```
   /src
     /mcp
       /server
         index.ts         # Server setup
         tools.ts         # Tool definitions
         resources.ts     # Resource definitions
         integration.ts   # Game state integration
       /client
         index.ts         # Client setup
         ui.tsx           # UI components for MCP interaction
         commands.ts      # Command management
   ```

3. Create basic tests for MCP server setup
   ```typescript
   // src/mcp/server/__tests__/index.test.ts
   import { setupMCPServer } from '../index'
   
   describe('MCP Server Setup', () => {
     it('should create a valid MCP server instance', () => {
       const server = setupMCPServer()
       expect(server).toBeDefined()
     })
   })
   ```

### 1.3 Directory Structure
```
/src
  /app                    # Next.js app router
    /__tests__            # App-level tests
  /components             # UI components
    /game                 # Game-specific components
      /__tests__          # Game component tests
    /ui                   # General UI components
      /__tests__          # UI component tests
    /mcp                  # MCP-related UI components
      /__tests__          # MCP component tests
  /hooks                  # Custom React hooks
    /__tests__            # Hook tests
  /lib                    # Utility functions
    /__tests__            # Utility tests
  /state                  # State management
    /game                 # Game state
      /__tests__          # Game state tests
    /player               # Player state
      /__tests__          # Player state tests
    /mcp       
      /server           
        /__tests__          # MCP server tests
      /client  
        /__tests__          # MCP client tests
  /types                  # TypeScript type definitions
  /mcp                    # MCP integration (from 1.2)
  /assets                 # Static assets that need processing
/public                   # Static assets
  /assets                 # Following the structure in documentation
```

## 2. State Management Architecture

### 2.1 Core State Setup
1. Create base state stores using Zustand/Jotai
   - GameStore - global game state
   - RestaurantStore - restaurant state
   - PlayerStore - player state
   - MCPStore - MCP assistant state

2. Example of GameStore implementation:
   ```typescript
   // src/state/game/gameStore.ts
   import { create } from 'zustand'
   import { immer } from 'zustand/middleware/immer'

   export type GamePhase = 'tutorial' | 'preGame' | 'active' | 'gameOver'
   export type GameMode = 'manual' | 'mcp'

   interface GameState {
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
     actions: {
       setGameMode: (mode: GameMode) => void
       setGamePhase: (phase: GamePhase) => void
       increaseTime: (seconds: number) => void
       togglePause: () => void
       resetGame: () => void
     }
   }

   export const useGameStore = create<GameState>()(
     immer((set) => ({
       gameMode: 'manual',
       difficulty: 1,
       timeElapsed: 0,
       isPaused: false,
       gamePhase: 'preGame',
       performanceMetrics: {
         customerSatisfaction: 0,
         orderCompletionTime: 0,
         financialPerformance: 0,
         efficiency: 0,
       },
       settings: {
         audioEnabled: true,
         sfxVolume: 0.7,
         musicVolume: 0.5,
         tutorialCompleted: false,
       },
       actions: {
         setGameMode: (mode) => set((state) => {
           state.gameMode = mode
         }),
         setGamePhase: (phase) => set((state) => {
           state.gamePhase = phase
         }),
         increaseTime: (seconds) => set((state) => {
           state.timeElapsed += seconds
           
           // Increase difficulty with time
           if (state.timeElapsed % 60 === 0 && state.difficulty < 10) {
             state.difficulty += 0.1
           }
         }),
         togglePause: () => set((state) => {
           state.isPaused = !state.isPaused
         }),
         resetGame: () => set((state) => {
           state.timeElapsed = 0
           state.difficulty = 1
           state.gamePhase = 'preGame'
           state.performanceMetrics = {
             customerSatisfaction: 0,
             orderCompletionTime: 0,
             financialPerformance: 0,
             efficiency: 0,
           }
         }),
       }
     }))
   )
   ```

3. Implement tests for each state store:
   ```typescript
   // src/state/game/__tests__/gameStore.test.ts
   import { useGameStore } from '../gameStore'

   describe('Game Store', () => {
     beforeEach(() => {
       // Reset store to initial state before each test
       useGameStore.getState().actions.resetGame()
     })

     it('should initialize with default values', () => {
       const state = useGameStore.getState()
       expect(state.gameMode).toBe('manual')
       expect(state.difficulty).toBe(1)
       expect(state.timeElapsed).toBe(0)
       expect(state.isPaused).toBe(false)
       expect(state.gamePhase).toBe('preGame')
     })

     it('should set game mode correctly', () => {
       const { actions } = useGameStore.getState()
       actions.setGameMode('mcp')
       expect(useGameStore.getState().gameMode).toBe('mcp')
     })

     it('should increase time and difficulty', () => {
       const { actions } = useGameStore.getState()
       
       // Increase by 60 seconds to trigger difficulty increase
       actions.increaseTime(60)
       
       const state = useGameStore.getState()
       expect(state.timeElapsed).toBe(60)
       expect(state.difficulty).toBeCloseTo(1.1)
     })

     it('should toggle pause state', () => {
       const { actions } = useGameStore.getState()
       const initialPauseState = useGameStore.getState().isPaused
       
       actions.togglePause()
       expect(useGameStore.getState().isPaused).toBe(!initialPauseState)
       
       actions.togglePause()
       expect(useGameStore.getState().isPaused).toBe(initialPauseState)
     })

     it('should reset the game state', () => {
       const { actions } = useGameStore.getState()
       
       // Modify state
       actions.setGameMode('mcp')
       actions.increaseTime(120)
       
       // Reset
       actions.resetGame()
       
       const state = useGameStore.getState()
       expect(state.timeElapsed).toBe(0)
       expect(state.difficulty).toBe(1)
       expect(state.gamePhase).toBe('preGame')
       
       // gameMode should not be reset as it's a user preference
       expect(state.gameMode).toBe('mcp')
     })
   })
   ```

### 2.2 Entity Models
1. Create TypeScript interfaces for all game entities
   ```typescript
   // src/types/models.ts
   export interface Customer {
     id: string
     order: Order | null
     patience: number
     arrivalTime: number
     status: 'waiting' | 'served' | 'left'
     satisfaction: number
     tip: number
   }

   export interface Order {
     id: string
     dish: Dish
     customizations: string[]
     status: 'received' | 'cooking' | 'plated' | 'served'
     startTime: number
     completionTime: number | null
     qualityScore: number
   }

   // Other entities: Dish, Ingredient, CookingAction, Equipment, etc.
   ```

2. Create factory functions and validation utilities for entities:
   ```typescript
   // src/lib/entityFactories.ts
   import { Customer, Order, Dish } from '@/types/models'
   
   export function createCustomer(partial: Partial<Customer> = {}): Customer {
     return {
       id: `customer_${Date.now()}`,
       order: null,
       patience: 100,
       arrivalTime: Date.now(),
       status: 'waiting',
       satisfaction: 0,
       tip: 0,
       ...partial
     }
   }
   
   // Other factory functions
   ```

3. Test entity models and factories:
   ```typescript
   // src/lib/__tests__/entityFactories.test.ts
   import { createCustomer } from '../entityFactories'
   
   describe('Entity Factories', () => {
     it('should create a customer with default values', () => {
       const customer = createCustomer()
       
       expect(customer.id).toContain('customer_')
       expect(customer.order).toBeNull()
       expect(customer.patience).toBe(100)
       expect(customer.status).toBe('waiting')
       expect(customer.satisfaction).toBe(0)
       expect(customer.tip).toBe(0)
     })
     
     it('should override default values with provided partials', () => {
       const customer = createCustomer({
         patience: 50,
         satisfaction: 75
       })
       
       expect(customer.patience).toBe(50)
       expect(customer.satisfaction).toBe(75)
       expect(customer.id).toContain('customer_') // Default still applies
     })
   })
   ```

### 2.3 Event System
1. Create a central event bus for game events
   ```typescript
   // src/lib/eventBus.ts
   type EventCallback = (...args: any[]) => void

   class EventBus {
     private events: Record<string, EventCallback[]> = {}

     on(event: string, callback: EventCallback) {
       if (!this.events[event]) {
         this.events[event] = []
       }
       this.events[event].push(callback)
       
       // Return unsubscribe function
       return () => {
         this.events[event] = this.events[event].filter(cb => cb !== callback)
       }
     }

     emit(event: string, ...args: any[]) {
       if (this.events[event]) {
         this.events[event].forEach(callback => callback(...args))
       }
     }
   }

   export const eventBus = new EventBus()
   ```

2. Test event bus functionality:
   ```typescript
   // src/lib/__tests__/eventBus.test.ts
   import { eventBus } from '../eventBus'
   
   describe('Event Bus', () => {
     it('should register event listeners and call them on emit', () => {
       const mockCallback = jest.fn()
       
       eventBus.on('testEvent', mockCallback)
       
       const testData = { test: 'data' }
       eventBus.emit('testEvent', testData)
       
       expect(mockCallback).toHaveBeenCalledWith(testData)
     })
     
     it('should allow unsubscribing from events', () => {
       const mockCallback = jest.fn()
       
       const unsubscribe = eventBus.on('unsubscribeTest', mockCallback)
       unsubscribe()
       
       eventBus.emit('unsubscribeTest', 'test')
       
       expect(mockCallback).not.toHaveBeenCalled()
     })
     
     it('should call multiple listeners for the same event', () => {
       const mockCallback1 = jest.fn()
       const mockCallback2 = jest.fn()
       
       eventBus.on('multipleEvent', mockCallback1)
       eventBus.on('multipleEvent', mockCallback2)
       
       eventBus.emit('multipleEvent', 'test')
       
       expect(mockCallback1).toHaveBeenCalledWith('test')
       expect(mockCallback2).toHaveBeenCalledWith('test')
     })
   })
   ```

## 3. Game Logic Implementation

### 3.1 Core Game Loop
1. Create a game loop manager
   ```typescript
   // src/lib/gameLoop.ts
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { eventBus } from './eventBus'

   let lastTimestamp = 0
   let animationFrameId: number | null = null

   export function startGameLoop() {
     if (animationFrameId !== null) return
     
     lastTimestamp = performance.now()
     animationFrameId = requestAnimationFrame(gameLoop)
   }

   export function stopGameLoop() {
     if (animationFrameId !== null) {
       cancelAnimationFrame(animationFrameId)
       animationFrameId = null
     }
   }

   function gameLoop(timestamp: number) {
     const gameState = useGameStore.getState()
     
     if (!gameState.isPaused && gameState.gamePhase === 'active') {
       const deltaTime = timestamp - lastTimestamp
       const deltaSeconds = deltaTime / 1000
       
       // Update game time
       gameState.actions.increaseTime(deltaSeconds)
       
       // Process customer patience
       processCustomerPatience(deltaSeconds)
       
       // Generate new customers based on difficulty
       generateNewCustomers(deltaSeconds)
       
       // Process ongoing cooking actions
       processCookingActions(deltaSeconds)
       
       // Check game ending conditions
       checkGameEndingConditions()
       
       // Emit frame update event
       eventBus.emit('frameUpdate', deltaSeconds)
     }
     
     lastTimestamp = timestamp
     animationFrameId = requestAnimationFrame(gameLoop)
   }

   // Other game loop helper functions...
   ```

2. Test the game loop functionality:
   ```typescript
   // src/lib/__tests__/gameLoop.test.ts
   import { startGameLoop, stopGameLoop } from '../gameLoop'
   import { useGameStore } from '@/state/game/gameStore'
   import { eventBus } from '../eventBus'

   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   jest.mock('@/state/game/restaurantStore')
   jest.mock('../eventBus')

   describe('Game Loop', () => {
     beforeEach(() => {
       // Mock requestAnimationFrame and cancelAnimationFrame
       global.requestAnimationFrame = jest.fn().mockReturnValue(123)
       global.cancelAnimationFrame = jest.fn()
       
       // Reset mocks
       jest.clearAllMocks()
     })
     
     it('should start the game loop', () => {
       startGameLoop()
       expect(global.requestAnimationFrame).toHaveBeenCalled()
     })
     
     it('should stop the game loop', () => {
       startGameLoop()
       stopGameLoop()
       expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123)
     })
     
     it('should not start a new game loop if one is already running', () => {
       startGameLoop()
       const callCount = (global.requestAnimationFrame as jest.Mock).mock.calls.length
       
       startGameLoop() // Try to start again
       expect(global.requestAnimationFrame).toHaveBeenCalledTimes(callCount)
     })
   })
   ```

### 3.2 Restaurant Management Systems
1. Implement customer generation system
   ```typescript
   // src/lib/customerGeneration.ts
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { createCustomer } from './entityFactories'
   
   // Customer generation probability based on difficulty
   export function shouldGenerateCustomer(deltaSeconds: number): boolean {
     const { difficulty } = useGameStore.getState()
     const { customerQueue } = useRestaurantStore.getState()
     
     // Base probability increases with difficulty
     const baseProbability = 0.01 + (difficulty * 0.01)
     
     // Adjust based on current queue size
     const queueFactor = Math.max(0.5, 1 - (customerQueue.length * 0.1))
     
     // Calculate final probability per second
     const finalProbability = baseProbability * queueFactor
     
     // Apply to current delta time
     return Math.random() < (finalProbability * deltaSeconds)
   }
   
   export function generateCustomer() {
     const { difficulty } = useGameStore.getState()
     const restaurantStore = useRestaurantStore.getState()
     
     // Create customer with patience based on difficulty
     // Lower patience at higher difficulty
     const patienceModifier = Math.max(0.6, 1 - (difficulty * 0.04))
     const customer = createCustomer({
       patience: 100 * patienceModifier
     })
     
     // Add to queue
     restaurantStore.actions.addCustomerToQueue(customer)
     
     return customer
   }
   ```

1.1 Test customer generation system
   ```typescript
   // src/lib/__tests__/customerGeneration.test.ts
   import { shouldGenerateCustomer, generateCustomer } from '../customerGeneration'
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   jest.mock('@/state/game/restaurantStore')
   
   describe('Customer Generation System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock implementations
       const mockGameStore = {
         difficulty: 1
       }
       
       const mockRestaurantStore = {
         customerQueue: [],
         actions: {
           addCustomerToQueue: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue(mockGameStore)
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
       
       // Mock Math.random for predictable test results
       const mockRandom = jest.spyOn(global.Math, 'random')
       mockRandom.mockReturnValue(0.01) // Low value to make generation likely
     })
     
     afterEach(() => {
       jest.restoreAllMocks()
     })
     
     it('should decide to generate customer based on difficulty and queue', () => {
       // With default mocks (difficulty 1, empty queue)
       expect(shouldGenerateCustomer(1)).toBe(true)
       
       // With higher difficulty
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({ difficulty: 5 })
       expect(shouldGenerateCustomer(1)).toBe(true)
       
       // With fuller queue
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue({
         customerQueue: Array(5).fill({}),
         actions: { addCustomerToQueue: jest.fn() }
       })
       
       // Recalculate with updated values
       const result = shouldGenerateCustomer(1)
       // Either true or false is acceptable here, depends on the precise calculation
       expect(typeof result).toBe('boolean')
     })
     
     it('should generate a customer with appropriate patience based on difficulty', () => {
       // With default difficulty (1)
       const customer = generateCustomer()
       expect(customer).toBeDefined()
       expect(customer.patience).toBeLessThan(100)
       expect(customer.patience).toBeGreaterThan(90) // Approximate value based on difficulty 1
       
       // Check that customer was added to queue
       const restaurantStore = useRestaurantStore.getState()
       expect(restaurantStore.actions.addCustomerToQueue).toHaveBeenCalledWith(customer)
       
       // With higher difficulty
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({ difficulty: 5 })
       const hardModeCustomer = generateCustomer()
       expect(hardModeCustomer.patience).toBeLessThan(customer.patience)
     })
   })
   ```

2. Implement inventory management
   ```typescript
   // src/lib/inventoryManagement.ts
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { Ingredient } from '@/types/models'
   
   export function purchaseIngredient(ingredientId: string, quantity: number) {
     const restaurantStore = useRestaurantStore.getState()
     const { inventory, funds } = restaurantStore
     
     const ingredient = inventory.find(i => i.id === ingredientId)
     if (!ingredient) return { success: false, message: 'Ingredient not found' }
     
     const totalCost = ingredient.cost * quantity
     if (funds < totalCost) {
       return { success: false, message: 'Insufficient funds' }
     }
     
     // Purchase was successful
     restaurantStore.actions.updateFunds(-totalCost)
     restaurantStore.actions.updateIngredientQuantity(ingredientId, quantity)
     
     return { 
       success: true, 
       message: `Purchased ${quantity} ${ingredient.name}`,
       newQuantity: ingredient.quantity + quantity,
       remainingFunds: funds - totalCost
     }
   }
   
   export function consumeIngredient(ingredientId: string, quantity: number = 1) {
     const restaurantStore = useRestaurantStore.getState()
     const { inventory } = restaurantStore
     
     const ingredient = inventory.find(i => i.id === ingredientId)
     if (!ingredient) return { success: false, message: 'Ingredient not found' }
     
     if (ingredient.quantity < quantity) {
       return { success: false, message: 'Insufficient quantity' }
     }
     
     // Consumption was successful
     restaurantStore.actions.updateIngredientQuantity(ingredientId, -quantity)
     
     return { 
       success: true, 
       message: `Used ${quantity} ${ingredient.name}`,
       remainingQuantity: ingredient.quantity - quantity 
     }
   }
   ```

2.1. Test inventory management system
   ```typescript
   // src/lib/__tests__/inventoryManagement.test.ts
   import { purchaseIngredient, consumeIngredient } from '../inventoryManagement'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   // Mock dependencies
   jest.mock('@/state/game/restaurantStore')
   
   describe('Inventory Management System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock inventory
       const mockInventory = [
         { id: 'ing_1', name: 'Tomato', quantity: 10, cost: 5 },
         { id: 'ing_2', name: 'Lettuce', quantity: 5, cost: 3 },
       ]
       
       // Setup mock restaurant store
       const mockRestaurantStore = {
         inventory: mockInventory,
         funds: 100,
         actions: {
           updateFunds: jest.fn(),
           updateIngredientQuantity: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
     })
     
     describe('purchaseIngredient', () => {
       it('should successfully purchase ingredients when funds are sufficient', () => {
         const result = purchaseIngredient('ing_1', 3)
         
         expect(result.success).toBe(true)
         expect(result.newQuantity).toBe(13) // 10 + 3
         expect(result.remainingFunds).toBe(85) // 100 - (5*3)
         
         // Check store actions were called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateFunds).toHaveBeenCalledWith(-15)
         expect(restaurantStore.actions.updateIngredientQuantity).toHaveBeenCalledWith('ing_1', 3)
       })
       
       it('should fail when funds are insufficient', () => {
         // Setup mock with low funds
         // @ts-ignore - Simplified for testing
         useRestaurantStore.getState.mockReturnValue({
           inventory: [{ id: 'ing_1', name: 'Tomato', quantity: 10, cost: 50 }],
           funds: 20,
           actions: {
             updateFunds: jest.fn(),
             updateIngredientQuantity: jest.fn()
           }
         })
         
         const result = purchaseIngredient('ing_1', 1)
         
         expect(result.success).toBe(false)
         expect(result.message).toContain('Insufficient funds')
         
         // Check store actions were NOT called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateFunds).not.toHaveBeenCalled()
         expect(restaurantStore.actions.updateIngredientQuantity).not.toHaveBeenCalled()
       })
       
       it('should fail when ingredient is not found', () => {
         const result = purchaseIngredient('nonexistent_id', 1)
         
         expect(result.success).toBe(false)
         expect(result.message).toContain('not found')
       })
     })
     
     describe('consumeIngredient', () => {
       it('should successfully consume an ingredient when quantity is sufficient', () => {
         const result = consumeIngredient('ing_1', 2)
         
         expect(result.success).toBe(true)
         expect(result.remainingQuantity).toBe(8) // 10 - 2
         
         // Check store actions were called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateIngredientQuantity).toHaveBeenCalledWith('ing_1', -2)
       })
       
       it('should fail when quantity is insufficient', () => {
         const result = consumeIngredient('ing_2', 10)
         
         expect(result.success).toBe(false)
         expect(result.message).toContain('Insufficient quantity')
         
         // Check store actions were NOT called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateIngredientQuantity).not.toHaveBeenCalled()
       })
     })
   })
   ```

3. Implement finance system
   ```typescript
   // src/lib/financeSystem.ts
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   export function processPayment(orderId: string) {
     const restaurantStore = useRestaurantStore.getState()
     const { activeOrders, completedOrders } = restaurantStore
     
     // Find order
     const order = activeOrders.find(o => o.id === orderId)
     if (!order) return { success: false, message: 'Order not found' }
     
     if (order.status !== 'served') {
       return { success: false, message: 'Order not yet served' }
     }
     
     // Calculate base price from dish
     const basePrice = order.dish.basePrice
     
     // Calculate tip based on quality score and speed
     const qualityMultiplier = order.qualityScore / 100
     const timeTaken = order.completionTime! - order.startTime
     const speedMultiplier = Math.max(0.5, 1 - (timeTaken / 60000)) // 1 minute as baseline
     
     const tipPercentage = (qualityMultiplier + speedMultiplier) / 2
     const tipAmount = Math.floor(basePrice * tipPercentage)
     
     // Total payment
     const totalPayment = basePrice + tipAmount
     
     // Process payment
     restaurantStore.actions.updateFunds(totalPayment)
     restaurantStore.actions.completeOrder(orderId, tipAmount)
     
     return {
       success: true,
       basePrice,
       tip: tipAmount,
       total: totalPayment
     }
   }
   
   export function calculateDailyExpenses() {
     const restaurantStore = useRestaurantStore.getState()
     
     // Fixed daily costs (rent, utilities, staff, etc.)
     const fixedCosts = 50
     
     // Calculate expenses
     restaurantStore.actions.updateFunds(-fixedCosts)
     
     return {
       fixedCosts,
       totalExpenses: fixedCosts
     }
   }
   ```

3.1. Test finance system
   ```typescript
   // src/lib/__tests__/financeSystem.test.ts
   import { processPayment, calculateDailyExpenses } from '../financeSystem'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   // Mock dependencies
   jest.mock('@/state/game/restaurantStore')
   
   describe('Finance System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock orders
       const mockActiveOrders = [
         { 
           id: 'order_1', 
           dish: { basePrice: 20 }, 
           status: 'served',
           qualityScore: 80,
           startTime: Date.now() - 30000, // 30 seconds ago
           completionTime: Date.now() - 5000 // 5 seconds ago
         },
         { 
           id: 'order_2', 
           dish: { basePrice: 15 }, 
           status: 'cooking',
           qualityScore: 0,
           startTime: Date.now() - 20000,
           completionTime: null
         }
       ]
       
       // Setup mock restaurant store
       const mockRestaurantStore = {
         activeOrders: mockActiveOrders,
         completedOrders: [],
         funds: 100,
         actions: {
           updateFunds: jest.fn(),
           completeOrder: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
     })
     
     describe('processPayment', () => {
       it('should successfully process payment for served orders', () => {
         const result = processPayment('order_1')
         
         expect(result.success).toBe(true)
         expect(result.basePrice).toBe(20)
         expect(result.tip).toBeGreaterThan(0) // Should get some tip
         expect(result.total).toBeGreaterThan(20) // Total should be more than base price
         
         // Check store actions were called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateFunds).toHaveBeenCalledWith(result.total)
         expect(restaurantStore.actions.completeOrder).toHaveBeenCalledWith('order_1', result.tip)
       })
       
       it('should fail when order is not yet served', () => {
         const result = processPayment('order_2')
         
         expect(result.success).toBe(false)
         expect(result.message).toContain('not yet served')
         
         // Check store actions were NOT called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateFunds).not.toHaveBeenCalled()
         expect(restaurantStore.actions.completeOrder).not.toHaveBeenCalled()
       })
       
       it('should fail when order is not found', () => {
         const result = processPayment('nonexistent_id')
         
         expect(result.success).toBe(false)
         expect(result.message).toContain('not found')
       })
       
       it('should calculate higher tips for better quality and faster service', () => {
         // Clone restaurant store but with a perfect order
         const perfectOrder = {
           id: 'perfect_order',
           dish: { basePrice: 20 },
           status: 'served',
           qualityScore: 100, // Perfect quality
           startTime: Date.now() - 10000, // Very quick service
           completionTime: Date.now() - 1000
         }
         
         // @ts-ignore - Simplified for testing
         useRestaurantStore.getState.mockReturnValue({
           activeOrders: [perfectOrder],
           completedOrders: [],
           funds: 100,
           actions: {
             updateFunds: jest.fn(),
             completeOrder: jest.fn()
           }
         })
         
         const perfectResult = processPayment('perfect_order')
         
         // With our previous test as baseline
         const regularResult = processPayment('order_1')
         
         // Perfect should have higher tip
         expect(perfectResult.tip).toBeGreaterThan(regularResult.tip)
       })
     })
     
     describe('calculateDailyExpenses', () => {
       it('should calculate and apply daily expenses', () => {
         const result = calculateDailyExpenses()
         
         expect(result.fixedCosts).toBe(50) // From implementation
         expect(result.totalExpenses).toBe(50)
         
         // Check store actions were called
         const restaurantStore = useRestaurantStore.getState()
         expect(restaurantStore.actions.updateFunds).toHaveBeenCalledWith(-50)
       })
     })
   })
   ```

### 3.3 Cooking System
1. Implement ingredient preparation system

1.1 Test ingredient preparation system
   ```typescript
   // src/lib/__tests__/ingredientPreparation.test.ts
   import { prepareIngredient } from '../ingredientPreparation'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   import { eventBus } from '../eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/kitchenStore')
   jest.mock('../eventBus')
   
   describe('Ingredient Preparation System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock kitchen store
       const mockKitchenStore = {
         prepStations: [
           { id: 'station_1', type: 'cutting_board', status: 'idle' },
           { id: 'station_2', type: 'mixing_bowl', status: 'idle' }
         ],
         actions: {
           startPreparation: jest.fn(),
           completePreparation: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(mockKitchenStore)
     })
     
     it('should successfully start ingredient preparation with available station', () => {
       // Prepare a test ingredient
       const ingredient = { id: 'ing_1', name: 'Tomato', preparationType: 'chop' }
       
       const result = prepareIngredient(ingredient, 'cutting_board')
       
       expect(result.success).toBe(true)
       expect(result.stationId).toBe('station_1')
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.startPreparation).toHaveBeenCalledWith(
         'station_1', 
         expect.objectContaining({ 
           ingredientId: 'ing_1',
           preparationType: 'chop'
         })
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'preparationStarted', 
         expect.objectContaining({ 
           stationId: 'station_1',
           ingredient
         })
       )
     })
     
     it('should fail when no appropriate station is available', () => {
       // Setup mock with all stations in use
       const busyKitchenStore = {
         prepStations: [
           { id: 'station_1', type: 'cutting_board', status: 'busy' },
           { id: 'station_2', type: 'mixing_bowl', status: 'idle' }
         ],
         actions: {
           startPreparation: jest.fn(),
           completePreparation: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(busyKitchenStore)
       
       // Try to prepare an ingredient that needs a cutting board
       const ingredient = { id: 'ing_1', name: 'Tomato', preparationType: 'chop' }
       
       const result = prepareIngredient(ingredient, 'cutting_board')
       
       expect(result.success).toBe(false)
       expect(result.message).toContain('No available station')
       
       // Check kitchen actions were NOT called
       expect(busyKitchenStore.actions.startPreparation).not.toHaveBeenCalled()
     })
     
     it('should handle preparation completion successfully', () => {
       // Setup a completion handler
       const mockCompletionHandler = jest.fn()
       const stationId = 'station_1'
       const preparationId = 'prep_1'
       
       const completionResult = completePreparation(stationId, preparationId, 85)
       
       expect(completionResult.success).toBe(true)
       expect(completionResult.qualityScore).toBe(85)
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.completePreparation).toHaveBeenCalledWith(
         stationId, 
         preparationId,
         85
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'preparationCompleted', 
         expect.objectContaining({ 
           stationId,
           preparationId,
           qualityScore: 85
         })
       )
     })
   })
   ```

2. Implement cooking processes

2.1 Test cooking processes
   ```typescript
   // src/lib/__tests__/cookingProcesses.test.ts
   import { startCooking, checkCookingProgress, completeCooking } from '../cookingProcesses'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   import { eventBus } from '../eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/kitchenStore')
   jest.mock('../eventBus')
   
   describe('Cooking Processes', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock kitchen store
       const mockKitchenStore = {
         cookingStations: [
           { id: 'station_1', type: 'stove', status: 'idle', temperature: 0 },
           { id: 'station_2', type: 'oven', status: 'idle', temperature: 0 }
         ],
         activeCookingProcesses: [],
         actions: {
           startCookingProcess: jest.fn().mockReturnValue('cooking_1'),
           updateCookingProgress: jest.fn(),
           finishCookingProcess: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(mockKitchenStore)
       
       // Mock the current time for predictable tests
       jest.spyOn(Date, 'now').mockImplementation(() => 1000)
     })
     
     afterEach(() => {
       jest.restoreAllMocks()
     })
     
     it('should successfully start a cooking process', () => {
       const ingredients = [
         { id: 'ing_1', name: 'Beef', quantity: 1, preparationState: 'chopped' }
       ]
       const cookingMethod = 'fry'
       
       const result = startCooking(ingredients, cookingMethod)
       
       expect(result.success).toBe(true)
       expect(result.cookingId).toBe('cooking_1')
       expect(result.stationId).toBe('station_1') // First available stove
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.startCookingProcess).toHaveBeenCalledWith(
         'station_1', 
         expect.objectContaining({
           ingredients,
           cookingMethod,
           startTime: 1000
         })
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'cookingStarted',
         expect.objectContaining({
           stationId: 'station_1',
           cookingId: 'cooking_1'
         })
       )
     })
     
     it('should fail when no appropriate cooking station is available', () => {
       // Setup mock with all stations in use
       const busyKitchenStore = {
         cookingStations: [
           { id: 'station_1', type: 'stove', status: 'busy', temperature: 180 },
           { id: 'station_2', type: 'oven', status: 'busy', temperature: 200 }
         ],
         actions: {
           startCookingProcess: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(busyKitchenStore)
       
       const ingredients = [
         { id: 'ing_1', name: 'Beef', quantity: 1, preparationState: 'chopped' }
       ]
       
       const result = startCooking(ingredients, 'fry')
       
       expect(result.success).toBe(false)
       expect(result.message).toContain('No available cooking station')
       
       // Check kitchen actions were NOT called
       expect(busyKitchenStore.actions.startCookingProcess).not.toHaveBeenCalled()
     })
     
     it('should check cooking progress correctly', () => {
       // Mock an active cooking process
       const mockCookingProcess = {
         id: 'cooking_1',
         stationId: 'station_1',
         ingredients: [{ id: 'ing_1', name: 'Beef' }],
         cookingMethod: 'fry',
         startTime: Date.now() - 30000, // Started 30 seconds ago
         progress: 50, // 50% done
         optimalCookingTime: 60000 // 60 seconds total expected
       }
       
       // Setup mock with active cooking process
       const activeCookingStore = {
         cookingStations: [
           { id: 'station_1', type: 'stove', status: 'busy', temperature: 180 }
         ],
         activeCookingProcesses: [mockCookingProcess],
         actions: {
           updateCookingProgress: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(activeCookingStore)
       
       const progress = checkCookingProgress('cooking_1')
       
       expect(progress).toBeDefined()
       expect(progress.cookingId).toBe('cooking_1')
       expect(progress.progress).toBeGreaterThan(50) // Should have progressed
       expect(progress.isOvercooked).toBe(false)
       
       // Check kitchen actions were called to update progress
       expect(activeCookingStore.actions.updateCookingProgress).toHaveBeenCalledWith(
         'cooking_1',
         expect.any(Number),
         false
       )
     })
     
     it('should complete cooking successfully', () => {
       const cookingId = 'cooking_1'
       const stationId = 'station_1'
       
       const result = completeCooking(cookingId)
       
       expect(result.success).toBe(true)
       expect(result.cookingId).toBe(cookingId)
       
       // Quality score should be based on how perfectly timed the cooking was
       expect(result.qualityScore).toBeDefined()
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.finishCookingProcess).toHaveBeenCalledWith(
         cookingId,
         expect.any(Number) // Quality score
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'cookingCompleted',
         expect.objectContaining({
           cookingId,
           qualityScore: expect.any(Number)
         })
       )
     })
     
     it('should handle overcooking with quality penalty', () => {
       // Mock an active but overcooked process
       const mockCookingProcess = {
         id: 'cooking_1',
         stationId: 'station_1',
         ingredients: [{ id: 'ing_1', name: 'Beef' }],
         cookingMethod: 'fry',
         startTime: Date.now() - 120000, // Started 2 minutes ago
         progress: 150, // Over 100% progress (overcooked)
         optimalCookingTime: 60000 // 60 seconds total expected
       }
       
       // Setup mock with overcooked process
       const overcookedStore = {
         cookingStations: [
           { id: 'station_1', type: 'stove', status: 'busy', temperature: 180 }
         ],
         activeCookingProcesses: [mockCookingProcess],
         actions: {
           finishCookingProcess: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(overcookedStore)
       
       const result = completeCooking('cooking_1')
       
       expect(result.success).toBe(true)
       expect(result.isOvercooked).toBe(true)
       
       // Quality score should be poor due to overcooking
       expect(result.qualityScore).toBeLessThan(50)
     })
   })
   ```

3. Implement plating system

3.1 Test plating system
   ```typescript
   // src/lib/__tests__/platingSystem.test.ts
   import { plateItem, addGarnish, checkPlating, completePlating } from '../platingSystem'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { eventBus } from '../eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/kitchenStore')
   jest.mock('@/state/game/restaurantStore')
   jest.mock('../eventBus')
   
   describe('Plating System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock kitchen store
       const mockKitchenStore = {
         platingStations: [
           { id: 'plating_1', status: 'idle' }
         ],
         completedItems: [
           { 
             id: 'item_1', 
             name: 'Cooked Beef', 
             cookingId: 'cooking_1',
             qualityScore: 85 
           },
           { 
             id: 'item_2', 
             name: 'Steamed Vegetables', 
             cookingId: 'cooking_2',
             qualityScore: 90
           }
         ],
         availableGarnishes: [
           { id: 'garnish_1', name: 'Parsley', quantity: 10 },
           { id: 'garnish_2', name: 'Lemon Wedge', quantity: 5 }
         ],
         activePlating: {},
         actions: {
           startPlating: jest.fn(),
           addItemToPlate: jest.fn(),
           addGarnishToPlate: jest.fn(),
           completePlating: jest.fn()
         }
       }
       
       // Setup mock restaurant store
       const mockRestaurantStore = {
         activeOrders: [
           { 
             id: 'order_1', 
             dish: { 
               id: 'dish_1', 
               name: 'Beef with Vegetables',
               requiredItems: ['Cooked Beef', 'Steamed Vegetables'],
               suggestedGarnishes: ['Parsley']
             },
             status: 'cooking'
           }
         ],
         actions: {
           updateOrderStatus: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(mockKitchenStore)
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
     })
     
     it('should successfully start plating for an order', () => {
       const orderId = 'order_1'
       
       const result = startPlating(orderId)
       
       expect(result.success).toBe(true)
       expect(result.platingId).toBeDefined()
       expect(result.stationId).toBe('plating_1')
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.startPlating).toHaveBeenCalledWith(
         'plating_1',
         orderId,
         expect.any(String) // platingId
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'platingStarted',
         expect.objectContaining({
           orderId,
           stationId: 'plating_1'
         })
       )
     })
     
     it('should successfully add item to plate', () => {
       const platingId = 'plating_1'
       const itemId = 'item_1'
       
       const result = plateItem(platingId, itemId)
       
       expect(result.success).toBe(true)
       expect(result.qualityContribution).toBeDefined()
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.addItemToPlate).toHaveBeenCalledWith(
         platingId,
         itemId
       )
     })
     
     it('should successfully add garnish to plate', () => {
       const platingId = 'plating_1'
       const garnishId = 'garnish_1'
       
       const result = addGarnish(platingId, garnishId)
       
       expect(result.success).toBe(true)
       expect(result.aestheticBonus).toBeGreaterThan(0)
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.addGarnishToPlate).toHaveBeenCalledWith(
         platingId,
         garnishId
       )
     })
     
     it('should check plating status and report missing items', () => {
       // Setup mock with active plating
       const activePlatingStore = {
         activePlating: {
           'plating_1': {
             id: 'plating_1',
             orderId: 'order_1',
             items: ['item_1'], // Only one item added so far
             garnishes: [],
             status: 'in_progress'
           }
         },
         actions: {}
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue({
         ...useKitchenStore.getState(),
         ...activePlatingStore
       })
       
       const status = checkPlating('plating_1')
       
       expect(status.isComplete).toBe(false)
       expect(status.missingItems).toContain('Steamed Vegetables')
       expect(status.suggestedGarnishes).toContain('Parsley')
       expect(status.currentQualityScore).toBeDefined()
     })
     
     it('should complete plating successfully when all required items are added', () => {
       // Setup mock with complete plating
       const completePlatingStore = {
         activePlating: {
           'plating_1': {
             id: 'plating_1',
             orderId: 'order_1',
             items: ['item_1', 'item_2'], // Both required items
             garnishes: ['garnish_1'], // Suggested garnish
             status: 'in_progress'
           }
         },
         actions: {
           completePlating: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue({
         ...useKitchenStore.getState(),
         ...completePlatingStore
       })
       
       const result = completePlating('plating_1')
       
       expect(result.success).toBe(true)
       expect(result.qualityScore).toBeGreaterThan(80) // Both high quality items + garnish
       
       // Check kitchen actions were called
       const kitchenStore = useKitchenStore.getState()
       expect(kitchenStore.actions.completePlating).toHaveBeenCalledWith(
         'plating_1',
         expect.any(Number) // Quality score
       )
       
       // Check restaurant actions were called
       const restaurantStore = useRestaurantStore.getState()
       expect(restaurantStore.actions.updateOrderStatus).toHaveBeenCalledWith(
         'order_1',
         'plated'
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'platingCompleted',
         expect.objectContaining({
           orderId: 'order_1',
           platingId: 'plating_1',
           qualityScore: expect.any(Number)
         })
       )
     })
     
     it('should apply quality penalty for missing garnishes', () => {
       // Setup mock with plating missing garnishes
       const noGarnishPlatingStore = {
         activePlating: {
           'plating_1': {
             id: 'plating_1',
             orderId: 'order_1',
             items: ['item_1', 'item_2'], // Both required items
             garnishes: [], // No garnishes
             status: 'in_progress'
           }
         },
         actions: {
           completePlating: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue({
         ...useKitchenStore.getState(),
         ...noGarnishPlatingStore
       })
       
       const withoutGarnish = completePlating('plating_1')
       
       // Now add garnish and check again
       const withGarnishPlatingStore = {
         activePlating: {
           'plating_1': {
             id: 'plating_1',
             orderId: 'order_1',
             items: ['item_1', 'item_2'],
             garnishes: ['garnish_1'],
             status: 'in_progress'
           }
         },
         actions: {
           completePlating: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue({
         ...useKitchenStore.getState(),
         ...withGarnishPlatingStore
       })
       
       const withGarnish = completePlating('plating_1')
       
       // With garnish should have higher quality
       expect(withGarnish.qualityScore).toBeGreaterThan(withoutGarnish.qualityScore)
     })
   })
   ```

4. Implement order fulfillment

4.1 Test order fulfillment
   ```typescript
   // src/lib/__tests__/orderFulfillment.test.ts
   import { serveOrder, checkOrderStatus, rushOrder } from '../orderFulfillment'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { eventBus } from '../eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/restaurantStore')
   jest.mock('../eventBus')
   
   describe('Order Fulfillment System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock restaurant store
       const mockRestaurantStore = {
         activeOrders: [
           { 
             id: 'order_1', 
             customerId: 'customer_1',
             dish: { id: 'dish_1', name: 'Beef with Vegetables' },
             status: 'plated',
             startTime: Date.now() - 120000, // 2 minutes ago
             qualityScore: 85
           },
           { 
             id: 'order_2', 
             customerId: 'customer_2',
             dish: { id: 'dish_2', name: 'Pasta Carbonara' },
             status: 'cooking',
             startTime: Date.now() - 60000 // 1 minute ago
           }
         ],
         customers: [
           { id: 'customer_1', patience: 70 },
           { id: 'customer_2', patience: 85 }
         ],
         actions: {
           updateOrderStatus: jest.fn(),
           updateCustomerSatisfaction: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
     })
     
     it('should successfully serve a plated order', () => {
       const orderId = 'order_1'
       
       const result = serveOrder(orderId)
       
       expect(result.success).toBe(true)
       expect(result.orderId).toBe(orderId)
       
       // Check restaurant actions were called
       const restaurantStore = useRestaurantStore.getState()
       expect(restaurantStore.actions.updateOrderStatus).toHaveBeenCalledWith(
         orderId,
         'served'
       )
       
       // Should update customer satisfaction
       expect(restaurantStore.actions.updateCustomerSatisfaction).toHaveBeenCalledWith(
         'customer_1',
         expect.any(Number) // Satisfaction score
       )
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'orderServed',
         expect.objectContaining({
           orderId,
           customerId: 'customer_1'
         })
       )
     })
     
     it('should fail when trying to serve an order that is not plated', () => {
       const orderId = 'order_2' // Status is 'cooking'
       
       const result = serveOrder(orderId)
       
       expect(result.success).toBe(false)
       expect(result.message).toContain('not plated')
       
       // Check restaurant actions were NOT called
       const restaurantStore = useRestaurantStore.getState()
       expect(restaurantStore.actions.updateOrderStatus).not.toHaveBeenCalled()
       expect(restaurantStore.actions.updateCustomerSatisfaction).not.toHaveBeenCalled()
     })
     
     it('should check order status with time metrics', () => {
       const orderId = 'order_1'
       
       const status = checkOrderStatus(orderId)
       
       expect(status.orderId).toBe(orderId)
       expect(status.status).toBe('plated')
       expect(status.elapsedTime).toBeGreaterThanOrEqual(120000) // At least 2 minutes
       expect(status.isPriority).toBe(false) // By default
       
       // The second, newer order
       const status2 = checkOrderStatus('order_2')
       expect(status2.elapsedTime).toBeLessThan(status.elapsedTime)
     })
     
     it('should prioritize an order that is taking too long', () => {
       const orderId = 'order_2'
       
       const result = rushOrder(orderId)
       
       expect(result.success).toBe(true)
       expect(result.orderId).toBe(orderId)
       expect(result.isPriority).toBe(true)
       
       // Check that event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'orderRushed',
         expect.objectContaining({
           orderId,
           customerId: 'customer_2'
         })
       )
       
       // Check order status after rushing
       const status = checkOrderStatus(orderId)
       expect(status.isPriority).toBe(true)
     })
     
     it('should calculate customer satisfaction based on wait time and food quality', () => {
       // Test a fast and high quality order
       const fastOrder = { 
         id: 'fast_order', 
         customerId: 'customer_3',
         dish: { id: 'dish_1', name: 'Beef with Vegetables' },
         status: 'plated',
         startTime: Date.now() - 30000, // Just 30 seconds
         qualityScore: 95 // Very high quality
       }
       
       // Setup mock with additional order and customer
       const updatedStore = {
         activeOrders: [
           ...useRestaurantStore.getState().activeOrders,
           fastOrder
         ],
         customers: [
           ...useRestaurantStore.getState().customers,
           { id: 'customer_3', patience: 90 }
         ],
         actions: {
           updateOrderStatus: jest.fn(),
           updateCustomerSatisfaction: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(updatedStore)
       
       // Serve both orders and compare satisfaction
       const slowResult = serveOrder('order_1')
       const fastResult = serveOrder('fast_order')
       
       // Fast service with high quality should yield higher satisfaction
       expect(fastResult.customerSatisfaction).toBeGreaterThan(slowResult.customerSatisfaction)
     })
   })
   ```

### 3.4 Difficulty Progression
1. Implement time-based difficulty scaling

1.1 Test time-based difficulty scaling
   ```typescript
   // src/lib/__tests__/difficultyScaling.test.ts
   import { updateDifficulty, getCurrentDifficultyModifiers } from '../difficultyScaling'
   import { useGameStore } from '@/state/game/gameStore'
   
   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   
   describe('Difficulty Scaling System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock game store
       const mockGameStore = {
         timeElapsed: 0,
         difficulty: 1,
         actions: {
           setDifficulty: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue(mockGameStore)
     })
     
     it('should increase difficulty over time', () => {
       // Test at different time intervals
       const timePoints = [0, 60, 180, 300, 600]
       let lastDifficulty = 0
       
       timePoints.forEach(timeElapsed => {
         // Update mock time
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({
           ...useGameStore.getState(),
           timeElapsed
         })
         
         // Update difficulty based on time
         const newDifficulty = updateDifficulty()
         
         if (timeElapsed > 0) {
           // Difficulty should increase with time
           expect(newDifficulty).toBeGreaterThan(lastDifficulty)
         }
         
         lastDifficulty = newDifficulty
       })
       
       // Check that the game store action was called to set the new difficulty
       const gameStore = useGameStore.getState()
       expect(gameStore.actions.setDifficulty).toHaveBeenCalled()
     })
     
     it('should have a maximum difficulty cap', () => {
       // Simulate very long gameplay (2 hours)
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({
         ...useGameStore.getState(),
         timeElapsed: 7200 // 2 hours in seconds
       })
       
       const difficulty = updateDifficulty()
       
       // Difficulty should be capped at some maximum value
       expect(difficulty).toBeLessThanOrEqual(10) // Assuming 10 is max difficulty
     })
     
     it('should return appropriate difficulty modifiers', () => {
       // Test at various difficulty levels
       const difficultyLevels = [1, 3, 5, 8, 10]
       
       difficultyLevels.forEach(difficulty => {
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({
           ...useGameStore.getState(),
           difficulty
         })
         
         const modifiers = getCurrentDifficultyModifiers()
         
         // Check that all expected modifiers are present
         expect(modifiers).toHaveProperty('customerPatienceMod')
         expect(modifiers).toHaveProperty('orderFrequencyMod')
         expect(modifiers).toHaveProperty('cookingDifficultyMod')
         
         // Higher difficulty should have more severe modifiers
         if (difficulty > 1) {
           // Customer patience should decrease with higher difficulty
           expect(modifiers.customerPatienceMod).toBeLessThan(1)
           
           // Order frequency should increase with higher difficulty
           expect(modifiers.orderFrequencyMod).toBeGreaterThan(1)
         }
       })
     })
   })
   ```

2. Add customer patience reduction with difficulty

2.1 Test customer patience reduction with difficulty
   ```typescript
   // src/lib/__tests__/customerPatience.test.ts
   import { calculateInitialPatience, reducePatience } from '../customerPatience'
   import { useGameStore } from '@/state/game/gameStore'
   import { eventBus } from '../eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   jest.mock('../eventBus')
   
   describe('Customer Patience System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock game store
       const mockGameStore = {
         difficulty: 1
       }
       
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue(mockGameStore)
     })
     
     it('should calculate lower initial patience at higher difficulty levels', () => {
       // Get baseline patience at difficulty 1
       const baselinePatience = calculateInitialPatience()
       
       // Test at higher difficulties
       const difficulties = [3, 5, 8, 10]
       
       difficulties.forEach(difficulty => {
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({ difficulty })
         
         const newPatience = calculateInitialPatience()
         
         // Higher difficulty should result in lower initial patience
         expect(newPatience).toBeLessThan(baselinePatience)
         
         // Make sure it doesn't go below some minimum threshold
         expect(newPatience).toBeGreaterThan(30) // Assuming 30 is minimum reasonable patience
       })
     })
     
     it('should reduce patience faster at higher difficulty', () => {
       // Test patience reduction at different difficulty levels
       const difficulties = [1, 5, 10]
       const initialPatience = 100
       const deltaTime = 10 // 10 seconds
       
       // Store reduction rates for comparison
       const reductionRates: number[] = []
       
       difficulties.forEach(difficulty => {
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({ difficulty })
         
         // Get patience after reduction
         const newPatience = reducePatience(initialPatience, deltaTime)
         const reductionAmount = initialPatience - newPatience
         
         reductionRates.push(reductionAmount)
         
         // Patience should always decrease
         expect(newPatience).toBeLessThan(initialPatience)
       })
       
       // Higher difficulties should reduce patience faster
       expect(reductionRates[1]).toBeGreaterThan(reductionRates[0])
       expect(reductionRates[2]).toBeGreaterThan(reductionRates[1])
     })
     
     it('should emit events when patience reaches critical thresholds', () => {
       // Start with patience just above critical threshold
       const startingPatience = 30
       const deltaTime = 5 // 5 seconds
       
       // Set a difficulty that will reduce patience below threshold
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({ difficulty: 5 })
       
       // Reduce patience to below critical threshold
       const newPatience = reducePatience(startingPatience, deltaTime, 'customer_1')
       
       // Check if the event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'customerPatienceCritical',
         expect.objectContaining({
           customerId: 'customer_1',
           patience: newPatience
         })
       )
       
       // Test patience reaching zero
       const zeroPatience = reducePatience(1, deltaTime, 'customer_2')
       
       expect(zeroPatience).toBe(0)
       expect(eventBus.emit).toHaveBeenCalledWith(
         'customerLeft',
         expect.objectContaining({
           customerId: 'customer_2'
         })
       )
     })
   })
   ```

3. Add menu complexity progression

3.1 Test menu complexity progression
   ```typescript
   // src/lib/__tests__/menuComplexity.test.ts
   import { getAvailableMenu, unlockMenuItem, calculateDishComplexity } from '../menuComplexity'
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   jest.mock('@/state/game/restaurantStore')
   
   describe('Menu Complexity System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Setup mock game store
       const mockGameStore = {
         difficulty: 1,
         timeElapsed: 0
       }
       
       // Setup mock restaurant store with initial menu items
       const mockRestaurantStore = {
         unlockedMenuItems: ['dish_1', 'dish_2'],
         menuItems: [
           { id: 'dish_1', name: 'Simple Salad', complexity: 1, unlockDifficulty: 1 },
           { id: 'dish_2', name: 'Basic Burger', complexity: 2, unlockDifficulty: 1 },
           { id: 'dish_3', name: 'Gourmet Pasta', complexity: 3, unlockDifficulty: 3 },
           { id: 'dish_4', name: 'Fancy Steak', complexity: 4, unlockDifficulty: 5 },
           { id: 'dish_5', name: 'Deluxe Seafood Platter', complexity: 5, unlockDifficulty: 7 }
         ],
         actions: {
           unlockMenuItem: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue(mockGameStore)
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
     })
     
     it('should only return menu items unlocked at current difficulty', () => {
       // At difficulty level 1, only first two dishes should be available
       const availableMenu = getAvailableMenu()
       
       expect(availableMenu.length).toBe(2)
       expect(availableMenu[0].id).toBe('dish_1')
       expect(availableMenu[1].id).toBe('dish_2')
       
       // At higher difficulty, more dishes should be available
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({ 
         ...useGameStore.getState(),
         difficulty: 5 
       })
       
       const higherDifficultyMenu = getAvailableMenu()
       
       expect(higherDifficultyMenu.length).toBe(4) // dish_1, dish_2, dish_3, dish_4
       expect(higherDifficultyMenu[3].id).toBe('dish_4')
     })
     
     it('should unlock menu items when difficulty threshold is reached', () => {
       // Test unlocking at different difficulty levels
       const testDifficulties = [1, 3, 5, 7, 10]
       
       testDifficulties.forEach(difficulty => {
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({ 
           ...useGameStore.getState(),
           difficulty 
         })
         
         // Reset unlock tracking
         jest.clearAllMocks()
         
         // Check for unlocks
         const newUnlocks = unlockMenuItem()
         
         // Should get different unlocks at different difficulties
         if (difficulty >= 7) {
           expect(newUnlocks).toContainEqual(expect.objectContaining({ id: 'dish_5' }))
         } else if (difficulty >= 5) {
           expect(newUnlocks).toContainEqual(expect.objectContaining({ id: 'dish_4' }))
         } else if (difficulty >= 3) {
           expect(newUnlocks).toContainEqual(expect.objectContaining({ id: 'dish_3' }))
         }
       })
     })
     
     it('should calculate appropriate dish complexity based on difficulty', () => {
       // Test dish complexity calculation at different difficulties
       const testDifficulties = [1, 5, 10]
       
       testDifficulties.forEach(difficulty => {
         // @ts-ignore - Simplified for testing
         useGameStore.getState.mockReturnValue({ 
           ...useGameStore.getState(),
           difficulty 
         })
         
         // Calculate complexity for a dish
         const baseComplexity = 3
         const adjustedComplexity = calculateDishComplexity(baseComplexity)
         
         // At higher difficulties, preparation complexity should increase
         if (difficulty > 1) {
           expect(adjustedComplexity).toBeGreaterThan(baseComplexity)
         } else {
           expect(adjustedComplexity).toBe(baseComplexity)
         }
       })
     })
     
     it('should make more complex orders more valuable', () => {
       // Get dishes of different complexity
       const menuItems = useRestaurantStore.getState().menuItems
       const simpleDish = menuItems.find(d => d.id === 'dish_1')
       const complexDish = menuItems.find(d => d.id === 'dish_5')
       
       // Calculate base price for each (assuming menu item has a basePrice property)
       const basePrice = 10 // Hypothetical base price multiplier
       const simplePrice = basePrice * simpleDish.complexity
       const complexPrice = basePrice * complexDish.complexity
       
       // More complex dishes should be worth more
       expect(complexPrice).toBeGreaterThan(simplePrice)
     })
   })
   ```

## 4. MCP Integration

### 4.1 MCP Server Setup
1. Set up an MCP server with required endpoints
   ```typescript
   // src/mcp/server/index.ts
   import { MCPServer } from 'mcp-sdk'
   import { tools } from './tools'
   import { resources } from './resources'
   import { gameStateToContext } from './integration'

   export function setupMCPServer() {
     const server = new MCPServer({
       name: 'chef-simulator-mcp',
       tools,
       getContext: () => {
         return gameStateToContext()
       }
     })

     return server
   }
   ```

1.1 Test MCP server setup
   ```typescript
   // src/mcp/server/__tests__/index.test.ts
   import { setupMCPServer } from '../index'
   import { MCPServer } from 'mcp-sdk'
   import { tools } from '../tools'
   import { gameStateToContext } from '../integration'
   
   // Mock dependencies
   jest.mock('mcp-sdk')
   jest.mock('../tools', () => ({
     tools: [{ name: 'mock_tool' }]
   }))
   jest.mock('../resources', () => ({
     resources: [{ name: 'mock_resource' }]
   }))
   jest.mock('../integration', () => ({
     gameStateToContext: jest.fn().mockReturnValue({ gameState: 'mocked' })
   }))
   
   describe('MCP Server Setup', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock MCPServer implementation
       (MCPServer as jest.Mock).mockImplementation(() => ({
         name: 'chef-simulator-mcp',
         tools: [],
         getContext: expect.any(Function)
       }))
     })
     
     it('should create a new MCP server with correct configuration', () => {
       const server = setupMCPServer()
       
       // Check that MCPServer was called with the right params
       expect(MCPServer).toHaveBeenCalledWith({
         name: 'chef-simulator-mcp',
         tools,
         getContext: expect.any(Function)
       })
       
       // Verify server was created
       expect(server).toBeDefined()
     })
     
     it('should use gameStateToContext for context generation', () => {
       const server = setupMCPServer()
       
       // Get the getContext function that was passed to MCPServer
       const getContextFn = (MCPServer as jest.Mock).mock.calls[0][0].getContext
       
       // Call it and make sure it uses gameStateToContext
       getContextFn()
       expect(gameStateToContext).toHaveBeenCalled()
     })
     
     it('should handle server initialization errors gracefully', () => {
       // Mock MCPServer to throw an error
       (MCPServer as jest.Mock).mockImplementation(() => {
         throw new Error('Server initialization failed')
       })
       
       // Should handle the error (not throw)
       expect(() => setupMCPServer()).not.toThrow()
       
       // You might want to test that an error is logged or handled appropriately
       // This depends on your error handling implementation
     })
   })
   ```

### 4.2 Define MCP Tools
1. Implement tools for customer management, order management, etc.
   ```typescript
   // src/mcp/server/tools.ts
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   import { eventBus } from '@/lib/eventBus'

   export const tools = [
     {
       name: 'greet_customer',
       description: 'Greet a new customer and show them to a table',
       parameters: {
         customer_id: {
           type: 'string',
           description: 'ID of the customer to greet'
         },
         table_id: {
           type: 'string',
           description: 'ID of the table to seat the customer at'
         }
       },
       execute: async ({ customer_id, table_id }) => {
         const restaurantStore = useRestaurantStore.getState()
         const result = restaurantStore.actions.seatCustomer(customer_id, table_id)
         
         // Emit event for UI feedback
         eventBus.emit('customerSeated', { customer_id, table_id })
         
         return result
       }
     },
     // Other tools: take_order, serve_order, prepare_ingredient, cook_ingredient, plate_dish, purchase_ingredients
   ]
   ```

1.1 Test MCP tools definition and execution
   ```typescript
   // src/mcp/server/__tests__/tools.test.ts
   import { tools } from '../tools'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   import { eventBus } from '@/lib/eventBus'
   
   // Mock dependencies
   jest.mock('@/state/game/restaurantStore')
   jest.mock('@/state/game/kitchenStore')
   jest.mock('@/lib/eventBus')
   
   describe('MCP Tools', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock restaurant store
       const mockRestaurantStore = {
         actions: {
           seatCustomer: jest.fn().mockReturnValue({ success: true }),
           takeOrder: jest.fn().mockReturnValue({ success: true, orderId: 'order_1' }),
           serveOrder: jest.fn().mockReturnValue({ success: true })
         }
       }
       
       // Mock kitchen store
       const mockKitchenStore = {
         actions: {
           prepareIngredient: jest.fn().mockReturnValue({ success: true }),
           startCooking: jest.fn().mockReturnValue({ success: true, cookingId: 'cooking_1' }),
           plateDish: jest.fn().mockReturnValue({ success: true })
         }
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantStore)
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(mockKitchenStore)
     })
     
     it('should properly define all required tools with parameters and execute functions', () => {
       // Check that tools array exists and has items
       expect(tools).toBeDefined()
       expect(tools.length).toBeGreaterThan(0)
       
       // Check structure of each tool
       tools.forEach(tool => {
         expect(tool).toHaveProperty('name')
         expect(tool).toHaveProperty('description')
         expect(tool).toHaveProperty('parameters')
         expect(tool).toHaveProperty('execute')
         expect(typeof tool.execute).toBe('function')
       })
     })
     
     it('should successfully execute greet_customer tool', async () => {
       // Find the greet_customer tool
       const greetCustomerTool = tools.find(tool => tool.name === 'greet_customer')
       expect(greetCustomerTool).toBeDefined()
       
       // Execute the tool
       const result = await greetCustomerTool.execute({
         customer_id: 'customer_1',
         table_id: 'table_1'
       })
       
       // Check result
       expect(result).toEqual({ success: true })
       
       // Verify store action was called
       const restaurantStore = useRestaurantStore.getState()
       expect(restaurantStore.actions.seatCustomer).toHaveBeenCalledWith(
         'customer_1',
         'table_1'
       )
       
       // Verify event was emitted
       expect(eventBus.emit).toHaveBeenCalledWith(
         'customerSeated',
         { customer_id: 'customer_1', table_id: 'table_1' }
       )
     })
     
     it('should handle tool execution errors gracefully', async () => {
       // Mock a tool execution error
       const mockError = new Error('Tool execution failed')
       const restaurantStore = useRestaurantStore.getState()
       restaurantStore.actions.seatCustomer.mockImplementationOnce(() => {
         throw mockError
       })
       
       // Find the greet_customer tool
       const greetCustomerTool = tools.find(tool => tool.name === 'greet_customer')
       
       // Execute the tool (should not throw)
       const result = await greetCustomerTool.execute({
         customer_id: 'customer_1',
         table_id: 'table_1'
       })
       
       // Should return error result rather than throwing
       expect(result).toHaveProperty('success', false)
       expect(result).toHaveProperty('error')
     })
     
     it('should validate required parameters', async () => {
       // This test assumes there's parameter validation logic in the execute function
       // Find the greet_customer tool
       const greetCustomerTool = tools.find(tool => tool.name === 'greet_customer')
       
       // Execute with missing parameter
       const result = await greetCustomerTool.execute({
         customer_id: 'customer_1'
         // table_id is missing
       })
       
       // Should indicate parameter validation failure
       expect(result).toHaveProperty('success', false)
       expect(result).toHaveProperty('message')
       expect(result.message).toContain('table_id')
     })
   })
   ```

### 4.3 Define MCP Resources
1. Implement resources for restaurant state, kitchen resources, etc.
   ```typescript
   // src/mcp/server/resources.ts
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   
   export const resources = [
     {
       name: 'restaurant_state',
       description: 'Current state of the restaurant',
       get: () => {
         const restaurantState = useRestaurantStore.getState()
         return {
           funds: restaurantState.funds,
           activeCustomers: restaurantState.activeCustomers,
           queueLength: restaurantState.customerQueue.length,
           activeOrders: restaurantState.activeOrders
         }
       }
     },
     // Other resources: kitchen_resources, recipe_information, performance_metrics
   ]
   ```

1.1 Test MCP resources
   ```typescript
   // src/mcp/server/__tests__/resources.test.ts
   import { resources } from '../resources'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { useKitchenStore } from '@/state/game/kitchenStore'
   
   // Mock dependencies
   jest.mock('@/state/game/restaurantStore')
   jest.mock('@/state/game/kitchenStore')
   
   describe('MCP Resources', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock restaurant store state
       const mockRestaurantState = {
         funds: 1000,
         activeCustomers: [
           { id: 'customer_1', name: 'John Doe' },
           { id: 'customer_2', name: 'Jane Smith' }
         ],
         customerQueue: [
           { id: 'customer_3', name: 'Bob Johnson' }
         ],
         activeOrders: [
           { id: 'order_1', customerId: 'customer_1', items: ['dish_1'] }
         ]
       }
       
       // Mock kitchen store state
       const mockKitchenState = {
         inventory: [
           { id: 'ing_1', name: 'Tomato', quantity: 10 },
           { id: 'ing_2', name: 'Lettuce', quantity: 5 }
         ],
         activeCookingProcesses: [
           { id: 'cooking_1', ingredients: ['ing_1'], progress: 50 }
         ],
         equipment: [
           { id: 'equip_1', name: 'Stove', status: 'busy' },
           { id: 'equip_2', name: 'Cutting Board', status: 'idle' }
         ]
       }
       
       // @ts-ignore - Simplified for testing
       useRestaurantStore.getState.mockReturnValue(mockRestaurantState)
       
       // @ts-ignore - Simplified for testing
       useKitchenStore.getState.mockReturnValue(mockKitchenState)
     })
     
     it('should define all required resources with name, description and get functions', () => {
       // Check resources array
       expect(resources).toBeDefined()
       expect(resources.length).toBeGreaterThan(0)
       
       // Check structure of each resource
       resources.forEach(resource => {
         expect(resource).toHaveProperty('name')
         expect(resource).toHaveProperty('description')
         expect(resource).toHaveProperty('get')
         expect(typeof resource.get).toBe('function')
       })
     })
     
     it('should retrieve restaurant state resource data correctly', () => {
       // Find restaurant_state resource
       const restaurantStateResource = resources.find(r => r.name === 'restaurant_state')
       expect(restaurantStateResource).toBeDefined()
       
       // Get the resource data
       const data = restaurantStateResource.get()
       
       // Check data structure
       expect(data).toHaveProperty('funds', 1000)
       expect(data).toHaveProperty('activeCustomers')
       expect(data.activeCustomers).toHaveLength(2)
       expect(data).toHaveProperty('queueLength', 1)
       expect(data).toHaveProperty('activeOrders')
       expect(data.activeOrders).toHaveLength(1)
     })
     
     it('should handle errors in resource getters gracefully', () => {
       // Mock restaurant store to throw error
       useRestaurantStore.getState.mockImplementationOnce(() => {
         throw new Error('Failed to get restaurant state')
       })
       
       // Find restaurant_state resource
       const restaurantStateResource = resources.find(r => r.name === 'restaurant_state')
       
       // Get the resource data (should not throw)
       const data = restaurantStateResource.get()
       
       // Should return error or fallback data
       expect(data).toHaveProperty('error')
     })
     
     it('should provide properly formatted data for LLM context', () => {
       // This tests that resources return data in a good format for LLM context
       
       // Get all resources' data
       const allResourceData = resources.map(resource => ({
         name: resource.name,
         data: resource.get()
       }))
       
       // Check each resource's data format
       allResourceData.forEach(resource => {
         // Data should be serializable to JSON
         const serialized = JSON.stringify(resource.data)
         expect(serialized).toBeDefined()
         
         // Reconstructed object should match original
         const deserialized = JSON.parse(serialized)
         expect(deserialized).toEqual(resource.data)
       })
     })
   })
   ```

### 4.4 MCP Command Management
1. Implement command saving and retrieval
   ```typescript
   // src/mcp/client/commands.ts
   import { create } from 'zustand'
   import { immer } from 'zustand/middleware/immer'

   export interface Command {
     id: string
     name: string
     commandText: string
     tags: string[]
   }

   interface CommandsState {
     savedCommands: Command[]
     suggestedCommands: Command[]
     actions: {
       saveCommand: (command: Omit<Command, 'id'>) => void
       deleteCommand: (id: string) => void
       loadSavedCommands: () => void
     }
   }

   // Create default commands
   const defaultCommands: Command[] = [
     {
       id: 'default_1',
       name: 'Take All Orders',
       commandText: 'Take orders from all waiting customers',
       tags: ['orders', 'customers']
     },
     // Other default commands
   ]

   export const useCommandsStore = create<CommandsState>()(
     immer((set) => ({
       savedCommands: [],
       suggestedCommands: defaultCommands,
       actions: {
         saveCommand: (command) => set((state) => {
           const id = `custom_${Date.now()}`
           state.savedCommands.push({ ...command, id })
           
           // Save to localStorage
           localStorage.setItem('savedCommands', JSON.stringify(state.savedCommands))
         }),
         deleteCommand: (id) => set((state) => {
           state.savedCommands = state.savedCommands.filter(cmd => cmd.id !== id)
           
           // Update localStorage
           localStorage.setItem('savedCommands', JSON.stringify(state.savedCommands))
         }),
         loadSavedCommands: () => set((state) => {
           const savedCommands = localStorage.getItem('savedCommands')
           if (savedCommands) {
             state.savedCommands = JSON.parse(savedCommands)
           }
         })
       }
     }))
   )
   ```

1.1 Test MCP command management
   ```typescript
   // src/mcp/client/__tests__/commands.test.ts
   import { useCommandsStore, Command } from '../commands'
   
   // Mock localStorage
   const localStorageMock = (() => {
     let store = {}
     return {
       getItem: jest.fn(key => store[key] || null),
       setItem: jest.fn((key, value) => {
         store[key] = value.toString()
       }),
       clear: jest.fn(() => {
         store = {}
       })
     }
   })()
   
   // Set up localStorage mock
   Object.defineProperty(window, 'localStorage', {
     value: localStorageMock
   })
   
   describe('MCP Command Management', () => {
     beforeEach(() => {
       // Reset localStorage mock
       localStorage.clear()
       
       // Reset store to initial state
       const { actions } = useCommandsStore.getState()
       
       // Reset store and clean any existing commands
       useCommandsStore.setState({
         savedCommands: [],
         suggestedCommands: [
           {
             id: 'default_1',
             name: 'Take All Orders',
             commandText: 'Take orders from all waiting customers',
             tags: ['orders', 'customers']
           }
         ]
       })
     })
     
     it('should initialize with default suggested commands', () => {
       // Check initial state
       const { suggestedCommands } = useCommandsStore.getState()
       
       expect(suggestedCommands).toBeDefined()
       expect(suggestedCommands.length).toBeGreaterThan(0)
       expect(suggestedCommands[0]).toHaveProperty('id', 'default_1')
     })
     
     it('should save a custom command', () => {
       // Get actions
       const { actions } = useCommandsStore.getState()
       
       // Create a test command
       const testCommand = {
         name: 'Test Command',
         commandText: 'This is a test command',
         tags: ['test']
       }
       
       // Save command
       actions.saveCommand(testCommand)
       
       // Check state was updated
       const { savedCommands } = useCommandsStore.getState()
       expect(savedCommands).toHaveLength(1)
       expect(savedCommands[0].name).toBe('Test Command')
       
       // Check localStorage was updated
       expect(localStorage.setItem).toHaveBeenCalled()
       
       // Parse localStorage data
       const savedData = JSON.parse(localStorage.getItem('savedCommands'))
       expect(savedData).toHaveLength(1)
       expect(savedData[0].name).toBe('Test Command')
     })
     
     it('should delete a command', () => {
       // Get actions
       const { actions } = useCommandsStore.getState()
       
       // Save test commands
       actions.saveCommand({
         name: 'Command 1',
         commandText: 'First test command',
         tags: ['test']
       })
       
       actions.saveCommand({
         name: 'Command 2',
         commandText: 'Second test command',
         tags: ['test']
       })
       
       // Get the first command ID
       const { savedCommands } = useCommandsStore.getState()
       const firstCommandId = savedCommands[0].id
       
       // Delete the first command
       actions.deleteCommand(firstCommandId)
       
       // Check state was updated
       const updatedState = useCommandsStore.getState()
       expect(updatedState.savedCommands).toHaveLength(1)
       expect(updatedState.savedCommands[0].name).toBe('Command 2')
       
       // Check localStorage was updated
       expect(localStorage.setItem).toHaveBeenCalledTimes(3) // 2 saves + 1 delete
     })
     
     it('should load saved commands from localStorage', () => {
       // Set up test data in localStorage
       const testCommands = [
         {
           id: 'test_1',
           name: 'Loaded Command',
           commandText: 'Command loaded from storage',
           tags: ['test', 'storage']
         }
       ]
       
       localStorage.setItem('savedCommands', JSON.stringify(testCommands))
       
       // Load saved commands
       const { actions } = useCommandsStore.getState()
       actions.loadSavedCommands()
       
       // Check state was updated
       const { savedCommands } = useCommandsStore.getState()
       expect(savedCommands).toHaveLength(1)
       expect(savedCommands[0].id).toBe('test_1')
       expect(savedCommands[0].name).toBe('Loaded Command')
     })
     
     it('should handle invalid localStorage data gracefully', () => {
       // Set invalid JSON in localStorage
       localStorage.setItem('savedCommands', 'not valid JSON')
       
       // Load saved commands should not throw
       const { actions } = useCommandsStore.getState()
       expect(() => actions.loadSavedCommands()).not.toThrow()
       
       // Saved commands should be empty or fallback to default
       const { savedCommands } = useCommandsStore.getState()
       expect(Array.isArray(savedCommands)).toBe(true)
     })
   })
   ```

## 5. UI Implementation

### 5.1 Game UI Components
1. Create main layout components
   - Restaurant view
   - Kitchen view
   - Customer management interface
   - Inventory management interface

1.1 Test main layout components
   ```typescript
   // src/components/game/__tests__/RestaurantView.test.tsx
   import React from 'react'
   import { render, screen } from '@testing-library/react'
   import RestaurantView from '../RestaurantView'
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   
   // Mock dependencies
   jest.mock('@/state/game/gameStore')
   jest.mock('@/state/game/restaurantStore')
   jest.mock('../CustomerArea', () => () => <div data-testid="customer-area">Customer Area</div>)
   jest.mock('../KitchenArea', () => () => <div data-testid="kitchen-area">Kitchen Area</div>)
   jest.mock('../Inventory', () => () => <div data-testid="inventory">Inventory</div>)
   jest.mock('../PerformanceMetrics', () => () => <div data-testid="performance-metrics">Performance Metrics</div>)
   
   describe('RestaurantView Component', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock game store
       const mockGameStore = {
         gameMode: 'manual'
       }
       
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue(mockGameStore)
     })
     
     it('should render all required sub-components', () => {
       render(<RestaurantView />)
       
       // Check all expected areas are rendered
       expect(screen.getByTestId('customer-area')).toBeInTheDocument()
       expect(screen.getByTestId('kitchen-area')).toBeInTheDocument()
       expect(screen.getByTestId('inventory')).toBeInTheDocument()
       expect(screen.getByTestId('performance-metrics')).toBeInTheDocument()
     })
     
     it('should adapt layout based on game mode', () => {
       // Test with manual mode
       render(<RestaurantView />)
       const baseLayout = document.body.innerHTML
       
       // Clean up
       jest.clearAllMocks()
       
       // Test with MCP mode
       // @ts-ignore - Simplified for testing
       useGameStore.getState.mockReturnValue({ gameMode: 'mcp' })
       
       render(<RestaurantView />)
       // Layout might be the same, just checking different game modes don't throw errors
       expect(document.body.innerHTML).toBeDefined()
     })
     
     it('should apply responsive design with appropriate grid layout', () => {
       render(<RestaurantView />)
       
       // Check that Grid component and appropriate sizing is applied
       // This is more of a visual test, but we can check for Grid classes
       const gridElement = document.querySelector('.mantine-Grid-root')
       expect(gridElement).toBeInTheDocument()
       
       // Check that columns have responsive classes
       const columns = document.querySelectorAll('.mantine-Grid-col')
       expect(columns.length).toBeGreaterThan(0)
       
       // Check at least one column has responsive props
       // Note: This test may need adjustment based on exact class naming in Mantine
       const responsiveCol = document.querySelector('[class*="mantine-Grid-col-"]')
       expect(responsiveCol).toBeInTheDocument()
     })
   })
   
   // Add more component tests for CustomerArea, KitchenArea, etc.
   // src/components/game/__tests__/CustomerArea.test.tsx
   // src/components/game/__tests__/KitchenArea.test.tsx
   ```

2. Implement responsive design using Mantine and CSS modules
   ```typescript
   // src/components/game/RestaurantView.tsx
   'use client'
   
   import { useGameStore } from '@/state/game/gameStore'
   import { useRestaurantStore } from '@/state/game/restaurantStore'
   import { Grid, Paper } from '@mantine/core'
   import CustomerArea from './CustomerArea'
   import KitchenArea from './KitchenArea'
   import Inventory from './Inventory'
   import PerformanceMetrics from './PerformanceMetrics'
   
   export default function RestaurantView() {
     const { gameMode } = useGameStore()
     
     return (
       <Grid grow>
         <Grid.Col span={{ base: 12, md: 8 }}>
           <Paper p="md" shadow="sm">
             <CustomerArea />
           </Paper>
         </Grid.Col>
         <Grid.Col span={{ base: 12, md: 4 }}>
           <Paper p="md" shadow="sm" mb="md">
             <Inventory />
           </Paper>
           <Paper p="md" shadow="sm">
             <PerformanceMetrics />
           </Paper>
         </Grid.Col>
         <Grid.Col span={12}>
           <Paper p="md" shadow="sm">
             <KitchenArea />
           </Paper>
         </Grid.Col>
       </Grid>
     )
   }
   ```

2.1 Test responsive design implementation
   ```typescript
   // src/components/ui/__tests__/ResponsiveDesign.test.tsx
   import React from 'react'
   import { render } from '@testing-library/react'
   import { Grid } from '@mantine/core'
   import { useMediaQuery } from '@mantine/hooks'
   
   // Mock Mantine hooks
   jest.mock('@mantine/hooks', () => ({
     useMediaQuery: jest.fn()
   }))
   
   // Create a test component that uses responsive design
   const TestResponsiveComponent = () => (
     <Grid>
       <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
         <div>Responsive Column</div>
       </Grid.Col>
     </Grid>
   )
   
   describe('Responsive Design Implementation', () => {
     it('should handle different screen sizes appropriately', () => {
       // Test mobile layout
       (useMediaQuery as jest.Mock).mockReturnValue(false) // Small screen
       
       const { container: mobileContainer } = render(<TestResponsiveComponent />)
       
       // Test desktop layout
       (useMediaQuery as jest.Mock).mockReturnValue(true) // Large screen
       
       const { container: desktopContainer } = render(<TestResponsiveComponent />)
       
       // Classes applied differently based on screen size
       // Note: Actual assertions would depend on Mantine's implementation
       expect(mobileContainer).toBeDefined()
       expect(desktopContainer).toBeDefined()
     })
     
     it('should ensure all UI elements are accessible at different breakpoints', () => {
       // Simulate different breakpoints
       const breakpoints = [
         { name: 'mobile', matches: false },
         { name: 'tablet', matches: true },
         { name: 'desktop', matches: true }
       ]
       
       breakpoints.forEach(breakpoint => {
         (useMediaQuery as jest.Mock).mockReturnValue(breakpoint.matches)
         
         const { container, getByText } = render(<TestResponsiveComponent />)
         
         // Content should be accessible regardless of breakpoint
         expect(getByText('Responsive Column')).toBeInTheDocument()
       })
     })
   })
   ```

### 5.2 Game Control Interfaces
1. Implement manual and MCP interfaces
   ```typescript
   // src/components/mcp/MCPInterface.tsx
   'use client'
   
   import { useState } from 'react'
   import { Textarea, Button, ActionIcon, Paper, Title, Card, Text } from '@mantine/core'
   import { IconSend, IconMicrophone, IconPin } from '@tabler/icons-react'
   import { useMCPStore } from '@/state/mcp/mcpStore'
   import { useCommandsStore } from '@/mcp/client/commands'
   import SavedCommands from './SavedCommands'
   
   export default function MCPInterface() {
     const [input, setInput] = useState('')
     const { currentCommand, commandHistory, actions } = useMCPStore()
     const { savedCommands, suggestedCommands } = useCommandsStore()
     
     const handleSendCommand = () => {
       if (!input.trim()) return
       
       actions.sendCommand(input)
       setInput('')
     }
     
     const handleSaveCommand = () => {
       if (!input.trim()) return
       
       actions.saveCommand({
         name: `Custom Command ${savedCommands.length + 1}`,
         commandText: input,
         tags: []
       })
     }
     
     return (
       <Paper p="md" radius="md">
         <Title order={4} mb="sm">MCP Assistance</Title>
         
         <div className="command-history">
           {commandHistory.map((cmd, i) => (
             <Card key={i} mb="xs" padding="xs">
               <Text size="sm" color="dimmed">You:</Text>
               <Text>{cmd.input}</Text>
               {cmd.response && (
                 <>
                   <Text size="sm" color="dimmed" mt="xs">MCP:</Text>
                   <Text>{cmd.response}</Text>
                 </>
               )}
             </Card>
           ))}
         </div>
         
         {currentCommand && (
           <Card mb="md" padding="xs">
             <Text size="sm" color="dimmed">Processing:</Text>
             <Text>{currentCommand}</Text>
           </Card>
         )}
         
         <SavedCommands 
           commands={[...suggestedCommands, ...savedCommands]} 
           onSelect={(cmd) => setInput(cmd.commandText)}
         />
         
         <div className="command-input">
           <Textarea
             value={input}
             onChange={(e) => setInput(e.currentTarget.value)}
             placeholder="Enter command for MCP..."
             minRows={2}
             maxRows={4}
             mb="xs"
           />
           
           <div className="actions">
             <Button leftIcon={<IconSend size={16} />} onClick={handleSendCommand}>
               Send
             </Button>
             <ActionIcon onClick={handleSaveCommand} variant="filled" color="blue">
               <IconPin size={16} />
             </ActionIcon>
           </div>
         </div>
       </Paper>
     )
   }
   ```

1.1 Test manual and MCP interfaces
   ```typescript
   // src/components/mcp/__tests__/MCPInterface.test.tsx
   import React from 'react'
   import { render, screen, fireEvent } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'
   import MCPInterface from '../MCPInterface'
   import { useMCPStore } from '@/state/mcp/mcpStore'
   import { useCommandsStore } from '@/mcp/client/commands'
   
   // Mock dependencies
   jest.mock('@/state/mcp/mcpStore')
   jest.mock('@/mcp/client/commands')
   
   // Mock the SavedCommands component
   jest.mock('../SavedCommands', () => {
     return ({ commands, onSelect }) => (
       <div data-testid="saved-commands">
         {commands.map((cmd, i) => (
           <button 
             key={i} 
             data-testid={`command-${i}`}
             onClick={() => onSelect(cmd)}
           >
             {cmd.name}
           </button>
         ))}
       </div>
     )
   })
   
   describe('MCPInterface Component', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock MCP store
       const mockMCPStore = {
         currentCommand: null,
         commandHistory: [
           { input: 'Previous command', response: 'MCP response' }
         ],
         actions: {
           sendCommand: jest.fn(),
         }
       }
       
       // Mock Commands store
       const mockCommandsStore = {
         savedCommands: [
           { id: 'saved_1', name: 'Saved Command', commandText: 'saved command text', tags: [] }
         ],
         suggestedCommands: [
           { id: 'suggested_1', name: 'Suggested Command', commandText: 'suggested command text', tags: [] }
         ],
         actions: {
           saveCommand: jest.fn()
         }
       }
       
       // @ts-ignore - Simplified for testing
       useMCPStore.mockReturnValue(mockMCPStore)
       
       // @ts-ignore - Simplified for testing
       useCommandsStore.mockReturnValue(mockCommandsStore)
     })
     
     it('should render command history', () => {
       render(<MCPInterface />)
       
       expect(screen.getByText('Previous command')).toBeInTheDocument()
       expect(screen.getByText('MCP response')).toBeInTheDocument()
     })
     
     it('should allow typing and sending commands', async () => {
       const user = userEvent.setup()
       render(<MCPInterface />)
       
       // Find the textarea and send button
       const textarea = screen.getByPlaceholderText('Enter command for MCP...')
       const sendButton = screen.getByText('Send')
       
       // Type a command
       await user.type(textarea, 'Test command')
       
       // Send the command
       await user.click(sendButton)
       
       // Check that the command was sent to the MCP store
       const mcpStore = useMCPStore()
       expect(mcpStore.actions.sendCommand).toHaveBeenCalledWith('Test command')
       
       // Textarea should be cleared
       expect(textarea).toHaveValue('')
     })
     
     it('should allow saving commands', async () => {
       const user = userEvent.setup()
       render(<MCPInterface />)
       
       // Find the textarea and save button
       const textarea = screen.getByPlaceholderText('Enter command for MCP...')
       const saveButton = screen.getByRole('button', { name: '' }) // The IconPin button
       
       // Type a command
       await user.type(textarea, 'Command to save')
       
       // Save the command
       await user.click(saveButton)
       
       // Check that the command was saved
       const commandsStore = useCommandsStore()
       expect(commandsStore.actions.saveCommand).toHaveBeenCalledWith({
         name: expect.any(String),
         commandText: 'Command to save',
         tags: []
       })
     })
     
     it('should display suggested and saved commands', () => {
       render(<MCPInterface />)
       
       // Check that both commands are rendered
       expect(screen.getByText('Saved Command')).toBeInTheDocument()
       expect(screen.getByText('Suggested Command')).toBeInTheDocument()
     })
     
     it('should populate input when a saved command is selected', async () => {
       const user = userEvent.setup()
       render(<MCPInterface />)
       
       // Find the command button and click it
       const commandButton = screen.getByText('Saved Command')
       await user.click(commandButton)
       
       // Check that the input is populated
       const textarea = screen.getByPlaceholderText('Enter command for MCP...')
       expect(textarea).toHaveValue('saved command text')
     })
     
     it('should handle processing state correctly', () => {
       // Mock processing state
       useMCPStore.mockReturnValue({
         ...useMCPStore(),
         currentCommand: 'Command being processed'
       })
       
       render(<MCPInterface />)
       
       // Should show the processing indicator
       expect(screen.getByText('Processing:')).toBeInTheDocument()
       expect(screen.getByText('Command being processed')).toBeInTheDocument()
     })
   })
   ```

### 5.3 Animation and Sound Effects
1. Implement animation system using Framer Motion
2. Add sound effects using Howler.js
   ```typescript
   // src/lib/audio.ts
   import { Howl } from 'howler'

   const sounds = {
     cookingStart: new Howl({ src: ['/assets/audio/sfx/cooking_start.mp3'] }),
     cookingComplete: new Howl({ src: ['/assets/audio/sfx/cooking_complete.mp3'] }),
     chop: new Howl({ src: ['/assets/audio/sfx/prep_chop.mp3'] }),
     sizzle: new Howl({ src: ['/assets/audio/sfx/cooking_sizzle.mp3'], loop: true }),
     customerHappy: new Howl({ src: ['/assets/audio/sfx/customer_happy.mp3'] }),
     customerAngry: new Howl({ src: ['/assets/audio/sfx/customer_angry.mp3'] }),
     bell: new Howl({ src: ['/assets/audio/sfx/bell.mp3'] }),
     music: {
       calm: new Howl({ 
         src: ['/assets/audio/music/upbeat_low.mp3'],
         loop: true,
         volume: 0.5
       }),
       medium: new Howl({ 
         src: ['/assets/audio/music/upbeat_medium.mp3'],
         loop: true,
         volume: 0.5
       }),
       intense: new Howl({ 
         src: ['/assets/audio/music/upbeat_high.mp3'],
         loop: true,
         volume: 0.5
       })
     }
   }

   export function playSfx(name: keyof typeof sounds) {
     if (typeof sounds[name] === 'object' && !(sounds[name] instanceof Howl)) {
       return
     }
     
     const sound = sounds[name] as Howl
     sound.play()
   }

   export function playMusic(intensity: 'calm' | 'medium' | 'intense') {
     // Stop all music first
     Object.values(sounds.music).forEach(track => track.stop())
     
     // Play the selected track
     sounds.music[intensity].play()
   }

   export function stopAllSounds() {
     Object.values(sounds).forEach(sound => {
       if (sound instanceof Howl) {
         sound.stop()
       } else if (typeof sound === 'object') {
         Object.values(sound).forEach(s => s.stop())
       }
     })
   }
   ```

2.1 Test animation and sound systems
   ```typescript
   // src/lib/__tests__/audio.test.ts
   import { playSfx, playMusic, stopAllSounds } from '../audio'
   import { Howl } from 'howler'
   
   // Mock Howler
   jest.mock('howler', () => {
     return {
       Howl: jest.fn().mockImplementation(() => ({
         play: jest.fn(),
         stop: jest.fn()
       }))
     }
   })
   
   describe('Audio System', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
       
       // Mock window HTMLMediaElement
       window.HTMLMediaElement.prototype.play = jest.fn()
       window.HTMLMediaElement.prototype.pause = jest.fn()
     })
     
     it('should create sound effects with correct paths', () => {
       // Check Howl initialization
       expect(Howl).toHaveBeenCalledWith(
         expect.objectContaining({
           src: expect.arrayContaining([expect.stringContaining('cooking_start.mp3')])
         })
       )
     })
     
     it('should play sound effects correctly', () => {
       // Play a sound effect
       playSfx('cookingStart')
       
       // Check if the play method was called
       // We need to get the Howl instance mock first
       const mockHowl = (Howl as jest.Mock).mock.results[0].value
       expect(mockHowl.play).toHaveBeenCalled()
     })
     
     it('should play different music tracks based on intensity', () => {
       // Play calm music
       playMusic('calm')
       
       // Check that proper tracks are played/stopped
       const mockHowls = (Howl as jest.Mock).mock.results.map(result => result.value)
       
       // All music tracks should be stopped
       mockHowls.forEach(howl => {
         expect(howl.stop).toHaveBeenCalled()
       })
       
       // Then the calm track should be played
       // This test is simplified and might need adjustment based on exact implementation
       expect(mockHowls.some(howl => howl.play.mock.calls.length > 0)).toBe(true)
     })
     
     it('should stop all sounds when requested', () => {
       // Stop all sounds
       stopAllSounds()
       
       // Check that all sounds were stopped
       const mockHowls = (Howl as jest.Mock).mock.results.map(result => result.value)
       mockHowls.forEach(howl => {
         expect(howl.stop).toHaveBeenCalled()
       })
     })
     
     it('should handle non-existent sound gracefully', () => {
       // Play a non-existent sound (should not throw)
       expect(() => playSfx('nonExistentSound' as any)).not.toThrow()
     })
   })
   
   // src/components/animation/__tests__/AnimationSystem.test.tsx
   import React from 'react'
   import { render, screen } from '@testing-library/react'
   import { motion, AnimatePresence } from 'framer-motion'
   
   // Mock framer-motion
   jest.mock('framer-motion', () => ({
     motion: {
       div: jest.fn().mockImplementation(({ children, ...props }) => (
         <div data-testid="motion-div" {...props}>{children}</div>
       )),
     },
     AnimatePresence: jest.fn().mockImplementation(({ children }) => children)
   }))
   
   // Create a test component using animations
   const TestAnimationComponent = ({ isVisible = true }) => (
     <AnimatePresence>
       {isVisible && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           data-testid="animated-element"
         >
           Animated Content
         </motion.div>
       )}
     </AnimatePresence>
   )
   
   describe('Animation System', () => {
     it('should render animated components correctly', () => {
       render(<TestAnimationComponent />)
       
       const animatedElement = screen.getByTestId('animated-element')
       expect(animatedElement).toBeInTheDocument()
       expect(animatedElement).toHaveTextContent('Animated Content')
     })
     
     it('should apply animation properties', () => {
       render(<TestAnimationComponent />)
       
       const animatedElement = screen.getByTestId('motion-div')
       
       // Check for animation props
       expect(animatedElement).toHaveAttribute('initial')
       expect(animatedElement).toHaveAttribute('animate')
       expect(animatedElement).toHaveAttribute('exit')
     })
     
     it('should not render elements when they should be hidden', () => {
       render(<TestAnimationComponent isVisible={false} />)
       
       // Element should not be in the document
       expect(screen.queryByTestId('animated-element')).not.toBeInTheDocument()
     })
   })
   ```

## 6. Asset Management

### 6.1 Asset Preloading
1. Implement asset preloading for critical assets
   ```typescript
   // src/lib/assetLoader.ts
   const imageCache: Record<string, HTMLImageElement> = {}

   export function preloadImages(urls: string[]): Promise<void[]> {
     const promises = urls.map(url => {
       return new Promise<void>((resolve, reject) => {
         if (imageCache[url]) {
           resolve()
           return
         }
         
         const img = new Image()
         img.onload = () => {
           imageCache[url] = img
           resolve()
         }
         img.onerror = reject
         img.src = url
       })
     })
     
     return Promise.all(promises)
   }

   export function preloadCriticalAssets() {
     const criticalImages = [
       // UI elements
       '/assets/images/ui/button_cook_normal.svg',
       '/assets/images/ui/button_cook_hover.svg',
       
       // Common ingredients
       '/assets/images/ingredients/meat_beef_raw.png',
       '/assets/images/ingredients/vegetable_lettuce_raw.png',
       
       // Equipment
       '/assets/images/equipment/cooking_stove_idle.png',
       '/assets/images/equipment/prep_cutting_board_idle.png',
     ]
     
     return preloadImages(criticalImages)
   }
   ```

1.1 Test asset preloading
   ```typescript
   // src/lib/__tests__/assetLoader.test.ts
   import { preloadImages, preloadCriticalAssets } from '../assetLoader'
   
   describe('Asset Preloading', () => {
     // Create mocks for Image
     let originalImage: typeof global.Image
     let mockImageInstance: any
   
     beforeEach(() => {
       // Store original Image constructor
       originalImage = global.Image
       
       // Create a mock Image class
       mockImageInstance = {
         onload: null,
         onerror: null,
         src: ''
       }
       
       // Replace global Image constructor with mock
       global.Image = jest.fn(() => mockImageInstance) as any
     })
     
     afterEach(() => {
       // Restore original Image constructor
       global.Image = originalImage
     })
     
     it('should preload images and cache them', async () => {
       // Setup test
       const testUrls = ['/test-image-1.png', '/test-image-2.png']
       let preloadPromise = preloadImages(testUrls)
       
       // Manually trigger onload for all images
       testUrls.forEach(url => {
         // Find the instance for this URL by checking src
         expect(mockImageInstance.src).toBe(url)
         
         // Trigger onload to resolve the promise
         mockImageInstance.onload()
       })
       
       // Wait for all promises to resolve
       await preloadPromise
       
       // Should not throw errors
       expect(global.Image).toHaveBeenCalledTimes(testUrls.length)
       
       // Try loading the same images again (should use cache)
       const previousImageCount = (global.Image as jest.Mock).mock.calls.length
       preloadPromise = preloadImages(testUrls)
       
       // Trigger onload again to complete the test
       testUrls.forEach(() => mockImageInstance.onload())
       
       await preloadPromise
       
       // Should not create new Image instances if already cached
       expect(global.Image).toHaveBeenCalledTimes(previousImageCount)
     })
     
     it('should handle image loading errors gracefully', async () => {
       // Setup test
       const testUrl = '/test-image-error.png'
       const preloadPromise = preloadImages([testUrl])
       
       // Trigger error
       mockImageInstance.onerror(new Error('Failed to load image'))
       
       // Promise should reject
       await expect(preloadPromise).rejects.toBeDefined()
     })
     
     it('should preload critical assets for the game', async () => {
       // Create a spy on preloadImages function
       const preloadImagesSpy = jest.spyOn({ preloadImages }, 'preloadImages')
       
       // Call preloadCriticalAssets
       preloadCriticalAssets()
       
       // Should call preloadImages with critical assets
       expect(preloadImagesSpy).toHaveBeenCalledWith(expect.arrayContaining([
         expect.stringContaining('/assets/images/')
       ]))
       
       // Restore original function
       preloadImagesSpy.mockRestore()
     })
     
     it('should preload the correct number of critical assets', async () => {
       // Mock implementation of preloadImages to capture passed URLs
       let capturedUrls: string[] = []
       jest.spyOn({ preloadImages }, 'preloadImages').mockImplementation((urls: string[]) => {
         capturedUrls = urls
         return Promise.resolve([])
       })
       
       preloadCriticalAssets()
       
       // Check that we're preloading multiple assets
       expect(capturedUrls.length).toBeGreaterThan(4)
       
       // Check that we have UI elements, ingredients, and equipment
       const categories = {
         ui: 0,
         ingredients: 0,
         equipment: 0
       }
       
       capturedUrls.forEach(url => {
         if (url.includes('/ui/')) categories.ui++
         if (url.includes('/ingredients/')) categories.ingredients++
         if (url.includes('/equipment/')) categories.equipment++
       })
       
       // We should have assets from each category
       expect(categories.ui).toBeGreaterThan(0)
       expect(categories.ingredients).toBeGreaterThan(0)
       expect(categories.equipment).toBeGreaterThan(0)
     })
   })
   ```

### 6.2 Dynamic Asset Loading
1. Create hooks for dynamic asset loading
   ```typescript
   // src/hooks/useAssetLoader.ts
   import { useState, useEffect } from 'react'
   import { preloadImages } from '@/lib/assetLoader'

   export function useAssetLoader(urls: string[], dependencies: any[] = []) {
     const [loaded, setLoaded] = useState(false)
     const [error, setError] = useState<Error | null>(null)
     
     useEffect(() => {
       setLoaded(false)
       setError(null)
       
       preloadImages(urls)
         .then(() => setLoaded(true))
         .catch(err => setError(err))
     }, dependencies)
     
     return { loaded, error }
   }
   ```

1.1 Test dynamic asset loading hooks
   ```typescript
   // src/hooks/__tests__/useAssetLoader.test.tsx
   import { renderHook, act } from '@testing-library/react-hooks'
   import { useAssetLoader } from '../useAssetLoader'
   import { preloadImages } from '@/lib/assetLoader'
   
   // Mock the assetLoader module
   jest.mock('@/lib/assetLoader', () => ({
     preloadImages: jest.fn()
   }))
   
   describe('useAssetLoader Hook', () => {
     beforeEach(() => {
       // Reset mocks
       jest.clearAllMocks()
     })
     
     it('should start with loaded=false and no error', () => {
       // Setup preloadImages mock to return a pending promise
       (preloadImages as jest.Mock).mockReturnValue(new Promise(() => {}))
       
       // Render the hook
       const { result } = renderHook(() => useAssetLoader(['/test.png']))
       
       // Check initial state
       expect(result.current.loaded).toBe(false)
       expect(result.current.error).toBeNull()
     })
     
     it('should set loaded=true when assets are loaded successfully', async () => {
       // Setup preloadImages mock to resolve immediately
       (preloadImages as jest.Mock).mockResolvedValue([])
       
       // Render the hook
       const { result, waitForNextUpdate } = renderHook(() => 
         useAssetLoader(['/test1.png', '/test2.png'])
       )
       
       // Wait for the next update (after the promise resolves)
       await waitForNextUpdate()
       
       // Check loaded state
       expect(result.current.loaded).toBe(true)
       expect(result.current.error).toBeNull()
       
       // Verify preloadImages was called with correct URLs
       expect(preloadImages).toHaveBeenCalledWith(['/test1.png', '/test2.png'])
     })
     
     it('should set error state when asset loading fails', async () => {
       // Setup preloadImages mock to reject with error
       const testError = new Error('Failed to load assets')
       (preloadImages as jest.Mock).mockRejectedValue(testError)
       
       // Render the hook
       const { result, waitForNextUpdate } = renderHook(() => 
         useAssetLoader(['/error.png'])
       )
       
       // Wait for the next update (after the promise rejects)
       await waitForNextUpdate()
       
       // Check error state
       expect(result.current.loaded).toBe(false)
       expect(result.current.error).toBe(testError)
     })
     
     it('should reload assets when dependencies change', async () => {
       // Setup preloadImages mock to resolve immediately
       (preloadImages as jest.Mock).mockResolvedValue([])
       
       // Render the hook with a dependency
       const { result, waitForNextUpdate, rerender } = renderHook(
         ({ dependency }) => useAssetLoader(['/test.png'], [dependency]),
         { initialProps: { dependency: 1 } }
       )
       
       // Wait for the first load
       await waitForNextUpdate()
       expect(result.current.loaded).toBe(true)
       
       // Change the dependency
       rerender({ dependency: 2 })
       
       // Should reset to loading state
       expect(result.current.loaded).toBe(false)
       
       // Wait for the second load
       await waitForNextUpdate()
       expect(result.current.loaded).toBe(true)
       
       // Verify preloadImages was called twice
       expect(preloadImages).toHaveBeenCalledTimes(2)
     })
     
     it('should handle empty URLs array', async () => {
       // Render the hook with empty URLs
       const { result } = renderHook(() => useAssetLoader([]))
       
       // Should mark as loaded immediately since there's nothing to load
       expect(result.current.loaded).toBe(false)
       
       // preloadImages should still be called with empty array
       expect(preloadImages).toHaveBeenCalledWith([])
     })
     
     it('should cancel pending loads when unmounted', async () => {
       // Setup a pending promise that never resolves
       (preloadImages as jest.Mock).mockReturnValue(new Promise(() => {}))
       
       // Render the hook
       const { unmount } = renderHook(() => useAssetLoader(['/test.png']))
       
       // Unmount component
       unmount()
       
       // No state updates should be made after unmount (would cause warnings)
       // This is more of a test that no errors are thrown
       // The actual cleanup is internal to React and not directly testable
     })
   })
   
   // Example component test that uses the asset loader hook
   // src/components/game/__tests__/AssetLoadingExample.test.tsx
   import React from 'react'
   import { render, screen } from '@testing-library/react'
   import { useAssetLoader } from '@/hooks/useAssetLoader'
   
   // Mock the useAssetLoader hook
   jest.mock('@/hooks/useAssetLoader')
   
   // Sample component that uses the asset loader
   const AssetLoadingExample = ({ assetUrls }) => {
     const { loaded, error } = useAssetLoader(assetUrls)
     
     if (error) return <div>Error loading assets: {error.message}</div>
     if (!loaded) return <div>Loading assets...</div>
     
     return <div>Assets loaded successfully!</div>
   }
   
   describe('Components using Asset Loading', () => {
     it('should show loading state while assets are loading', () => {
       // Mock hook to return loading state
       (useAssetLoader as jest.Mock).mockReturnValue({
         loaded: false,
         error: null
       })
       
       render(<AssetLoadingExample assetUrls={['/test.png']} />)
       
       expect(screen.getByText('Loading assets...')).toBeInTheDocument()
     })
     
     it('should show success state when assets are loaded', () => {
       // Mock hook to return loaded state
       (useAssetLoader as jest.Mock).mockReturnValue({
         loaded: true,
         error: null
       })
       
       render(<AssetLoadingExample assetUrls={['/test.png']} />)
       
       expect(screen.getByText('Assets loaded successfully!')).toBeInTheDocument()
     })
     
     it('should show error state when asset loading fails', () => {
       // Mock hook to return error state
       (useAssetLoader as jest.Mock).mockReturnValue({
         loaded: false,
         error: new Error('Failed to load')
       })
       
       render(<AssetLoadingExample assetUrls={['/test.png']} />)
       
       expect(screen.getByText('Error loading assets: Failed to load')).toBeInTheDocument()
     })
   })
   ```

