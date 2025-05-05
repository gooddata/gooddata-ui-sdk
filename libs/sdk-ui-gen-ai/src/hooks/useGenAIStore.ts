// (C) 2024-2025 GoodData Corporation

import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { ChatEventHandler, EventDispatcher } from "../store/events.js";
import { getStore } from "../store/index.js";

export const useGenAIStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    opts: {
        eventHandlers?: ChatEventHandler[];
        colorPalette?: IColorPalette;
    },
) => {
    const { eventHandlers, colorPalette } = opts;
    // Instantiate EventDispatcher. It's a designed to hold a reference to the handlers, so that
    // we don't update the context every time a new array of handlers is passed.
    // Similar to how React handles event listeners.
    const eventDispatcher = React.useMemo(() => new EventDispatcher(), []);

    // Initialize new Redux Store for each instance of GenAI Chat
    // It OK to discard the store when backend or workspace changes
    const store = React.useMemo(() => {
        return getStore(backend, workspace, eventDispatcher, { colorPalette });
    }, [backend, workspace, eventDispatcher, colorPalette]);

    React.useEffect(() => {
        if (eventHandlers) {
            eventDispatcher.setHandlers(eventHandlers);
        }
    }, [eventHandlers, eventDispatcher]);

    return store;
};
