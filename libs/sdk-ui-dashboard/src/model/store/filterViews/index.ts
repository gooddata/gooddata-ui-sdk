// (C) 2024-2025 GoodData Corporation

import { createSlice, Reducer } from "@reduxjs/toolkit";

import { filterViewsInitialState, FilterViewsState } from "./filterViewsState.js";
import { filterViewsReducers } from "./filterViewsReducers.js";

const filterViewsSlice = createSlice({
    name: "filterViews",
    initialState: filterViewsInitialState,
    reducers: filterViewsReducers,
});

export const filterViewsSliceReducer: Reducer<FilterViewsState> = filterViewsSlice.reducer;

// Spread "fixes" TS2742 error
export const filterViewsActions = { ...filterViewsSlice.actions };

export { selectFilterViews, selectFilterViewsAreLoading } from "./filterViewsReducersSelectors.js";
export type { FilterViewsState, IFilterViews } from "./filterViewsState.js";
