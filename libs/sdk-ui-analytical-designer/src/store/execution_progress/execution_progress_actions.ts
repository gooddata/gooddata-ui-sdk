// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IComputationProfile, type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import { type ExecutionProgressSource } from "./execution_progress_state.js";

export const executionProgressStarted = createAction<{
    reportExecutionId: string;
    executionId: string;
    source: ExecutionProgressSource;
    resultId?: string;
}>("EXECUTION_PROGRESS_STARTED");

export const executionProgressEventReceived = createAction(
    "EXECUTION_PROGRESS_EVENT_RECEIVED",
    (reportExecutionId: string, event: IExecutionProgressEvent, receivedAt: number) => ({
        payload: { reportExecutionId, event, receivedAt },
    }),
);

export const executionProgressStreamClosed = createAction<{ reportExecutionId: string }>(
    "EXECUTION_PROGRESS_STREAM_CLOSED",
);

/** the progress is not available for the execution: no execution id, or the stream failed */
export const executionProgressUnavailable = createAction<{ reportExecutionId: string }>(
    "EXECUTION_PROGRESS_UNAVAILABLE",
);

/** the execution stats were opened: load the stored profile of the result, once */
export const executionStatsOpened = createAction<{ reportExecutionId: string }>("EXECUTION_STATS_OPENED");

export const executionStatsProfileLoading = createAction<{ reportExecutionId: string }>(
    "EXECUTION_STATS_PROFILE_LOADING",
);

export const executionStatsProfileLoaded = createAction<{
    reportExecutionId: string;
    profile: IComputationProfile | null;
}>("EXECUTION_STATS_PROFILE_LOADED");

export const executionStatsProfileFailed = createAction<{
    reportExecutionId: string;
    /** the result is not known, so there is nothing to load */
    unavailable?: boolean;
}>("EXECUTION_STATS_PROFILE_FAILED");

/**
 * Nothing executes any more (empty buckets, cleared, an insight that does not execute): the stats of
 * the previous report execution must not outlive it.
 */
export const executionProgressCleared = createAction("EXECUTION_PROGRESS_CLEARED");
