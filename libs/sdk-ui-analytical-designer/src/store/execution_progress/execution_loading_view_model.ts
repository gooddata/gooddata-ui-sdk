// (C) 2026 GoodData Corporation

import {
    type ExecutionProgressStepState,
    type IExecutionProgressSourceViewModel,
    type IExecutionProgressStepViewModel,
    type IExecutionProgressViewModel,
} from "./execution_progress_view_model.js";

/**
 * The sub-steps of the loading view (chronological, only once started; `render` is the header):
 *
 * - `cache` — Checking local cache: the root start until it missed its cache (requested its children).
 * - `prepare` — Preparing the query: preprocessing and SQL generation, until the query is requested.
 * - `query` — Querying data: the data source query, one row per data source when federated.
 * - `render` — Rendering visualisation: post-processing and drawing the chart, until the view closes.
 */
export type ExecutionLoadingStepKind = "cache" | "prepare" | "query" | "render";

export interface IExecutionLoadingStepViewModel {
    kind: ExecutionLoadingStepKind;
    state: ExecutionProgressStepState;
    /** server time */
    startedAt?: number;
    finishedAt?: number;
    /** query: the data source queried (one data source) */
    dataSourceId?: string;
    dataSourceName?: string;
    /** query: one entry per data source of a federated query */
    sources?: IExecutionProgressSourceViewModel[];
    /** query: the federated source that is (or was) the slowest */
    slowestSourceResultId?: string;
}

/**
 * - `compact` — the single "Computing the visualisation" line: before anything is known, and for any
 *   result served from a cache (backend result cache, raw cache, browser cache).
 * - `steps` — the step list: the data comes from the data source.
 */
export type ExecutionLoadingMode = "compact" | "steps";

export interface IExecutionLoadingViewModel {
    mode: ExecutionLoadingMode;
    steps: IExecutionLoadingStepViewModel[];
}

const COMPACT: IExecutionLoadingViewModel = { mode: "compact", steps: [] };

/**
 * Builds the loading view from the execution progress. It expands into the steps only once the data
 * is known to come from the data source — the SQL is generated or a query requested — so a cache hit
 * never flashes the steps.
 */
export function buildExecutionLoadingViewModel(
    progress: IExecutionProgressViewModel,
): IExecutionLoadingViewModel {
    if (progress.source === "browserCache" || progress.cacheHit || !progress.hasEvents) {
        return COMPACT;
    }
    const step = (kind: IExecutionProgressStepViewModel["kind"]) =>
        progress.steps.find((candidate) => candidate.kind === kind);
    const preparing = step("preparing");
    const sqlGeneration = step("sqlGeneration");
    const query = step("federation") ?? step("query");
    const postprocessing = step("postprocessing");

    // a federation whose sources all came from the raw cache queried nothing, like a single
    // source served from the raw cache
    const servedFromCache =
        query?.cacheHit === true ||
        (query?.sources !== undefined &&
            query.sources.length > 0 &&
            query.sources.every((source) => source.cacheHit));
    const queried = query !== undefined && query.state !== "pending" && !servedFromCache;
    if (servedFromCache || (!sqlGeneration && !queried)) {
        return COMPACT;
    }

    const failed = progress.phase === "failed";
    const settle = (
        startedAt: number | undefined,
        finishedAt: number | undefined,
    ): ExecutionProgressStepState => {
        if (startedAt === undefined) {
            return "pending";
        }
        if (finishedAt !== undefined) {
            return "done";
        }
        return failed ? "failed" : "running";
    };

    const queryStartedAt = queried ? query.startedAt : undefined;
    // rendering follows the post-processing, or a successful query without one; never a failed query
    const renderStartedAt =
        postprocessing && postprocessing.state !== "pending"
            ? postprocessing.startedAt
            : query?.state === "done"
              ? query.finishedAt
              : undefined;

    const cacheStartedAt = progress.startedAt;
    const cacheFinishedAt =
        progress.childrenRequestedAt ?? sqlGeneration?.startedAt ?? preparing?.finishedAt ?? queryStartedAt;
    const prepareFinishedAt = queryStartedAt ?? renderStartedAt;

    const steps: IExecutionLoadingStepViewModel[] = [
        {
            kind: "cache",
            state: settle(cacheStartedAt, cacheFinishedAt),
            startedAt: cacheStartedAt,
            finishedAt: cacheFinishedAt,
        },
        {
            kind: "prepare",
            state: settle(cacheFinishedAt, prepareFinishedAt),
            startedAt: cacheFinishedAt,
            finishedAt: prepareFinishedAt,
        },
        {
            kind: "query",
            state: queried ? query.state : "pending",
            startedAt: queryStartedAt,
            finishedAt: queried ? query.finishedAt : undefined,
            dataSourceId: query?.dataSourceId ?? sqlGeneration?.dataSourceId,
            dataSourceName: query?.dataSourceName ?? sqlGeneration?.dataSourceName,
            ...(query?.sources ? { sources: query.sources } : {}),
            ...(query?.slowestSourceResultId ? { slowestSourceResultId: query.slowestSourceResultId } : {}),
        },
        {
            kind: "render",
            // drawing the chart follows the computation: it runs until the view closes
            state: settle(renderStartedAt, undefined),
            startedAt: renderStartedAt,
        },
    ];
    // chronological, appended below the "Rendering visualisation" header; future steps are not shown,
    // and the rendering itself is the header
    return {
        mode: "steps",
        steps: steps.filter(
            (loadingStep) => loadingStep.state !== "pending" && loadingStep.kind !== "render",
        ),
    };
}

/**
 * The duration in ms a sub-step (or a federated source) shows: a finished one always its duration; a
 * running one a live timer from 1 s on, nothing before. The view formats it with the locale.
 */
export function loadingStepDurationMs(
    step: { startedAt?: number; finishedAt?: number; state: ExecutionProgressStepState },
    serverNow: number,
): number | undefined {
    if (step.startedAt === undefined || step.state === "pending") {
        return undefined;
    }
    if (step.finishedAt !== undefined) {
        return step.finishedAt - step.startedAt;
    }
    const runningMs = serverNow - step.startedAt;
    return runningMs >= 1000 ? runningMs : undefined;
}

/** consecutive steps appear at least this far apart, even when their events arrive together */
export const STEP_REVEAL_GAP_MS = 350;

/**
 * The reveal queue of the step list: how many steps (in chronological order) are shown, and when the
 * last one appeared.
 */
export interface IStepRevealState {
    revealed: number;
    lastRevealAt: number;
}

export const initialStepRevealState: IStepRevealState = { revealed: 0, lastRevealAt: -Infinity };

/**
 * Reveals the next started step once the gap since the previous reveal passed; one step at a time.
 * `started` is the number of steps that have started. Never hides a step already shown.
 */
export function advanceStepReveal(state: IStepRevealState, started: number, now: number): IStepRevealState {
    if (state.revealed >= started || now - state.lastRevealAt < STEP_REVEAL_GAP_MS) {
        return state;
    }
    return { revealed: state.revealed + 1, lastRevealAt: now };
}

/** when the next queued step is due, or undefined when nothing is queued */
export function nextStepRevealAt(state: IStepRevealState, started: number): number | undefined {
    return state.revealed < started ? state.lastRevealAt + STEP_REVEAL_GAP_MS : undefined;
}

/** the sub-steps revealed so far, in chronological order */
export function revealedLoadingSteps(
    steps: IExecutionLoadingStepViewModel[],
    revealed: number,
): IExecutionLoadingStepViewModel[] {
    return steps.slice(0, revealed);
}
