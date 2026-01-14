// (C) 2021-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { rootReducers } from "./rootReducers.js";
import { type AttributeFilterReducer, type IAttributeFilterState, initialState } from "./state.js";

const attributeFilterSlice = createSlice({
    name: "attributeFilterSlice",
    // Missing properties are provided in preloadedState in createStore
    initialState: initialState as IAttributeFilterState,
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
