// (C) 2026 GoodData Corporation

/**
 * State of the gate that all outgoing embedding events go through.
 *
 * - `passthrough`: events go to `*` at once. This is the default, so a consumer that never
 *   configures the gate keeps the previous behaviour.
 * - `holding`: events wait in a bounded queue until the parent origin is known.
 * - `open`: events go to the validated parent origin.
 * - `denied`: events are dropped.
 *
 * @internal
 */
export type EventGateState =
    | { type: "passthrough" }
    | { type: "holding" }
    | { type: "open"; targetOrigin: string }
    | { type: "denied" };

/**
 * Sends one message to the parent window with the given target origin.
 *
 * @internal
 */
export type EventSender = (message: unknown, targetOrigin: string) => void;

/**
 * Maximum number of events that the gate holds. When the queue is full, the oldest event is dropped.
 *
 * @internal
 */
export const MAX_HELD_EVENTS = 100;

interface IHeldEvent {
    message: unknown;
    send: EventSender;
}

let state: EventGateState = { type: "passthrough" };
let heldEvents: IHeldEvent[] = [];
let overflowWarned = false;
let eventHeldListener: (() => void) | undefined;

/**
 * Sends the event through the gate.
 *
 * @internal
 */
export function routeEvent(message: unknown, send: EventSender): void {
    switch (state.type) {
        case "passthrough":
            send(message, "*");
            return;
        case "open":
            send(message, state.targetOrigin);
            return;
        case "denied":
            return;
        case "holding":
            if (heldEvents.length >= MAX_HELD_EVENTS) {
                heldEvents.shift();
                if (!overflowWarned) {
                    overflowWarned = true;
                    console.warn(
                        `Embedding: more than ${MAX_HELD_EVENTS} events wait for the validation of the parent origin. The oldest events are dropped.`,
                    );
                }
            }
            heldEvents.push({ message, send });
            eventHeldListener?.();
            return;
    }
}

/**
 * Starts to hold the outgoing events until {@link openEvents} or {@link denyEvents}.
 *
 * @internal
 */
export function holdEvents(): void {
    state = { type: "holding" };
    heldEvents = [];
}

/**
 * Sends the held events and all later events to the target origin. It has no effect when the gate
 * is already open or denied: the first decision stays.
 *
 * @internal
 */
export function openEvents(targetOrigin: string): void {
    if (state.type === "open" || state.type === "denied") {
        return;
    }
    state = { type: "open", targetOrigin };
    const events = heldEvents;
    heldEvents = [];
    events.forEach(({ message, send }) => send(message, targetOrigin));
}

/**
 * Drops the held events and all later events. It has no effect when the gate is already open or
 * denied.
 *
 * @internal
 */
export function denyEvents(): void {
    if (state.type === "open" || state.type === "denied") {
        return;
    }
    state = { type: "denied" };
    heldEvents = [];
    console.warn(
        "Embedding: the parent origin is not in the embedding origins of the organization. No events are sent to the parent.",
    );
}

/**
 * @internal
 */
export function getEventGateState(): EventGateState {
    return state;
}

/**
 * Sets the function that the gate calls each time it holds an event.
 *
 * @internal
 */
export function setEventHeldListener(listener: (() => void) | undefined): void {
    eventHeldListener = listener;
}

/**
 * Puts the gate back to `passthrough` and drops the held events.
 *
 * @internal
 */
export function resetEventGate(): void {
    state = { type: "passthrough" };
    heldEvents = [];
    overflowWarned = false;
    eventHeldListener = undefined;
}
