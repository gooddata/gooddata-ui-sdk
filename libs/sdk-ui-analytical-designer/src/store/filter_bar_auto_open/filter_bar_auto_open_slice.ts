// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { openReportFinished } from "../../actions/open_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import { removeFiltersFromState, storeFilterBarAutoOpen } from "../filter_bar/filter_bar_actions.js";

import { type IFilterBarAutoOpenState, filterBarAutoOpenInitialState } from "./filter_bar_auto_open_state.js";

const filterBarAutoOpenSlice = createSlice({
    name: "filterBarAutoOpen",
    initialState: filterBarAutoOpenInitialState as IFilterBarAutoOpenState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                storeFilterBarAutoOpen,
                (_state, action): IFilterBarAutoOpenState => action.payload.filterLocalIdentifier,
            )
            // a hand-over for a filter removed before its item rendered must not wait for a later
            // filter with the same local identifier (a redo re-adds one)
            .addCase(removeFiltersFromState, (state, action): IFilterBarAutoOpenState =>
                state !== null && action.payload.localIdentifiers.includes(state) ? null : state,
            )
            // a pending hand-over cannot outlive the insight content it was made for
            .addMatcher(isInsightContentResetEvent, (): IFilterBarAutoOpenState => null)
            .addMatcher(openReportFinished.match, (): IFilterBarAutoOpenState => null);
    },
});

export const filterBarAutoOpenSliceReducer: Reducer<IFilterBarAutoOpenState> = filterBarAutoOpenSlice.reducer;
