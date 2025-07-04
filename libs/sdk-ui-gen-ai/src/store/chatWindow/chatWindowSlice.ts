// (C) 2024-2025 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { createSlice, PayloadAction, Reducer } from "@reduxjs/toolkit";

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
};

export const chatWindowSliceName = "chatWindow";

const initialState: ChatWindowSliceState = {
    isOpen: false,
    isFullscreen: false,
    colorPalette: undefined,
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
        copyToClipboardAction: (state, _action: PayloadAction<{ content: string }>) => state,
    },
});

export const chatWindowSliceReducer: Reducer<ChatWindowSliceState> = chatWindowSlice.reducer;
export const { setOpenAction, setFullscreenAction, setColorPaletteAction, copyToClipboardAction } =
    chatWindowSlice.actions;
