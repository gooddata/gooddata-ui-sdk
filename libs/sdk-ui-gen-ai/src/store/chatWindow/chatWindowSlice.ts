// (C) 2024 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ChatWindowSliceState = {
    /**
     * Defines if the chat window is open.
     */
    isOpen: boolean;
    /**
     * Defines if the chat window is in fullscreen mode.
     */
    isFullscreen: boolean;
};

export const chatWindowSliceName = "chatWindow";

const initialState: ChatWindowSliceState = {
    isOpen: false,
    isFullscreen: false,
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
    },
});

export const chatWindowSliceReducer = chatWindowSlice.reducer;
export const { setOpenAction, setFullscreenAction } = chatWindowSlice.actions;
