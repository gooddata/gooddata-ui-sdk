// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { rootReducers } from "./rootReducers.js";
import { AttributeFilterState, initialState } from "./state.js";

const attributeFilterSlice = createSlice({
    name: "attributeFilterSlice",
    // Missing properties are provided in preloadedState in createStore
    initialState: initialState as AttributeFilterState,
    reducers: rootReducers,
});

/**
 * @internal
 */
export const sliceReducer = attributeFilterSlice.reducer;

/**
 * @internal
 */
export const actions = attributeFilterSlice.actions;
