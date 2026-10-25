// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { openReportFailed, openReportStarted } from "../../actions/open_actions.js";
import {
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
    reportExecutionWarning,
} from "../../actions/report_actions.js";
import { NOT_FOUND } from "../../constants/errors.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";

import {
    applyExecutionError,
    applyExecutionWarning,
    clearExecutionResult,
    finishExecution,
    reportNotFoundError,
    startExecution,
} from "./execution_helpers.js";
import { type IExecutionState, executionInitialState } from "./execution_state.js";

/**
 * `report.execution`.
 *
 * The id guard is the domain's one real rule: a result from a SUPERSEDED execution must not touch
 * the current state. The `report.nowOpen` close is coupled to the same guard through the execution
 * domain's coordination event (execution_coordination_saga.ts re-tests the identical condition —
 * none of these actions writes `id`, so the two tests cannot disagree).
 *
 * The two OPEN_REPORT_* cases are foreign actions whose writes into THIS subtree were absorbed
 * from open_report_reducer) — the dialogs precedent from 4.1.
 */
const executionSlice = createSlice({
    name: "execution",
    initialState: executionInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(reportExecutionStarted, (state, action) => {
                startExecution(state, action.meta.id);
            })
            .addCase(reportExecutionFailed, (state, action) => {
                if (state.id === action.meta.id) {
                    applyExecutionError(state, action.payload);
                }
            })
            .addCase(reportExecutionFinished, (state, action) => {
                if (state.id === action.meta.id) {
                    finishExecution(state);
                }
            })
            .addCase(reportExecutionWarning, (state, action) => {
                if (state.id === action.meta.id) {
                    applyExecutionWarning(state, action.payload.limitBreaks);
                }
            })
            // The two foreign OPEN_REPORT_* actions are wired by their creators rather than by
            // their enum strings.
            .addCase(openReportStarted, (state) => {
                clearExecutionResult(state);
            })
            /**
             * The application resets (store/app_context/application_reset_events.ts).
             * OPEN_REPORT_FAILED is one of them, and its failure write COMPOSES with the reset
             * here: reset to initial, then the NOT_FOUND status on top, which is exactly what
             * `reportNotFoundError` builds (it spreads `executionInitialState`). A failure WITH a `reason` is reported through
             * `report.loadingError` instead and leaves this subtree at the reset value.
             */
            .addMatcher(isInsightContentResetEvent, (_state, action): IExecutionState => {
                if (openReportFailed.match(action) && action.payload.reason === undefined) {
                    return reportNotFoundError(NOT_FOUND, action.payload.missingItems);
                }
                return executionInitialState;
            });
    },
});

export const executionSliceReducer: Reducer<IExecutionState> = executionSlice.reducer;
