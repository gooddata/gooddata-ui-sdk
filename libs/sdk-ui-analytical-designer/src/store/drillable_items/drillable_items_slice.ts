// (C) 2020-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { conversionDone } from "../../actions/drillable_items_actions.js";

import { type IDrillableItemsState, drillableItemsInitialState } from "./drillable_items_state.js";

const drillableItemsSlice = createSlice({
    name: "drillableItems",
    initialState: drillableItemsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(conversionDone, (_state, action) => action.payload);
    },
});

export const drillableItemsSliceReducer: Reducer<IDrillableItemsState> = drillableItemsSlice.reducer;
