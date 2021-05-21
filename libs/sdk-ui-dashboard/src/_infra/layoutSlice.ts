// (C) 2021 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LayoutState {
    layout: any;
}

const initialState = { layout: 0 } as LayoutState;

const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers: {
        initialize(state, action: PayloadAction<any>) {
            state.layout = action.payload;
        },
    },
});

export const { initialize } = layoutSlice.actions;

export const layoutSliceReducer = layoutSlice.reducer;
