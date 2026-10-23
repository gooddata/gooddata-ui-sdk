// (C) 2021-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useRef } from "react";

import { type Events } from "./events.js";

export interface IEvent {
    action: Events;
    label?: string;
    category?: string;
    value?: number;
    trackId?: string;
    variables?: {
        [key: string]: number;
    };
}

export interface IEventListener {
    (event: IEvent): void;
}

export interface IEventContextType {
    emit: (event: IEvent) => void;
    registerListener: (listener: IEventListener) => () => void;
}

export const EventContext = createContext<IEventContextType>({
    emit: () => {
        /*do nothing*/
    },
    registerListener: () => {
        /*do nothing*/
        return () => {};
    },
});

export function EventContextProvider({
    children,
    listeners: initialListeners = [],
}: {
    listeners?: IEventListener[];
    children: ReactNode;
}) {
    const listeners = useRef<IEventListener[]>(initialListeners);

    const registerListener = useCallback((listener: IEventListener) => {
        listeners.current.push(listener);

        return () => {
            const index = listeners.current.findIndex((l) => l === listener);
            if (index) {
                listeners.current.splice(index, 1);
            }
        };
    }, []);

    const emit = useCallback((event: IEvent) => {
        listeners.current.forEach((listener) => {
            try {
                listener(event);
            } catch {
                /* do nothing */
            }
        });
    }, []);

    return <EventContext.Provider value={{ emit, registerListener }}>{children}</EventContext.Provider>;
}
