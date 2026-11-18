// (C) 2026 GoodData Corporation

import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
} from "../../actions/report_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";

import {
    executionProgressCleared,
    executionProgressEventReceived,
    executionProgressStarted,
    executionProgressStreamClosed,
    executionProgressUnavailable,
    executionStatsProfileFailed,
    executionStatsProfileLoaded,
    executionStatsProfileLoading,
} from "./execution_progress_actions.js";
import { type IExecutionProgressState, executionProgressInitialState } from "./execution_progress_state.js";

/**
 * When the report execution settled: its end time, else (a failure reports none) the last progress
 * that arrived, else its start.
 */
function settledAt(state: IExecutionProgressState, endTime: number | null | undefined): number | null {
    // a failure may carry the end time of an earlier execution
    if (typeof endTime === "number" && endTime > 0 && endTime >= (state.reportStartedAt ?? 0)) {
        return endTime;
    }
    const lastReceived = state.events.length > 0 ? state.events[state.events.length - 1].receivedAt : null;
    return lastReceived ?? state.reportStartedAt;
}

const executionProgressSlice = createSlice({
    name: "executionProgress",
    initialState: executionProgressInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(reportExecutionStarted, (_state, action): IExecutionProgressState => ({
                ...executionProgressInitialState,
                reportExecutionId: action.meta.id,
                reportStartedAt: action.meta.startTime,
                streamStatus: "waiting",
            }))
            .addCase(executionProgressStarted, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.executionId = payload.executionId;
                    state.source = payload.source;
                    state.resultId = payload.resultId ?? null;
                    state.streamStatus = payload.source === "network" ? "streaming" : "done";
                }
            })
            .addCase(executionProgressEventReceived, (state, { payload }) => {
                const { reportExecutionId, event, receivedAt } = payload;
                if (state.reportExecutionId !== reportExecutionId) {
                    return;
                }
                // replayed and live events can overlap: keep one per seq, in seq order
                if (state.events.some((received) => received.event.seq === event.seq)) {
                    return;
                }
                const index = state.events.findIndex((received) => received.event.seq > event.seq);
                const received = { event, receivedAt };
                if (index === -1) {
                    state.events.push(received);
                } else {
                    state.events.splice(index, 0, received);
                }
            })
            .addCase(executionProgressStreamClosed, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.streamStatus = "done";
                }
            })
            .addCase(executionProgressUnavailable, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.streamStatus = "failed";
                }
            })
            .addCase(executionStatsProfileLoading, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.storedProfile = { status: "loading", profile: null };
                }
            })
            .addCase(executionStatsProfileLoaded, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.storedProfile = { status: "loaded", profile: payload.profile };
                }
            })
            .addCase(executionStatsProfileFailed, (state, { payload }) => {
                if (state.reportExecutionId === payload.reportExecutionId) {
                    state.storedProfile = {
                        status: payload.unavailable ? "unavailable" : "failed",
                        profile: null,
                    };
                }
            })
            .addCase(executionProgressCleared, () => executionProgressInitialState)
            .addMatcher(isAnyOf(reportExecutionFinished, reportExecutionFailed), (state, action) => {
                if (state.reportExecutionId === action.meta.id) {
                    // a failed (e.g. empty) result carries no end time of its own
                    state.reportFinishedAt = settledAt(state, action.meta.endTime);
                }
            })
            .addMatcher(isInsightContentResetEvent, () => executionProgressInitialState);
    },
});

export const executionProgressSliceReducer: Reducer<IExecutionProgressState> = executionProgressSlice.reducer;
