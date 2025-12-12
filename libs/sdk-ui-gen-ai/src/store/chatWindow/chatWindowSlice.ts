// (C) 2024-2025 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

type ChatWindowSliceState = {
    /**
     * Defines if the chat window is open.
     */
    isOpen: boolean;
    /**
     * Defines if the chat window is in fullscreen mode.
     */
    isFullscreen: boolean;
    /**
     * Color palette to use for the chat UI.
     */
    colorPalette?: IColorPalette;
    /**
     * Settings to use for the chat UI.
     */
    settings?: IUserWorkspaceSettings;
    /**
     * Key driver analysis to use for the chat UI.
     */
    keyDriverAnalysis?: IKdaDefinition;
    /**
     * Object types to use for the chat UI.
     */
    objectTypes?: GenAIObjectType[];
};

export const chatWindowSliceName = "chatWindow";

const initialState: ChatWindowSliceState = {
    isOpen: false,
    isFullscreen: false,
    colorPalette: undefined,
    settings: undefined,
    objectTypes: undefined,
};

const chatWindowSlice = createSlice({
    name: chatWindowSliceName,
    initialState,
    reducers: {
        setOpenAction: (state, { payload: { isOpen } }: PayloadAction<{ isOpen: boolean }>) => {
            state.isOpen = isOpen;
        },
        setFullscreenAction: (
            state,
            { payload: { isFullscreen } }: PayloadAction<{ isFullscreen: boolean }>,
        ) => {
            state.isFullscreen = isFullscreen;
        },
        setColorPaletteAction: (
            state,
            { payload: { colorPalette } }: PayloadAction<{ colorPalette?: IColorPalette }>,
        ) => {
            state.colorPalette = colorPalette;
        },
        setSettingsAction: (
            state,
            { payload: { settings } }: PayloadAction<{ settings?: IUserWorkspaceSettings }>,
        ) => {
            state.settings = settings;
        },
        setKeyDriverAnalysisAction: (
            state,
            { payload: { keyDriverAnalysis } }: PayloadAction<{ keyDriverAnalysis?: IKdaDefinition }>,
        ) => {
            state.keyDriverAnalysis = keyDriverAnalysis;
        },
        setObjectTypesAction: (
            state,
            { payload: { objectTypes } }: PayloadAction<{ objectTypes?: GenAIObjectType[] }>,
        ) => {
            state.objectTypes = objectTypes;
        },
        copyToClipboardAction: (state, _action: PayloadAction<{ content: string }>) => state,
    },
});

export const chatWindowSliceReducer: Reducer<ChatWindowSliceState> = chatWindowSlice.reducer;
export const {
    setOpenAction,
    setFullscreenAction,
    setColorPaletteAction,
    setSettingsAction,
    copyToClipboardAction,
    setKeyDriverAnalysisAction,
    setObjectTypesAction,
} = chatWindowSlice.actions;
