# Core Functionalities for MCP-Powered Chef Simulator

## Game Mechanics

### Restaurant Management
- **Customer Generation**
  - Generate customers with varying preferences and patience
  - Control the rate of customer arrival based on difficulty level
  - Manage the queue when restaurant reaches capacity, if queue is full, no new customers will enter

- **Inventory Management**
  - Purchase ingredients and equipment
  - Track ingredient quantities
  - Track equipment status

- **Finance System**
  - Track income from orders with tips for each customer
  - Track expenses from equipment breaking down

### Cooking System

- **Ingredient Preparation**
  - Select ingredients from inventory
  - Apply preparation methods (chop, dice, mince, etc.)
  - Combine ingredients
  - Manage preparation quality

- **Cooking Processes**
  - Multiple cooking methods (fry, grill, bake, boil, etc.)
  - Equipment selection for appropriate cooking method
  - Timing mechanics (undercooking/overcooking affects quality)
  - Temperature control
  - Manage multiple cooking processes simultaneously

- **Plating System**
  - Arrange food on plates
  - Add garnishes and sauces
  - Evaluate visual presentation
  - Timing impact on food temperature/quality

- **Order Fulfillment**
  - Match completed dishes to customer orders
  - Track order accuracy
  - Serve dishes to correct customers
  - Receive feedback based on quality, accuracy, and timing

### Difficulty Progression

- **Time Management**
  - Increase customer arrival rate over time
  - Decrease customer patience as difficulty increases
  - Enforce time limits on certain actions
  - Track total play time

- **Complexity Scaling**
  - Introduce more complex dishes at higher levels
  - Add special requests and customizations
  - Introduce equipment failures and emergencies

### Player Interface

- **Manual Controls**
  - Click/drag interface for ingredient selection
  - Button controls for cooking actions
  - Visual indicators for cooking progress
  - Inventory and order management screens

- **MCP Controls**
  - Command parsing for LLM instructions
  - Visual feedback for MCP-executed actions
  - Command history and favorites system of previous commands given to the LLM

## Performance Tracking

- **Metrics Collection**
  - Order completion time
  - Customer satisfaction scores
  - Financial performance
  - Efficiency metrics

- **Comparative Analysis**
  - Compare manual vs. MCP-assisted performance with highscores for each category
  - Highlight efficiency gains from MCP usage

## AI Integration

- **MCP Command Processing**
  - Parse natural language commands
  - Map commands to game actions
  - Handle ambiguous or incomplete commands
  - Provide feedback on command execution

- **Command Management**
  - Save frequently used commands

## Game State Management

- **Game ending system**
  - The game ends if the user has negative cash on hand
  - The game ends if more than 10 total customers leave the resturant

- **Save/Load System**
  - Record performance history highscores in local storage
  - Export/Import performance data

- **Tutorial System**
  - Simple introduction to game mechanics
  - Separate tutorials for manual and MCP modes as there are separate controls