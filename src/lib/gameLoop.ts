import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { usePlayerStore } from '@/state/player/playerStore'
import { eventBus } from './eventBus'
import { createCustomer } from './entityFactories'
import { Game } from '@/types/models'

// ---------------------------------------------------------------------------
// Dish Availability Logic (moved from gameLogic.ts)
// ---------------------------------------------------------------------------
// TODO: This mapping might need to be more sophisticated based on game balance.
// For now, it's a simple mapping: max orderable difficulty = game difficulty level + 1,
// capped at a max of 20 for example.
const MAX_POSSIBLE_COOKING_DIFFICULTY = 5;

export const calculateMaxOrderableDifficulty = (gameDifficulty: Game['difficulty']): number => {
    return Math.min(MAX_POSSIBLE_COOKING_DIFFICULTY, gameDifficulty + 1);
};

// ---------------------------------------------------------------------------
// Core Game Loop
// ---------------------------------------------------------------------------
// This game loop drives the entire simulation by running once per animation
// frame (≈60fps).  Each tick we:
//   1. Advance in-game time & difficulty.
//   2. Update customers (patience ↓ / arrivals).
//   3. Advance player actions.
//   4. *Placeholder* – advance cooking, plating and MCP actions.
//   5. Check ending conditions.
//
// NOTE
// ----
// • Helper functions live inside this module to keep cross-file dependencies
//   minimal.  They can be moved out later if they grow large.
// • Where future systems are required we add //TODO: markers so that TypeScript
//   still compiles today.
// ---------------------------------------------------------------------------

let animationFrameId: number | null = null
let lastTimestamp = 0
let customersLeftCounter = 0 // running total used for game-over rule

const SEC = 1000

