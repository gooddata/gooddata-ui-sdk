// (C) 2024-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { filterViewsReducers } from "./filterViewsReducers.js";
import { type IFilterViews, type IFilterViewsState, filterViewsInitialState } from "./filterViewsState.js";

const filterViewsSlice = createSlice({
    name: "filterViews",
    initialState: filterViewsInitialState,
    reducers: filterViewsReducers,
});

export const filterViewsSliceReducer: Reducer<IFilterViewsState> = filterViewsSlice.reducer;

// TODO: this is no longer the case: Spread "fixes" TS2742 error
export const filterViewsActions = { ...filterViewsSlice.actions };

export { selectFilterViews, selectFilterViewsAreLoading } from "./filterViewsReducersSelectors.js";
export type { IFilterViewsState, IFilterViews };
