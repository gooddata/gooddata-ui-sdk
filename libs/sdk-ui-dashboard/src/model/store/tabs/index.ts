// (C) 2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { tabsReducers } from "./tabsReducers.js";
import { tabsInitialState } from "./tabsState.js";

const tabsSlice = createSlice({
    name: "tabs",
    initialState: tabsInitialState,
    reducers: tabsReducers,
});

export const tabsSliceReducer = tabsSlice.reducer;

/**
 * @alpha
 */
export const tabsActions = tabsSlice.actions;

export {
    selectTabs,
    selectActiveTabId,
    selectActiveTab,
    selectTabById,
    selectHasTabs,
} from "./tabsSelectors.js";
export type { TabsState } from "./tabsState.js";
