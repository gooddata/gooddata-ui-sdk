// (C) 2026 GoodData Corporation

import { type IComputationProfile, type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

/**
 * Where the result of the report execution came from, as far as the client can tell:
 *
 * - `network` — the execute call reached the backend; its progress is streamed.
 * - `browserCache` — the client-side execution cache answered, no request was sent.
 */
export type ExecutionProgressSource = "network" | "browserCache";

/**
 * - `idle` — no report execution tracked.
 * - `waiting` — the report execution started, its backend execution is not known yet.
 * - `streaming` — the progress stream is open.
 * - `done` — the stream ended (the root computation finished) or nothing needs streaming.
 * - `failed` — the progress is unavailable (no execution id, stream error).
 */
export type ExecutionProgressStreamStatus = "idle" | "waiting" | "streaming" | "done" | "failed";

export interface IReceivedExecutionProgressEvent {
    event: IExecutionProgressEvent;
    /** client time the event arrived; correlates the server clock with the client one */
    receivedAt: number;
}

/**
 * The stored profile of the result (how it was originally computed), loaded lazily from the result
 * metadata when the execution stats are opened.
 *
 * - `unavailable` — the result is not known, nothing can be loaded.
 */
export type ExecutionStatsProfileStatus = "idle" | "loading" | "loaded" | "failed" | "unavailable";

export interface IExecutionStatsProfileState {
    status: ExecutionStatsProfileStatus;
    /** null when loaded but the backend stored no profile for the result */
    profile: IComputationProfile | null;
}

/**
 * `report.executionProgress` — the live progress of the CURRENT report execution. Keyed by the
 * report execution id of `report.execution`; anything for a superseded execution is dropped.
 */
export interface IExecutionProgressState {
    reportExecutionId: string | null;
    /** the backend execution id (X-GDC-CANCEL-TOKEN) */
    executionId: string | null;
    source: ExecutionProgressSource | null;
    streamStatus: ExecutionProgressStreamStatus;
    /** client time the report execution started / settled */
    reportStartedAt: number | null;
    reportFinishedAt: number | null;
    /** ordered by `seq`, without duplicates */
    events: IReceivedExecutionProgressEvent[];
    /** the result of the report's own execution; kept until the next execution starts */
    resultId: string | null;
    storedProfile: IExecutionStatsProfileState;
}

export const executionProgressInitialState: IExecutionProgressState = {
    reportExecutionId: null,
    executionId: null,
    source: null,
    streamStatus: "idle",
    reportStartedAt: null,
    reportFinishedAt: null,
    events: [],
    resultId: null,
    storedProfile: { status: "idle", profile: null },
};
