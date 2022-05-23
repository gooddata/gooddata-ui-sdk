// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import {
    attributeReducers,
    attributeElementsReducers,
    displayFormReducers,
    attributeFilterReducers,
    selectionReducers,
    mainReducers,
} from "./reducers";
import { initialState } from "./state";

const attributeFilterSlice = createSlice({
    name: "attributeFilterSlice",
    initialState: initialState,
    reducers: {
        ...displayFormReducers,
        ...attributeReducers,
        ...attributeElementsReducers,
        ...attributeFilterReducers,
        ...selectionReducers,
        ...mainReducers,
    },
});

/**
 * @internal
 */
export const sliceReducer = attributeFilterSlice.reducer;

/**
 * @internal
 */
export const actions = attributeFilterSlice.actions;
