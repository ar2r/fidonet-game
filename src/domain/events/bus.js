/**
 * Event Bus - Central event dispatcher for domain events
 * Implements publish-subscribe pattern for decoupling components
 */

class EventBus {
    constructor() {
        this.subscribers = new Map(); // eventType -> Set of callbacks
    }

    /**
     * Subscribe to an event
     * @param {string} eventType - Event type to subscribe to
     * @param {Function} callback - Callback function (event) => void
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }

        this.subscribers.get(eventType).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(eventType);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(eventType);
                }
            }
        };
    }

    /**
     * Publish an event to all subscribers
     * @param {string} eventType - Event type
     * @param {Object} payload - Event payload
     */
    publish(eventType, payload = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            ...payload,
        };

        const callbacks = this.subscribers.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`Error in event handler for ${eventType}:`, error);
                }
            });
        }

        // Also notify wildcard subscribers (*)
        const wildcardCallbacks = this.subscribers.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`Error in wildcard event handler for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Subscribe to multiple events at once
     * @param {string[]} eventTypes - Array of event types
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function that removes all subscriptions
     */
    subscribeMultiple(eventTypes, callback) {
        const unsubscribes = eventTypes.map(type => this.subscribe(type, callback));

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }

    /**
     * Clear all subscribers (useful for testing)
     */
    clear() {
        this.subscribers.clear();
    }

    /**
     * Get count of subscribers for an event type
     * @param {string} eventType
     * @returns {number}
     */
    getSubscriberCount(eventType) {
        const callbacks = this.subscribers.get(eventType);
        return callbacks ? callbacks.size : 0;
    }

    /**
     * Get all registered event types
     * @returns {string[]}
     */
    getEventTypes() {
        return Array.from(this.subscribers.keys());
    }
}

// Export singleton instance
export const eventBus = new EventBus();

// Also export class for testing
export { EventBus };
