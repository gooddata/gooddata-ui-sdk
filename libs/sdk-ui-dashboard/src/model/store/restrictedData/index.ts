// (C) 2026 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { serializeObjRef } from "@gooddata/sdk-model";

import {
    type IRefusedExecution,
    type IRestrictedDataState,
    restrictedDataInitialState,
} from "./restrictedDataState.js";

const restrictedDataSlice = createSlice({
    name: "restrictedData",
    initialState: restrictedDataInitialState,
    reducers: {
        executionRefused: (state, action: PayloadAction<IRefusedExecution>) => {
            state.refusedExecutions[serializeObjRef(action.payload.ref)] = action.payload;
        },
        // the widget's execution finished otherwise, or the widget was refreshed
        clearRefusal: (state, action: PayloadAction<string>) => {
            // only touch the map when needed, so its reference stays the same for unrestricted widgets
            if (action.payload in state.refusedExecutions) {
                delete state.refusedExecutions[action.payload];
            }
        },
        clearRestrictedData: () => restrictedDataInitialState,
    },
});

export const restrictedDataSliceReducer: Reducer<IRestrictedDataState> = restrictedDataSlice.reducer;

// Spread "fixes" TS2742 error
export const restrictedDataActions = { ...restrictedDataSlice.actions };
