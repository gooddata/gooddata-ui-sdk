// (C) 2024-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type EnhancedStore } from "@reduxjs/toolkit";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";

import {
    setColorPaletteAction,
    setObjectTypesAction,
    setSettingsAction,
    setTagsAction,
} from "../store/chatWindow/chatWindowSlice.js";
import { type ChatEventHandler, EventDispatcher } from "../store/events.js";
import { OptionsDispatcher } from "../store/options.js";
import { getStore } from "../store/store.js";

export const useGenAIStore = (
    backend: IAnalyticalBackend,
    workspace: string,
    opts: {
        eventHandlers?: ChatEventHandler[];
        colorPalette?: IColorPalette;
        settings?: IUserWorkspaceSettings;
        objectTypes?: GenAIObjectType[];
        includeTags?: string[];
        excludeTags?: string[];
    },
): EnhancedStore => {
    const { eventHandlers, colorPalette, settings, objectTypes, includeTags, excludeTags } = opts;

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
        if (settings) {
            optionsDispatcher.setSettings(settings);
            store.dispatch(
                setSettingsAction({
                    settings,
                }),
            );
        }
    }, [settings, optionsDispatcher, store]);

    useEffect(() => {
        if (objectTypes) {
            optionsDispatcher.setObjectTypes(objectTypes);
            store.dispatch(
                setObjectTypesAction({
                    objectTypes,
                }),
            );
        }
    }, [objectTypes, optionsDispatcher, store]);

    useEffect(() => {
        if (includeTags || excludeTags) {
            optionsDispatcher.setTags(includeTags, excludeTags);
            store.dispatch(
                setTagsAction({
                    includeTags,
                    excludeTags,
                }),
            );
        }
    }, [includeTags, excludeTags, optionsDispatcher, store]);

    useEffect(() => {
        if (eventHandlers) {
            eventDispatcher.setHandlers(eventHandlers);
        }
    }, [eventHandlers, eventDispatcher]);

    return store;
};
