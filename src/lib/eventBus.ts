// Define all possible event types to make the Event Bus more type-safe
import { GameEventType, EventPayload } from '@/types/models';

// Define the event callback type
export type EventCallback<T extends GameEventType = GameEventType> = (data: EventPayload[T]) => void;

// Event data type for logging
export interface EventLogItem {
    event: GameEventType;
    timestamp: number;
    data: EventPayload[GameEventType];
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
    public on<T extends GameEventType>(event: T, callback: EventCallback<T>): () => void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback as EventCallback);

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
    public once<T extends GameEventType>(event: T, callback: EventCallback<T>): () => void {
        const unsubscribe = this.on(event, (data) => {
            unsubscribe();
            callback(data);
        });

        return unsubscribe;
    }

    /**
     * Emit an event with data
     * @param event The event type to emit
     * @param data Data to pass to subscribers
     */
    public emit<T extends GameEventType>(event: T, data: EventPayload[T]): void {
        // Log the event
        this.logEvent(event, data);

        if (this.debug) {
            console.debug(`[EventBus] Event emitted: ${event}`, data);
        }

        // Call all subscribers
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
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
    private logEvent<T extends GameEventType>(event: T, data: EventPayload[T]): void {
        this.eventLog.push({
            event,
            timestamp: Date.now(),
            data
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