// Helper function to spawn the very first customer
function spawnInitialCustomer(): void {
    const newCustomer = createCustomer();
    // Directly use the store action to add to queue
    useRestaurantStore.getState().actions.addCustomerToQueue(newCustomer);
    eventBus.emit('customer_arrived', { customer: newCustomer });
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------
export function startGameLoop(): void {
    if (animationFrameId !== null) return // already running

    customersLeftCounter = 0
    lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now()

    // Spawn one customer immediately when the game starts
    spawnInitialCustomer();

    const gameDifficulty = useGameStore.getState().game.difficulty;
    eventBus.emit('game_started', { difficulty: gameDifficulty });
    animationFrameId = requestAnimationFrame(gameLoop)
}

export function stopGameLoop(): void {
    if (animationFrameId === null) return

    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    const elapsedTime = useGameStore.getState().game.timeElapsed;
    eventBus.emit('game_paused', { elapsedTime: elapsedTime });
}

export function isGameLoopRunning(): boolean {
    return animationFrameId !== null
}

export function resetCustomersLeftCounter(): void {
    customersLeftCounter = 0
}

// ---------------------------------------------------------------------------
// Frame handler
// ---------------------------------------------------------------------------
function gameLoop(timestamp: number): void {
    const deltaMs = timestamp - lastTimestamp
    const deltaSeconds = deltaMs / SEC
    lastTimestamp = timestamp

    // Grab current game info (we purposefully snapshot once per frame)
    const gameStoreState = useGameStore.getState()

    if (!gameStoreState.game.isPaused && gameStoreState.game.gamePhase === 'active') {
        // 1. Advance time (this will also gently raise difficulty)
        gameStoreState.actions.increaseTime(deltaSeconds)

        // 2. Customers
        processCustomerPatience(deltaSeconds)
        generateNewCustomers(deltaSeconds)

        // 3. Player-controlled actions
        processPlayerActions()

        // 4. Cooking / Plating / MCP assistant
        // TODO: integrate cooking, plating, inventory & MCP action processing

        // 5. End-game checks
        checkGameEndingConditions()

        // Broadcast frame update for interested subscribers (UI etc.)
        eventBus.emit('frameUpdate', { deltaTime: deltaSeconds });
    }

    // Queue next frame
    animationFrameId = requestAnimationFrame(gameLoop)
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
function processCustomerPatience(deltaSeconds: number): void {
    const gameDifficulty = useGameStore.getState().game.difficulty;
    // Get the current state and actions from the store
    const { restaurant } = useRestaurantStore.getState();

    const queueDecay = 1 + gameDifficulty * 0.3; // waiting line loses patience quick
    const seatedDecay = 0.5 + gameDifficulty * 0.15; // seated customers, slower

    const leftCustomerIds: string[] = [];
    const customersToUpdate: { customerId: string; newPatience: number; isQueued: boolean }[] = [];

    // Identify customers whose patience needs updating or who are leaving from queue
    restaurant.customerQueue.forEach(customer => {
        const newPatience = customer.patience - queueDecay * deltaSeconds;
        if (newPatience <= 0) {
            leftCustomerIds.push(customer.id);
        } else {
            customersToUpdate.push({ customerId: customer.id, newPatience, isQueued: true });
        }
    });

    // Identify customers whose patience needs updating or who are leaving from active customers
    restaurant.activeCustomers.forEach(customer => {
        const newPatience = customer.patience - seatedDecay * deltaSeconds;
        if (newPatience <= 0) {
            leftCustomerIds.push(customer.id);
        } else {
            customersToUpdate.push({ customerId: customer.id, newPatience, isQueued: false });
        }
    });

    // Batch update the store if there are any changes
    if (customersToUpdate.length > 0 || leftCustomerIds.length > 0) {
        useRestaurantStore.setState(state => {
            customersToUpdate.forEach(update => {
                const customerArray = update.isQueued ? state.restaurant.customerQueue : state.restaurant.activeCustomers;
                const customer = customerArray.find(c => c.id === update.customerId);
                if (customer) {
                    customer.patience = update.newPatience; // This is fine inside setState with immer
                }
            });

            leftCustomerIds.forEach(customerId => {
                const wasInQueue = state.restaurant.customerQueue.some(c => c.id === customerId);
                if (wasInQueue) {
                    state.restaurant.customerQueue = state.restaurant.customerQueue.filter(c => c.id !== customerId);
                } else {
                    state.restaurant.activeCustomers = state.restaurant.activeCustomers.filter(c => c.id !== customerId);
                }

                // Find satisfaction for the event, it might be stale if customer was already removed by patience update
                const originalCustomer = restaurant.customerQueue.find(c => c.id === customerId) || restaurant.activeCustomers.find(c => c.id === customerId);
                const satisfaction = originalCustomer ? originalCustomer.satisfaction : 0; // Default if not found (should not happen)

                customersLeftCounter += 1;
                eventBus.emit('customer_left', { customerId: customerId, satisfaction });
            });
        });
    }
}

function shouldSpawnCustomer(deltaSeconds: number): boolean {
    const { game } = useGameStore.getState()
    const restaurant = useRestaurantStore.getState().restaurant

    // Limit queue length to prevent memory explosion
    if (restaurant.customerQueue.length >= 15) return false

    // Base spawn probability grows with difficulty
    const probabilityPerSecond = 0.05 + game.difficulty * 0.04
    return Math.random() < probabilityPerSecond * deltaSeconds
}

function generateNewCustomers(deltaSeconds: number): void {
    if (!shouldSpawnCustomer(deltaSeconds)) return

    const newCustomer = createCustomer()
    const restaurant = useRestaurantStore.getState()
    restaurant.actions.addCustomerToQueue(newCustomer)

    // Emit 'customer_arrived' with the full customer object
    eventBus.emit('customer_arrived', { customer: newCustomer });
}

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------
function processPlayerActions(): void {
    const playerState = usePlayerStore.getState()
    const { player, actions } = playerState

    if (!player.currentAction) return

    const now = Date.now()
    const effectiveDuration = player.currentAction.duration / player.speed
    if (now - player.currentAction.startTime >= effectiveDuration) {
        actions.completeAction(player.currentAction.id, true)
        eventBus.emit('player_action_completed', { actionId: player.currentAction.id })
    }
}

// ---------------------------------------------------------------------------
// Ending conditions
// ---------------------------------------------------------------------------
function checkGameEndingConditions(): void {
    const restaurant = useRestaurantStore.getState().restaurant
    const gameStoreState = useGameStore.getState()

    const fundsDepleted = restaurant.funds < 0
    const tooManyLeft = customersLeftCounter > 10

    if (fundsDepleted || tooManyLeft) {
        const reasonText = fundsDepleted ? 'Funds depleted' : 'Too many customers left';
        // For score, using restaurant.funds directly for now. This might need refinement.
        const score = restaurant.funds;

        gameStoreState.actions.setGamePhase('gameOver')
        eventBus.emit('game_over', {
            reason: reasonText,
            score: score
        })
        stopGameLoop()
    }
} 