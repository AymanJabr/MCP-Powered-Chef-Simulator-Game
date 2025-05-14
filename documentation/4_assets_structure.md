# Assets Structure for MCP-Powered Chef Simulator

## Directory Organization

```
/public
  /assets
    /images
      /ingredients     # Ingredient sprites
      /dishes          # Completed dish images
      /equipment       # Kitchen equipment images
      /characters      # Customer and staff sprites
      /backgrounds     # Restaurant environment backgrounds
      /animations      # Animation sprite sheets
      /effects         # Visual effects (steam, fire, etc.)
    /audio
      /music           # Background music tracks
      /sfx             # Sound effects for actions
      /ambient         # Ambient restaurant sounds
      /voices          # Customer and staff voice lines
    /data
      /recipes         # Recipe data (JSON)
      /dishes          # Dish information (JSON)
      /ingredients     # Ingredient properties (JSON)
      /equipment       # Equipment specifications (JSON)
      /tutorials       # Tutorial scenarios (JSON)
      /levels          # Difficulty level configurations (JSON)
      /templates       # MCP command templates (JSON)
```

## Asset Types and Usage

### Image Assets

#### Ingredients
- **Format**: PNG with transparent background
- **Sizes**: 
  - Raw: 256x256px
  - Prepared: 256x256px
  - Multiple states (raw, chopped, cooked, etc.)
- **Organization**: Grouped by category (meat, vegetables, dairy, etc.)
- **Naming Convention**: `[category]_[name]_[state].png`
  - Example: `meat_beef_raw.png`, `vegetable_tomato_sliced.png`

#### Dishes
- **Format**: PNG with transparent background
- **Sizes**: 512x512px
- **Organization**: Grouped by type (appetizer, main, dessert)
- **Naming Convention**: `[category]_[dish_name].png`
  - Example: `main_burger.png`, `dessert_cheesecake.png`
- **Variations**: Multiple quality versions (perfect, good, average, poor)

#### Equipment
- **Format**: PNG with transparent background
- **Sizes**: Various, proportional to real-world sizes
- **Organization**: Grouped by function (cooking, preparation, storage)
- **Naming Convention**: `[category]_[equipment_name]_[state].png`
  - Example: `cooking_stove_idle.png`, `cooking_stove_active.png`
- **States**: Multiple states (idle, active, broken)

#### Characters
- **Format**: PNG sprite sheets
- **Sizes**: 512x512px per frame
- **Organization**: Grouped by character type
- **Naming Convention**: `[type]_[id]_[action].png`
  - Example: `customer_01_waiting.png`, `customer_01_happy.png`
- **Animations**: Walking, waiting, eating, reacting

#### UI Elements
- **Format**: SVG and PNG (with transparent backgrounds)
- **Sizes**: Various, optimized for responsive layout
- **Organization**: Grouped by function (buttons, panels, indicators)
- **Naming Convention**: `ui_[category]_[name]_[state].svg`
  - Example: `ui_button_cook_normal.svg`, `ui_button_cook_hover.svg`

### Audio Assets

#### Sound Effects
- **Format**: MP3 and WAV
- **Duration**: Short (0.5-3 seconds)
- **Organization**: Grouped by action type
- **Naming Convention**: `sfx_[category]_[action].mp3`
  - Example: `sfx_cooking_sizzle.mp3`, `sfx_prep_chop.mp3`

#### Music
- **Format**: MP3
- **Duration**: 2-5 minutes, loopable
- **Organization**: Grouped by mood/intensity
- **Naming Convention**: `music_[mood]_[intensity].mp3`
  - Example: `music_upbeat_medium.mp3`, `music_tense_high.mp3`

#### Ambient Sounds
- **Format**: MP3
- **Duration**: 30-60 seconds, loopable
- **Organization**: Grouped by location
- **Naming Convention**: `ambient_[location]_[time].mp3`
  - Example: `ambient_kitchen_busy.mp3`, `ambient_dining_quiet.mp3`

### Data Assets

#### Recipe Data
- **Format**: JSON
- **Structure**:
```json
{
  "id": "recipe_001",
  "name": "Classic Burger",
  "category": "main",
  "difficulty": 2,
  "baseTime": 180,
  "basePrice": 12.99,
  "ingredients": [
    {
      "id": "ingredient_beef_patty",
      "quantity": 1,
      "preparation": "grill",
      "cookingTime": 120
    },
    {
      "id": "ingredient_bun",
      "quantity": 1,
      "preparation": "toast",
      "cookingTime": 30
    },
    // More ingredients...
  ],
  "steps": [
    {
      "order": 1,
      "description": "Grill beef patty until medium",
      "equipment": "grill",
      "duration": 120,
      "qualityFactors": ["temperature", "timing"]
    },
    // More steps...
  ],
  "plating": {
    "baseLayer": "ingredient_bun_bottom",
    "layers": [
      "ingredient_lettuce",
      "ingredient_beef_patty",
      "ingredient_cheese",
      "ingredient_tomato"
    ],
    "topLayer": "ingredient_bun_top",
    "garnish": "ingredient_pickle",
    "sauce": "ingredient_ketchup"
  }
}
```

#### Ingredient Data
- **Format**: JSON
- **Structure**:
```json
{
  "id": "ingredient_beef_patty",
  "name": "Beef Patty",
  "category": "meat",
  "unitCost": 2.50,
  "unitQuantity": 1,
  "storageLife": 1440, // minutes
  "preparationMethods": [
    {
      "method": "grill",
      "duration": 120,
      "equipment": "grill",
      "states": ["raw", "rare", "medium", "well_done", "burnt"]
    }
  ],
  "nutritionalValue": 500,
  "allergens": ["beef"],
  "imageRaw": "meat_beef_patty_raw.png",
  "imageCooked": "meat_beef_patty_cooked.png"
}
```

## Asset Loading Strategy

### Preloading
- Essential UI elements
- Common ingredients and equipment
- Main menu assets
- Core sound effects

### Dynamic Loading
- Level-specific assets loaded during level transition
- Recipe-specific ingredients loaded when order is placed
- Higher difficulty dishes loaded as game progresses

### Asset Caching
- Recently used assets kept in memory
- Frequently used assets prioritized in cache
- Least recently used assets unloaded when memory pressure increases

## Animation System

### Character Animations
- Sprite-based animations for customers and staff
- States: idle, walking, eating, reacting, leaving
- Emotion overlays for satisfaction levels

### Cooking Animations
- Equipment state changes
- Food transformation animations
- Particle effects for cooking actions (steam, sizzle, etc.)

### UI Animations
- Button state transitions
- Panel opening/closing
- Notification appearances
- Progress indicators

## Responsive Asset Strategy

### Different Device Resolutions
- High-resolution assets for desktop
- Medium-resolution assets for tablets
- Lower-resolution assets for mobile
- Dynamic asset selection based on device capabilities

### Performance Optimization
- Texture atlases for related sprites
- Asset compression for web delivery
- SVG for UI that needs to scale
- Lazy loading for non-critical assets 