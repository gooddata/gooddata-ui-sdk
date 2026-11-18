// (C) 2026 GoodData Corporation

import { type IExecutionProgressState } from "./execution_progress_state.js";
import {
    type ExecutionCacheSaving,
    type IExecutionProgressOriginalViewModel,
    type IExecutionProgressViewModel,
    buildExecutionProgressViewModel,
    buildOriginalComputation,
    computeCacheSaving,
} from "./execution_progress_view_model.js";

/**
 * How the result of the last report execution was loaded:
 *
 * - `fresh` — computed by the backend, querying the data sources.
 * - `cacheHit` — served from the backend result cache.
 * - `browserCache` — served from the client-side execution cache, no request sent.
 * - `unknown` — no progress arrived for the execution.
 */
export type ExecutionStatsLoadKind = "fresh" | "cacheHit" | "browserCache" | "unknown";

/**
 * - `missing` — the backend stored no statistics for the result (e.g. cached before they existed).
 * - `unavailable` — the result is not known, nothing can be loaded.
 */
export type ExecutionStatsOriginalStatus =
    | "idle"
    | "loading"
    | "loaded"
    | "missing"
    | "failed"
    | "unavailable";

export interface IExecutionStatsViewModel {
    /** a settled report execution exists to show the stats of */
    available: boolean;
    reportExecutionId?: string;
    load: ExecutionStatsLoadKind;
    failed: boolean;
    /** how long this load took: server time of the root computation, else the client one */
    totalMs?: number;
    /** the steps of this load, as the progress panel showed them */
    progress: IExecutionProgressViewModel;
    /** how the result was originally computed; not for a fresh load, which is its own original */
    showsOriginal: boolean;
    original: {
        status: ExecutionStatsOriginalStatus;
        computation?: IExecutionProgressOriginalViewModel;
    };
    /** on a cache hit with the original computation known: what the cache saved */
    saved?: ExecutionCacheSaving;
}

/**
 * Builds the execution stats of the last settled report execution: how this load went (from the
 * progress events kept until the next execution starts) and how the result was originally computed
 * (from the profile stored with the result, loaded lazily).
 */
export function buildExecutionStatsViewModel(
    state: IExecutionProgressState,
    progress: IExecutionProgressViewModel = buildExecutionProgressViewModel(state),
): IExecutionStatsViewModel {
    const available = state.reportExecutionId !== null && state.reportFinishedAt !== null;

    const load: ExecutionStatsLoadKind =
        state.source === "browserCache"
            ? "browserCache"
            : progress.cacheHit
              ? "cacheHit"
              : progress.hasEvents
                ? "fresh"
                : "unknown";

    const reportSpan =
        state.reportStartedAt !== null && state.reportFinishedAt !== null
            ? state.reportFinishedAt - state.reportStartedAt
            : undefined;
    const serverSpan =
        progress.startedAt !== undefined && progress.finishedAt !== undefined
            ? progress.finishedAt - progress.startedAt
            : undefined;
    const totalMs = load === "fresh" || load === "cacheHit" ? (serverSpan ?? reportSpan) : reportSpan;

    const original = buildOriginal(state, progress);
    const saved =
        load === "cacheHit" && original.computation
            ? computeCacheSaving(original.computation, totalMs)
            : undefined;

    return {
        available,
        reportExecutionId: state.reportExecutionId ?? undefined,
        load,
        failed: progress.phase === "failed",
        totalMs,
        progress,
        showsOriginal: load !== "fresh",
        original,
        ...(saved ? { saved } : {}),
    };
}

function buildOriginal(
    state: IExecutionProgressState,
    progress: IExecutionProgressViewModel,
): IExecutionStatsViewModel["original"] {
    const { status, profile } = state.storedProfile;
    if (status === "loaded") {
        const computation = buildOriginalComputation(profile);
        return computation ? { status: "loaded", computation } : { status: "missing" };
    }
    // a cache hit already told how the result was computed, no need to wait for the metadata
    if (progress.original) {
        return { status: "loaded", computation: progress.original };
    }
    return { status };
}
