// (C) 2021-2025 GoodData Corporation
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
