// (C) 2024-2025 GoodData Corporation

import { useEffect, useMemo } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { EnhancedStore } from "@reduxjs/toolkit";
import { ChatEventHandler, EventDispatcher } from "../store/events.js";
import { getStore } from "../store/index.js";
import { OptionsDispatcher } from "../store/options.js";
import { setColorPaletteAction } from "../store/chatWindow/chatWindowSlice.js";

export const useGenAIStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    opts: {
        eventHandlers?: ChatEventHandler[];
        colorPalette?: IColorPalette;
    },
): EnhancedStore => {
    const { eventHandlers, colorPalette } = opts;

    // Instantiate EventDispatcher. It's a designed to hold a reference to the handlers, so that
    // we don't update the context every time a new array of handlers is passed.
    // Similar to how React handles event listeners.
    const eventDispatcher = useMemo(() => new EventDispatcher(), []);
    // Instantiate OptionsDispatcher. It's a designed to hold a reference to external options
    const optionsDispatcher = useMemo(() => new OptionsDispatcher(), []);

    // Initialize new Redux Store for each instance of GenAI Chat
    // It OK to discard the store when backend or workspace changes
    const store = useMemo(() => {
        return getStore(backend, workspace, eventDispatcher, optionsDispatcher);
    }, [backend, workspace, eventDispatcher, optionsDispatcher]);

    useEffect(() => {
        if (colorPalette) {
            optionsDispatcher.setColorPalette(colorPalette);
            store.dispatch(
                setColorPaletteAction({
                    colorPalette,
                }),
            );
        }
    }, [colorPalette, optionsDispatcher, store]);

    useEffect(() => {
        if (eventHandlers) {
            eventDispatcher.setHandlers(eventHandlers);
        }
    }, [eventHandlers, eventDispatcher]);

    return store;
};
