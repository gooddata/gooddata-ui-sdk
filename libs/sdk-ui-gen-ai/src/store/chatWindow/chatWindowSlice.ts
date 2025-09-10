// (C) 2024-2025 GoodData Corporation

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";

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
};

export const chatWindowSliceName = "chatWindow";

const initialState: ChatWindowSliceState = {
    isOpen: false,
    isFullscreen: false,
    colorPalette: undefined,
    settings: undefined,
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
} = chatWindowSlice.actions;
