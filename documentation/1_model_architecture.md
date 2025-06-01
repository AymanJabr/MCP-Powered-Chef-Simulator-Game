# Model Architecture for MCP-Powered Chef Simulator

## Game Entities

### Restaurant
- **Properties**:
  - `level`: Current difficulty level // Note: Game.difficulty is the primary driver now
  - `customers`: Array of active customers
  - `queue`: Queue of waiting customers
  - `money`: Current funds
  - `inventory`: Available ingredients and supplies
  - `equipment`: Available cooking equipment
  - `menuItems`: List of all possible dishes the restaurant *could* offer.

### Customer
- **Properties**:
  - `id`: Unique identifier
  - `order`: The dish ordered
  - `patience`: How long they'll wait before leaving (decreases over time)
  - `arrivalTime`: When they entered the restaurant
  - `status`: Current state (waiting, served, left)
  - `satisfaction`: How happy they are with the service
  - `tip`: Additional money given based on satisfaction

### Order
- **Properties**:
  - `id`: Unique identifier
  - `dish`: Reference to the ordered dish
  - `customizations`: Any special requests
  - `status`: Current state (received, cooking, plated, served)
  - `startTime`: When order was placed
  - `completionTime`: When order was served
  - `qualityScore`: How well the dish was prepared

### Dish
- **Properties**:
  - `id`: Unique identifier
  - `name`: Name of the dish
  - `recipe`: List of required ingredients and cooking steps (refers to Recipe model via recipeId)
  - `basePrice`: Standard price of the dish without tips
  - `cookingDifficulty`: Determines availability based on game difficulty.

### Ingredient
- **Properties**:
  - `id`: Unique identifier
  - `name`: Name of the ingredient
  - `category`: Type of ingredient (meat, vegetable, sauce, etc.)
  - `quality`: Affects dish quality
  - `quantity`: Available amount
  - `cost`: Price to restock

### CookingAction
- **Properties**:
  - `type`: Type of action (chop, fry, boil, etc.)
  - `duration`: Time required to complete
  - `skill`: Difficulty level
  - `ingredient`: Target ingredient
  - `equipment`: Required equipment
  - `status`: Current state (not started, in progress, completed)

### Equipment
- **Properties**:
  - `id`: Unique identifier
  - `name`: Name of the equipment
  - `status`: Current state (idle, in use, broken)
  - `capacity`: How many items it can process at once
  - `efficiency`: Affects cooking speed
  - `reliability`: Likelihood of breaking down

### Player
- **Properties**:
  - `id`: Unique identifier
  - `name`: Player name
  - `score`: Current game score
  - `speed`: Action speed multiplier
  - `skill`: Affects success rate of cooking actions
  - `currentAction`: What they're currently doing
  - `savedCommands`: Frequently used MCP commands

### MCPAssistant
- **Properties**:
  - `active`: Whether MCP is enabled
  - `commands`: Available function calls
  - `currentTask`: What it's currently doing
  - `performanceStats`: How much it's helping
  - `savedCommands`: Stored quick commands

## Relationships

- Restaurant has many Customers
- Customers place Orders
- Orders contain one Dish
- Dishes require multiple Ingredients
- Dishes require multiple CookingActions
- CookingActions require specific Equipment
- Player interacts with all entities
- MCPAssistant can execute the same actions as Player

## State Flow

1. Customers arrive and join queue
2. Customers place orders (for dishes available at current game difficulty)
3. Player/MCP prepares ingredients
4. Player/MCP performs cooking actions
5. Player/MCP plates the dish
6. Player/MCP serves the customer
7. Customer pays and provides satisfaction rating
8. Cycle repeats with increasing difficulty

## Dish Availability (New Section)
Dish availability is now determined dynamically based on the current game difficulty (managed in `Game.difficulty` from `gameStore.ts`).
- Each `Dish` has a `cookingDifficulty` property.
- A helper function, `calculateMaxOrderableDifficulty(gameDifficulty)`, determines the maximum `cookingDifficulty` a dish can have to be orderable at the current `gameDifficulty`.
- Customers can only order dishes where `Dish.cookingDifficulty <= calculateMaxOrderableDifficulty(Game.difficulty)`.
- The `Restaurant.menuItems` array in `restaurantStore.ts` now holds *all* dishes loaded from `dishes.json`, and filtering for availability happens at the point of order creation or when presenting menu options to the player/customer AI.