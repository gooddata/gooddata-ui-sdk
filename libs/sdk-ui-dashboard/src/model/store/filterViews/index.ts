// (C) 2024 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { filterViewsInitialState } from "./filterViewsState.js";
import { filterViewsReducers } from "./filterViewsReducers.js";

const filterViewsSlice = createSlice({
    name: "filterViews",
    initialState: filterViewsInitialState,
    reducers: filterViewsReducers,
});

export const filterViewsSliceReducer = filterViewsSlice.reducer;
export const filterViewsActions = filterViewsSlice.actions;

export { selectFilterViews, selectFilterViewsAreLoading } from "./filterViewsReducersSelectors.js";
export type { FilterViewsState, IFilterViews } from "./filterViewsState.js";
