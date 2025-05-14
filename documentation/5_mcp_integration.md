# MCP Integration for Chef Simulator

## Overview

The Model Context Protocol (MCP) integration enables an LLM assistant to perform the same actions as human players within the Chef Simulator game. This document outlines how the MCP server will be implemented, what resources and tools will be exposed, and how the MCP-powered assistant will interact with the game state.

## Architecture

```
┌───────────────────┐        ┌───────────────────┐
│                   │        │                   │
│  Next.js Frontend │◄─────►│  MCP Client       │
│  (Game UI)        │        │  (Browser-based)  │
│                   │        │                   │
└───────────────────┘        └─────────┬─────────┘
         ▲                             │
         │                             │
         │                             ▼
┌────────┴────────┐        ┌───────────────────┐
│                 │        │                   │
│  Game Logic     │◄─────►│  MCP Server       │
│  (State Manager)│        │  (Local)         │
│                 │        │                   │
└─────────────────┘        └───────────────────┘
```

### MCP Server Implementation

The MCP server will be implemented as a local server running alongside the Next.js application. It will:

1. Register as an MCP server with the client
2. Expose the game's resources, tools, and prompts
3. Process commands from the LLM and translate them into game actions
4. Provide real-time updates on game state changes

### MCP Client Integration

The MCP client will be browser-based and integrated directly into the game UI. Players can:

1. Initially select between manual and MCP-assisted gameplay
2. Interact with the LLM through natural language commands
3. Save and recall frequently used commands
4. View the LLM's previous actions, and current actions.

## MCP Resources

The following resources will be exposed to the LLM through the MCP server:

### Restaurant State
- Current funds
- Active customers and their status
- Queue length and composition
- Current orders and their status

### Kitchen Resources
- Available ingredients and quantities
- Equipment status and availability
- Current cooking processes
- Prepared and plated dishes

### Recipe Information
- Available recipes and their requirements
- Cooking steps and timing information
- Plating instructions
- Quality criteria

### Performance Metrics
- Customer satisfaction ratings
- Order completion times
- Financial performance
- Comparison with manual performance

## MCP Tools

The LLM will have access to the following tools, mirroring player capabilities:

### Customer Management
```json
{
  "tool_name": "greet_customer",
  "description": "Greet a new customer and show them to a table",
  "parameters": {
    "customer_id": "ID of the customer to greet",
    "table_id": "ID of the table to seat the customer at"
  }
}
```

### Order Management
```json
{
  "tool_name": "take_order",
  "description": "Take an order from a customer",
  "parameters": {
    "customer_id": "ID of the customer placing the order"
  }
}

{
  "tool_name": "serve_order",
  "description": "Serve a completed dish to a customer",
  "parameters": {
    "order_id": "ID of the completed order",
    "customer_id": "ID of the customer to serve"
  }
}
```

### Ingredient Preparation
```json
{
  "tool_name": "prepare_ingredient",
  "description": "Prepare an ingredient for cooking",
  "parameters": {
    "ingredient_id": "ID of the ingredient to prepare",
    "preparation_method": "Method to use (chop, dice, mince, etc.)",
    "quantity": "Amount to prepare"
  }
}
```

### Cooking Actions
```json
{
  "tool_name": "cook_ingredient",
  "description": "Cook an ingredient using specified equipment",
  "parameters": {
    "ingredient_id": "ID of the ingredient to cook",
    "equipment_id": "ID of the equipment to use",
    "cooking_method": "Method to use (fry, grill, bake, etc.)",
    "duration": "How long to cook (in seconds)"
  }
}
```

### Plating Actions
```json
{
  "tool_name": "plate_dish",
  "description": "Arrange cooked ingredients on a plate",
  "parameters": {
    "dish_id": "ID of the dish to plate",
    "ingredients": "Array of prepared ingredient IDs in stacking order",
    "garnish_id": "ID of garnish to add (optional)",
    "sauce_id": "ID of sauce to add (optional)"
  }
}
```

### Inventory Management
```json
{
  "tool_name": "purchase_ingredients",
  "description": "Purchase additional ingredients",
  "parameters": {
    "ingredient_id": "ID of the ingredient to purchase",
    "quantity": "Amount to purchase"
  }
}
```


## Command Management

Players can save and manage commands for quick access:

### Default Commands
- "Take orders from all waiting customers"
- "Prepare ingredients for all pending orders"
- "Cook all prepared ingredients"
- "Plate all completed dishes"
- "Serve all plated dishes"
- "Restock low ingredients"

### Custom Command Storage example
```json
{
  "command_id": "custom_command_001",
  "name": "Rush Hour Protocol",
  "command_text": "Focus on quick dishes first. Take all orders, then prepare and cook in batches of similar ingredients to maximize efficiency.",
  "tags": ["busy", "efficiency", "batching"]
}
```

## Implementation Notes

### MCP Server Setup
- The MCP server will be implemented using the MCP TypeScript SDK
- It will run as a local server on the same machine as the game
- Communication with the game state will be through a well-defined API

### LLM Integration
- The game will support connection to various LLM providers
- Players can use their preferred LLM (like Claude or GPT)
- Players can choose between different models and find the one they like best that balances speed with performance.
- LLM context will include game state, available actions, and current goals

## Security Considerations

- The MCP server will only have access to game-related actions
- No sensitive user data will be exposed to the LLM
- All MCP commands will be validated before execution
- Rate limiting will be implemented to prevent command flooding 