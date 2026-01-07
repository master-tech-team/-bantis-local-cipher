import type { StorageEventType, StorageEventData, EventListener } from '../types';

/**
 * Simple event emitter for storage events
 */
export class EventEmitter {
    private listeners: Map<StorageEventType, Set<EventListener>> = new Map();
    private onceListeners: Map<StorageEventType, Set<EventListener>> = new Map();

    /**
     * Register an event listener
     */
    on(event: StorageEventType, listener: EventListener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    /**
     * Register a one-time event listener
     */
    once(event: StorageEventType, listener: EventListener): void {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event)!.add(listener);
    }

    /**
     * Remove an event listener
     */
    off(event: StorageEventType, listener: EventListener): void {
        this.listeners.get(event)?.delete(listener);
        this.onceListeners.get(event)?.delete(listener);
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: StorageEventType): void {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * Emit an event
     */
    emit(event: StorageEventType, data: Omit<StorageEventData, 'type' | 'timestamp'>): void {
        const eventData: StorageEventData = {
            type: event,
            timestamp: Date.now(),
            ...data,
        };

        // Call regular listeners
        this.listeners.get(event)?.forEach(listener => {
            try {
                listener(eventData);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });

        // Call and remove once listeners
        const onceSet = this.onceListeners.get(event);
        if (onceSet) {
            onceSet.forEach(listener => {
                try {
                    listener(eventData);
                } catch (error) {
                    console.error(`Error in once listener for ${event}:`, error);
                }
            });
            this.onceListeners.delete(event);
        }
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event: StorageEventType): number {
        const regularCount = this.listeners.get(event)?.size ?? 0;
        const onceCount = this.onceListeners.get(event)?.size ?? 0;
        return regularCount + onceCount;
    }

    /**
     * Get all event types with listeners
     */
    eventNames(): StorageEventType[] {
        const events = new Set<StorageEventType>();
        this.listeners.forEach((_, event) => events.add(event));
        this.onceListeners.forEach((_, event) => events.add(event));
        return Array.from(events);
    }
}
