// (C) 2024 GoodData Corporation

import React from "react";
import { getStore } from "../store/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ChatEventHandler, EventDispatcher } from "../store/events.js";

export const useGenAIStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    eventHandlers?: ChatEventHandler[],
) => {
    // Instantiate EventDispatcher. It's a designed to hold a reference to the handlers, so that
    // we don't update the context every time a new array of handlers is passed.
    // Similar to how React handles event listeners.
    const eventDispatcher = React.useMemo(() => new EventDispatcher(), []);

    // Initialize new Redux Store for each instance of GenAI Chat
    // It OK to discard the store when backend or workspace changes
    const store = React.useMemo(() => {
        return getStore(backend, workspace, eventDispatcher);
    }, [backend, workspace, eventDispatcher]);

    React.useEffect(() => {
        if (eventHandlers) {
            eventDispatcher.setHandlers(eventHandlers);
        }
    }, [eventHandlers, eventDispatcher]);

    return store;
};
