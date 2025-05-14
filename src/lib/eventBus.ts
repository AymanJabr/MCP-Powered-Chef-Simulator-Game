// Define all possible event types to make the Event Bus more type-safe
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

// Define the event callback type
export type EventCallback = (...args: any[]) => void;

// Event data type for logging
export interface EventLogItem {
    event: GameEventType;
    timestamp: number;
    data: any;
}

/**
 * Event Bus for global event management
 * - Allows components to subscribe to events
 * - Broadcasts events to all subscribers
 * - Provides event history for debugging
 * - Returns unsubscribe functions for clean-up
 */
class EventBus {
    // Store event listeners
    private events: Record<string, EventCallback[]> = {};

    // Keep a log of recent events for debugging
    private eventLog: EventLogItem[] = [];
    private maxLogSize: number = 100;

    // Debugging flag
    private debug: boolean = false;

    /**
     * Subscribe to an event
     * @param event The event type to subscribe to
     * @param callback Function to be called when event is emitted
     * @returns Unsubscribe function
     */
    public on(event: GameEventType, callback: EventCallback): () => void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);

            // Remove empty event arrays
            if (this.events[event].length === 0) {
                delete this.events[event];
            }
        };
    }

    /**
     * Subscribe to an event and automatically unsubscribe after the first occurrence
     * @param event The event type to subscribe to
     * @param callback Function to be called when event is emitted
     * @returns Unsubscribe function
     */
    public once(event: GameEventType, callback: EventCallback): () => void {
        const unsubscribe = this.on(event, (...args) => {
            unsubscribe();
            callback(...args);
        });

        return unsubscribe;
    }

    /**
     * Emit an event with data
     * @param event The event type to emit
     * @param args Data to pass to subscribers
     */
    public emit(event: GameEventType, ...args: any[]): void {
        // Log the event
        this.logEvent(event, args);

        if (this.debug) {
            console.debug(`[EventBus] Event emitted: ${event}`, args);
        }

        // Call all subscribers
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`[EventBus] Error in event handler for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Check if an event has subscribers
     * @param event The event type to check
     * @returns Whether the event has subscribers
     */
    public hasListeners(event: GameEventType): boolean {
        return !!this.events[event] && this.events[event].length > 0;
    }

    /**
     * Get the number of subscribers for an event
     * @param event The event type to check
     * @returns The number of subscribers
     */
    public listenerCount(event: GameEventType): number {
        return this.events[event]?.length || 0;
    }

    /**
     * Remove all subscribers for a specific event
     * @param event The event type to clear
     */
    public clearEvent(event: GameEventType): void {
        delete this.events[event];
    }

    /**
     * Remove all subscribers for all events
     */
    public clearAllEvents(): void {
        this.events = {};
    }

    /**
     * Enable or disable debug logging
     */
    public setDebug(enabled: boolean): void {
        this.debug = enabled;
    }

    /**
     * Log an event to the event history
     * @param event The event type
     * @param data The event data
     */
    private logEvent(event: GameEventType, data: any): void {
        this.eventLog.push({
            event,
            timestamp: Date.now(),
            data: data[0] || null, // Only store the first argument for simplicity
        });

        // Limit log size
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }
    }

    /**
     * Get recent event history
     * @param count Number of recent events to retrieve (default: all)
     * @param eventType Filter by event type (optional)
     * @returns Array of event log items
     */
    public getEventHistory(count?: number, eventType?: GameEventType): EventLogItem[] {
        let filteredLog = this.eventLog;

        if (eventType) {
            filteredLog = filteredLog.filter(item => item.event === eventType);
        }

        if (count && count > 0) {
            return filteredLog.slice(-count);
        }

        return filteredLog;
    }

    /**
     * Clear the event history
     */
    public clearEventHistory(): void {
        this.eventLog = [];
    }
}

// Create a singleton instance
export const eventBus = new EventBus(); 