// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    insightAccessDraftApplied,
    insightAccessDraftChanged,
} from "../../actions/insight_access_actions.js";
import { openReportStarted } from "../../actions/open_actions.js";
import { isApplicationResetEvent } from "../app_context/application_reset_events.js";

import { type IInsightAccessState, insightAccessInitialState } from "./insight_access_state.js";

const insightAccessSlice = createSlice({
    name: "insightAccess",
    initialState: insightAccessInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(insightAccessDraftChanged, (_state, action): IInsightAccessState => action.payload.draft)
            .addCase(insightAccessDraftApplied, (): IInsightAccessState => insightAccessInitialState)
            .addCase(openReportStarted, (): IInsightAccessState => insightAccessInitialState)
            .addMatcher(isApplicationResetEvent, (): IInsightAccessState => insightAccessInitialState);
    },
});

export const insightAccessSliceReducer: Reducer<IInsightAccessState> = insightAccessSlice.reducer;
