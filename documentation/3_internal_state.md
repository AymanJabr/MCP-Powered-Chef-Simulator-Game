# Internal State Management for MCP-Powered Chef Simulator

## Global Game State

### GameController
- **Properties**:
  - `gameMode`: Manual or MCP-assisted
  - `difficulty`: Current difficulty level
  - `timeElapsed`: Total game time
  - `isPaused`: Game pause status
  - `gamePhase`: Tutorial, preGame, active game, game over
  - `performanceMetrics`: Object tracking all performance data
  - `settings`: Game configuration options

### GameSession
- **Properties**:
  - `sessionId`: Unique identifier for the play session
  - `startTime`: When the session began
  - `endTime`: When the session ended (null if active)
  - `finalScore`: Final score (null if active)
  - `performanceHistory`: Array of performance snapshots
  - `difficultyProgression`: Record of difficulty changes

## Restaurant State

### RestaurantState
- **Properties**:
  - `name`: Restaurant name
  - `level`: Current restaurant level
  - `reputation`: Reputation score (affects customer patience and tips)
  - `funds`: Available money
  - `customerCapacity`: Maximum number of customers
  - `activeCustomers`: Currently seated customers
  - `customerQueue`: Waiting customers

### InventoryState
- **Properties**:
  - `ingredients`: Map of ingredient ID to quantity/quality
  - `equipment`: Map of equipment ID to status/condition
  - `autoRestock`: Items set for automatic reordering

### OrderQueue
- **Properties**:
  - `pendingOrders`: Orders waiting to be prepared
  - `inProgressOrders`: Orders currently being prepared
  - `completedOrders`: Orders ready to serve
  - `servedOrders`: Orders delivered to customers
  - `cancelledOrders`: Orders cancelled or failed
  - `orderHistory`: Record of all processed orders

## Cooking State

### KitchenState
- **Properties**:
  - `activeCookingProcesses`: Currently running cooking actions
  - `availableEquipment`: Equipment ready for use
  - `inUseEquipment`: Equipment currently being used
  - `preparedIngredients`: Ingredients ready for cooking
  - `workstations`: Status of different kitchen stations
  - `cookingQueue`: Scheduled cooking actions

### DishPreparationState
- **Properties**:
  - `currentDish`: Dish being prepared
  - `completedSteps`: Steps finished for current dish
  - `remainingSteps`: Steps still needed for current dish
  - `preparationQuality`: Current quality metrics
  - `activePreparationActions`: Current preparation actions

### PlatingState
- **Properties**:
  - `availablePlates`: Types and quantities of plates
  - `currentlyPlating`: Dishes being plated
  - `plateQueue`: Dishes waiting to be plated
  - `plateStorage`: Completed plates waiting for service
  - `garnishInventory`: Available garnishes
  - `sauceInventory`: Available sauces

## Player State

### PlayerState
- **Properties**:
  - `position`: Current location in the restaurant
  - `currentAction`: What the player is currently doing
  - `actionQueue`: Queued player actions
  - `actionHistory`: Recently performed actions
  - `skillLevel`: Proficiency in different cooking tasks

### MCPState
- **Properties**:
  - `isActive`: Whether MCP assistance is enabled
  - `currentCommand`: Command being processed
  - `commandHistory`: Previously executed commands
  - `savedCommands`: User-saved command templates
  - `suggestedCommands`: fixed suggested commands
  - `currentTask`: Task MCP is currently performing
  - `performanceMetrics`: Effectiveness measurements

## State Change Management

### Action Queue
- **System for**:
  - Tracking pending actions
  - Prioritizing critical actions
  - Cancelling or modifying queued actions
  - Handling action dependencies

### Event System
- **System for**:
  - Broadcasting state changes
  - Subscribing components to relevant events
  - Triggering reactions to game events
  - Logging significant events for analysis

## Performance Metrics Tracking

### MetricsCollector
- **Tracks**:
  - Customer satisfaction
  - Order completion time
  - Food quality
  - Financial performance
  - Efficiency comparisons (manual vs. MCP)
  - Error rates