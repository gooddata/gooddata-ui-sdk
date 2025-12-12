// (C) 2025 GoodData Corporation

import {
    type KeyboardEvent,
    type PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { EventEmitter } from "./eventEmitter.js";

/**
 * @internal
 */
export type UiTreeViewEvents = {
    keydown: KeyboardEvent;
};

/**
 * @internal
 */
export type UiTreeViewEventType = keyof UiTreeViewEvents;

const EventsContext = createContext<EventEmitter<UiTreeViewEvents> | null>(null);

/**
 * @internal
 */
export function UiTreeViewEventsProvider({ children }: PropsWithChildren) {
    // Only create the emitter once
    const [emitter] = useState(() => new EventEmitter());

    return <EventsContext.Provider value={emitter}>{children}</EventsContext.Provider>;
}

/**
 * @internal
 */
export function useUiTreeViewEventPublisher<T extends UiTreeViewEventType>(eventType: T) {
    const emitter = useContext(EventsContext);
    return useCallback(
        (event: UiTreeViewEvents[T]) => {
            emitter?.emit(eventType, event);
        },
        [eventType, emitter],
    );
}

/**
 * @internal
 */
export function useUiTreeViewEventSubscriber<T extends UiTreeViewEventType>(
    eventType: T,
    handler: (event: UiTreeViewEvents[T]) => void,
) {
    const emitter = useContext(EventsContext);

    useEffect(() => {
        if (!emitter) {
            return undefined;
        }
        emitter.on(eventType, handler);
        return () => {
            emitter.off(eventType, handler);
        };
    }, [emitter, eventType, handler]);
}
