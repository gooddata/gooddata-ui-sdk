// (C) 2025 GoodData Corporation

type EventHandler<T> = (event: T) => void;

/**
 * A simple strongly-typed event emitter.
 *
 * @internal
 *
 * @example
 * ```
 * type MyEvents = {
 *   keydown: KeyboardEvent;
 * };
 * const emitter = new EventEmitter<MyEvents>();
 * emitter.on("keydown", (event) => { ... });
 * emitter.emit("keydown", event);
 * ```
 */
export class EventEmitter<Events extends Record<string, unknown>> {
    private listeners: { [K in keyof Events]?: Set<EventHandler<Events[K]>> } = Object.create(null);

    /**
     * Register an event handler for a specific event.
     */
    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(handler);
    }

    /**
     * Remove a previously registered event handler.
     */
    off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        this.listeners[event]?.delete(handler);
        if (this.listeners[event]?.size === 0) {
            delete this.listeners[event];
        }
    }

    /**
     * Emit an event, calling all registered handlers with the provided data.
     */
    emit<K extends keyof Events>(event: K, data: Events[K]): void {
        this.listeners[event]?.forEach((handler) => handler(data));
    }
}
