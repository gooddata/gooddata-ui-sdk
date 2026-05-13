// (C) 2025-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { attributeFilterConfigsReducers } from "./attributeFilterConfigs/attributeFilterConfigsReducers.js";
import { dateFilterConfigReducers } from "./dateFilterConfig/dateFilterConfigReducers.js";
import { dateFilterConfigsReducers } from "./dateFilterConfigs/dateFilterConfigsReducers.js";
import { filterContextReducers } from "./filterContext/filterContextReducers.js";
import { layoutReducers } from "./layout/layoutReducers.js";
import { measureValueFilterConfigsReducers } from "./measureValueFilterConfigs/measureValueFilterConfigsReducers.js";
import { parametersReducers } from "./parameters/parametersReducers.js";
import { tabsReducers } from "./tabsReducers.js";
import { tabsInitialState } from "./tabsState.js";

const allReducers = {
    ...tabsReducers,
    ...attributeFilterConfigsReducers,
    ...dateFilterConfigsReducers,
    ...dateFilterConfigReducers,
    ...measureValueFilterConfigsReducers,
    ...filterContextReducers,
    ...layoutReducers,
    ...parametersReducers,
} as const;

const tabsSlice = createSlice({
    name: "tabs",
    initialState: tabsInitialState,
    reducers: allReducers,
});

export const tabsSliceReducer = tabsSlice.reducer;

/**
 * @internal
 */
export const tabsActions = tabsSlice.actions;
