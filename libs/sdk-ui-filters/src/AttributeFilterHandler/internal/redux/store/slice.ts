// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { rootReducers } from "./rootReducers.js";
import { AttributeFilterState, initialState, AttributeFilterReducer } from "./state.js";

const attributeFilterSlice = createSlice({
    name: "attributeFilterSlice",
    // Missing properties are provided in preloadedState in createStore
    initialState: initialState as AttributeFilterState,
    reducers: rootReducers,
});

/**
 * @internal
 */
export const sliceReducer: AttributeFilterReducer = attributeFilterSlice.reducer;

/**
 * @internal
 */
export const actions = attributeFilterSlice.actions;
