// (C) 2026 GoodData Corporation

import { type IComputationProfile, type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import { type ExecutionProgressSource, type IExecutionProgressState } from "./execution_progress_state.js";

export type ExecutionProgressStepKind =
    | "preparing"
    | "sqlGeneration"
    | "federation"
    | "query"
    | "postprocessing";

export type ExecutionProgressStepState = "pending" | "running" | "done" | "failed";

/** One data source query of a federated (data blending) execution. */
export interface IExecutionProgressSourceViewModel {
    resultId: string;
    dataSourceId?: string;
    dataSourceName?: string;
    state: ExecutionProgressStepState;
    /** server time */
    startedAt?: number;
    finishedAt?: number;
    /** time the query waited before the data source started running it, known once it finished */
    queuedMs?: number;
    /** served from the raw cache, the data source was not queried */
    cacheHit: boolean;
}

/**
 * Where the time of a finished data source query went; the parts add up to the query step:
 * request → query start → result streaming start → finish.
 */
export interface IExecutionProgressQueryBreakdown {
    /** dispatching the query and getting a connection */
    waitingMs: number;
    /** the database running the query */
    databaseMs: number;
    /** reading the rows and storing them in the cache */
    transferMs: number;
}

export interface IExecutionProgressStepViewModel {
    kind: ExecutionProgressStepKind;
    state: ExecutionProgressStepState;
    /** server time */
    startedAt?: number;
    finishedAt?: number;
    /** query: the data source queried */
    dataSourceId?: string;
    dataSourceName?: string;
    /** query: where the time went, known once the query finished */
    queryBreakdown?: IExecutionProgressQueryBreakdown;
    /** query: served from the raw cache, the data source was not queried */
    cacheHit?: boolean;
    /** postprocessing: e.g. XTAB, DATA_BLENDING */
    postprocessingTypes?: string[];
    /** federation: one entry per data source */
    sources?: IExecutionProgressSourceViewModel[];
    /** federation: the source that is (or was) the slowest — running: the one waited on */
    slowestSourceResultId?: string;
}

export type ExecutionProgressPhase = "waiting" | "running" | "finished" | "failed";

export interface IExecutionProgressOriginalSourceViewModel {
    dataSourceId?: string;
    dataSourceName?: string;
    /**
     * The overall querying: requested → finished as the result cache saw it (like the "Querying"
     * step); the data source query + upload for results cached before that was recorded.
     */
    queryingMs?: number;
    dbDurationMs?: number;
    totalDurationMs?: number;
    rows?: number;
}

/** how a result served from the cache was originally computed */
export interface IExecutionProgressOriginalViewModel {
    /** server time the cached result was written */
    computedAt?: number;
    /** the original root computation end to end, when the backend recorded it */
    totalDurationMs?: number;
    /** the end-to-end time ends before the post-processing (the backend could not record the real end) */
    totalApproximate?: boolean;
    /** the slowest first, as that one decided the original duration */
    sources: IExecutionProgressOriginalSourceViewModel[];
    /**
     * The original computation end to end; for results cached before that was recorded, the
     * slowest original data source query.
     */
    originalTotalMs?: number;
    /** the original total is approximate: it ends before the post-processing, or only the querying is known */
    originalTotalApproximate: boolean;
}

export interface IExecutionProgressViewModel {
    phase: ExecutionProgressPhase;
    source: ExecutionProgressSource | null;
    /** no progress will arrive: show the generic spinner */
    unavailable: boolean;
    hasEvents: boolean;
    /** the whole result came from the backend result cache, no data source was queried */
    cacheHit: boolean;
    /** on a cache hit: how the cached result was originally computed, when the backend knows */
    original?: IExecutionProgressOriginalViewModel;
    /** server time of the root computation */
    startedAt?: number;
    finishedAt?: number;
    /** client time of the report execution */
    reportStartedAt?: number;
    reportFinishedAt?: number;
    /** client clock minus server clock, as far as the event arrivals tell; 0 without events */
    clockOffsetMs: number;
    /** server time the root computation missed its cache and requested its children */
    childrenRequestedAt?: number;
    steps: IExecutionProgressStepViewModel[];
}

const BLENDING_INPUT_ROLE = "blendingInput";

const STEP_ORDER: ExecutionProgressStepKind[] = [
    "preparing",
    "sqlGeneration",
    "federation",
    "query",
    "postprocessing",
];

interface IStepDraft extends Omit<IExecutionProgressStepViewModel, "state"> {
    /** an explicit end state; otherwise derived from the following steps and the execution phase */
    state?: ExecutionProgressStepState;
    placeholder?: boolean;
}

/**
 * Builds the view model of the execution progress panel from the received progress events.
 *
 * The backend reports events per computation (resultId); the root computation is the one without
 * a parent. The steps are derived from the whole computation tree:
 *
 * - Preparing — from the root start until the first later milestone.
 * - Generating SQL — SQL_GENERATION_STARTED … SQL_GENERATION_FINISHED.
 * - Data federation — the children with the `blendingInput` role, one entry per data source.
 * - Querying — DATABASE_QUERY_REQUESTED … FINISHED of a non-federated computation.
 * - Post-processing — POSTPROCESSING_STARTED … root FINISHED.
 *
 * A step without an explicit end is done once a later step started.
 */
export function buildExecutionProgressViewModel(state: IExecutionProgressState): IExecutionProgressViewModel {
    const base = {
        source: state.source,
        reportStartedAt: state.reportStartedAt ?? undefined,
        reportFinishedAt: state.reportFinishedAt ?? undefined,
    };

    if (state.source === "browserCache") {
        return {
            ...base,
            phase: state.reportFinishedAt === null ? "running" : "finished",
            unavailable: false,
            hasEvents: false,
            cacheHit: false,
            clockOffsetMs: 0,
            steps: [],
        };
    }

    const events = state.events.map((received) => received.event);
    if (events.length === 0) {
        return {
            ...base,
            phase: state.streamStatus === "idle" ? "finished" : "waiting",
            unavailable: state.streamStatus === "failed" || state.streamStatus === "done",
            hasEvents: false,
            cacheHit: false,
            clockOffsetMs: 0,
            steps: [],
        };
    }

    const clockOffsetMs = Math.min(
        ...state.events.map(({ event, receivedAt }) => receivedAt - event.timestamp),
    );
    const byResult = groupByResult(events);
    const rootResultId = events.find((event) => !event.parentResultId)?.resultId ?? events[0].resultId;
    const rootEvents = byResult.get(rootResultId) ?? [];
    const rootStarted = findEvent(rootEvents, "STARTED")?.timestamp ?? events[0].timestamp;
    const rootFinished = findEvent(rootEvents, "FINISHED");
    const failed = rootFinished?.status === "failure";
    const finished = rootFinished !== undefined || state.streamStatus === "done";
    const phase: ExecutionProgressPhase = failed ? "failed" : finished ? "finished" : "running";
    const cacheHit = findEvent(rootEvents, "CACHE_HIT") !== undefined || rootFinished?.cacheHit === true;

    const common = {
        ...base,
        phase,
        unavailable: false,
        hasEvents: true,
        cacheHit,
        startedAt: rootStarted,
        finishedAt: rootFinished?.timestamp,
        childrenRequestedAt: findEvent(rootEvents, "CHILDREN_REQUESTED")?.timestamp,
        clockOffsetMs,
    };
    // the events received before a stream failure are kept, but no more will come
    const commonWithStream = { ...common, unavailable: state.streamStatus === "failed" };

    if (cacheHit) {
        const profile =
            findEvent(rootEvents, "CACHE_HIT")?.profile ??
            (rootFinished?.cacheHit ? rootFinished.profile : null);
        const original = buildOriginalComputation(profile);
        return original ? { ...commonWithStream, original, steps: [] } : { ...commonWithStream, steps: [] };
    }

    const drafts = buildStepDrafts(events, byResult, rootStarted, rootFinished, finished);
    const steps = resolveStepStates(drafts, phase, rootFinished?.timestamp);

    return { ...commonWithStream, steps };
}

const definedNumber = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

export function buildOriginalComputation(
    profile: IComputationProfile | null | undefined,
): IExecutionProgressOriginalViewModel | undefined {
    const sources = (profile?.sources ?? [])
        .map((source): IExecutionProgressOriginalSourceViewModel => ({
            dataSourceId: source.dataSourceId ?? undefined,
            dataSourceName: source.dataSourceName ?? undefined,
            queryingMs: definedNumber(source.queryDurationMs) ?? definedNumber(source.totalDurationMs),
            dbDurationMs: definedNumber(source.dbDurationMs),
            totalDurationMs: definedNumber(source.totalDurationMs),
            rows: definedNumber(source.rows),
        }))
        .sort((a, b) => (b.queryingMs ?? -1) - (a.queryingMs ?? -1));
    const totalDurationMs = definedNumber(profile?.totalDurationMs);
    if (sources.length === 0 && totalDurationMs === undefined) {
        return undefined;
    }
    const durations = sources.flatMap((source) =>
        source.queryingMs === undefined ? [] : [source.queryingMs],
    );
    return {
        computedAt: definedNumber(profile?.computedAt),
        totalDurationMs,
        totalApproximate: totalDurationMs !== undefined && !!profile?.finishedAtApprox,
        sources,
        originalTotalMs: totalDurationMs ?? (durations.length > 0 ? Math.max(...durations) : undefined),
        originalTotalApproximate: totalDurationMs === undefined || !!profile?.finishedAtApprox,
    };
}

function buildStepDrafts(
    events: IExecutionProgressEvent[],
    byResult: Map<string, IExecutionProgressEvent[]>,
    rootStarted: number,
    rootFinished: IExecutionProgressEvent | undefined,
    finished: boolean,
): IStepDraft[] {
    const children = collectChildren(events);
    const blendingInputIds = [...children.values()]
        .filter((child) => child.role === BLENDING_INPUT_ROLE)
        .map((child) => child.resultId);
    const isBlendingInput = (resultId: string) => blendingInputIds.includes(resultId);
    // the request of the blending inputs: their parent's CHILDREN_REQUESTED, even when the role
    // arrived only with a child's own events
    const federationRequested = events.find(
        (event) =>
            event.type === "CHILDREN_REQUESTED" &&
            (event.children ?? []).some((child) => isBlendingInput(child.resultId)),
    );

    const sqlStarts = events.filter((event) => event.type === "SQL_GENERATION_STARTED");
    const sqlFinishes = events.filter((event) => event.type === "SQL_GENERATION_FINISHED");
    const queryRequests = events.filter(
        (event) => event.type === "DATABASE_QUERY_REQUESTED" && !isBlendingInput(event.resultId),
    );
    const postprocessing = events.filter((event) => event.type === "POSTPROCESSING_STARTED");

    const drafts: IStepDraft[] = [];

    // the first milestone after the preparation, whichever comes first
    const milestones = [
        ...sqlStarts,
        ...queryRequests,
        ...postprocessing,
        ...(federationRequested ? [federationRequested] : []),
    ].map((event) => event.timestamp);
    drafts.push({
        kind: "preparing",
        startedAt: rootStarted,
        finishedAt: milestones.length > 0 ? Math.min(...milestones) : undefined,
    });

    if (sqlStarts.length > 0) {
        const allFinished = sqlStarts.every((start) =>
            sqlFinishes.some((end) => end.resultId === start.resultId),
        );
        drafts.push({
            kind: "sqlGeneration",
            startedAt: Math.min(...sqlStarts.map((event) => event.timestamp)),
            finishedAt: allFinished ? Math.max(...sqlFinishes.map((event) => event.timestamp)) : undefined,
            dataSourceId: sqlStarts.find((event) => event.dataSourceId)?.dataSourceId ?? undefined,
            dataSourceName: sqlStarts.find((event) => event.dataSourceName)?.dataSourceName ?? undefined,
        });
    }

    if (federationRequested) {
        const sources = blendingInputIds.map((resultId) =>
            buildSource(resultId, children.get(resultId), byResult.get(resultId) ?? []),
        );
        const allSettled = sources.length > 0 && sources.every((source) => source.finishedAt !== undefined);
        drafts.push({
            kind: "federation",
            startedAt: federationRequested.timestamp,
            finishedAt: allSettled ? Math.max(...sources.map((source) => source.finishedAt!)) : undefined,
            state: sources.some((source) => source.state === "failed") ? "failed" : undefined,
            sources,
            slowestSourceResultId: findSlowestSource(sources),
        });
    } else if (queryRequests.length > 0) {
        const queried = queryRequests.map((request) =>
            buildSource(
                request.resultId,
                {
                    dataSourceId: request.dataSourceId ?? children.get(request.resultId)?.dataSourceId,
                    dataSourceName: request.dataSourceName ?? children.get(request.resultId)?.dataSourceName,
                },
                byResult.get(request.resultId) ?? [],
            ),
        );
        const named = queried.find((source) => source.dataSourceId);
        const allSettled = queried.every((source) => source.finishedAt !== undefined);
        drafts.push({
            kind: "query",
            startedAt: Math.min(...queryRequests.map((event) => event.timestamp)),
            finishedAt: allSettled ? Math.max(...queried.map((source) => source.finishedAt!)) : undefined,
            state: queried.some((source) => source.state === "failed") ? "failed" : undefined,
            dataSourceId: named?.dataSourceId,
            dataSourceName: named?.dataSourceName,
            queryBreakdown:
                queryRequests.length === 1
                    ? computeQueryBreakdown(byResult.get(queryRequests[0].resultId) ?? [])
                    : undefined,
        });
    } else {
        // a child served from the raw cache never queries its data source
        const rawCacheHit = events.find(
            (event) => event.type === "FINISHED" && event.parentResultId && event.cacheHit === true,
        );
        if (rawCacheHit) {
            const childStarted = findEvent(byResult.get(rawCacheHit.resultId) ?? [], "STARTED");
            drafts.push({
                kind: "query",
                startedAt: childStarted?.timestamp ?? rawCacheHit.timestamp,
                finishedAt: rawCacheHit.timestamp,
                cacheHit: true,
                dataSourceId:
                    rawCacheHit.dataSourceId ?? children.get(rawCacheHit.resultId)?.dataSourceId ?? undefined,
                dataSourceName:
                    rawCacheHit.dataSourceName ??
                    children.get(rawCacheHit.resultId)?.dataSourceName ??
                    undefined,
            });
        } else if (!finished) {
            drafts.push({ kind: "query", placeholder: true });
        }
    }

    if (postprocessing.length > 0) {
        drafts.push({
            kind: "postprocessing",
            startedAt: Math.min(...postprocessing.map((event) => event.timestamp)),
            finishedAt: rootFinished?.timestamp,
            postprocessingTypes: unique(
                postprocessing.map((event) => event.postprocessingType).filter((type) => !!type) as string[],
            ),
        });
    } else if (!finished) {
        drafts.push({ kind: "postprocessing", placeholder: true });
    }

    return drafts.sort((a, b) => STEP_ORDER.indexOf(a.kind) - STEP_ORDER.indexOf(b.kind));
}

function resolveStepStates(
    drafts: IStepDraft[],
    phase: ExecutionProgressPhase,
    rootFinishedAt: number | undefined,
): IExecutionProgressStepViewModel[] {
    return drafts.map((draft, index) => {
        const { placeholder, ...step } = draft;
        if (placeholder || step.startedAt === undefined) {
            return { ...step, state: "pending" };
        }
        if (step.state === "failed") {
            return { ...step, state: "failed" };
        }
        if (step.finishedAt !== undefined) {
            return { ...step, state: "done" };
        }
        // a federation ends with its sources (or the root), not with a later step: the
        // post-processing of a source that finished early must not settle the others
        const sourcesUnsettled = step.sources?.some((source) => source.finishedAt === undefined) ?? false;
        const nextStart = sourcesUnsettled
            ? undefined
            : drafts
                  .slice(index + 1)
                  .map((next) => next.startedAt)
                  .find((startedAt) => startedAt !== undefined);
        if (nextStart !== undefined) {
            return { ...step, state: "done", finishedAt: nextStart };
        }
        if (phase === "failed") {
            return { ...step, state: "failed", finishedAt: rootFinishedAt };
        }
        if (phase === "finished") {
            return { ...step, state: "done", finishedAt: rootFinishedAt };
        }
        return { ...step, state: "running" };
    });
}

function buildSource(
    resultId: string,
    dataSource: { dataSourceId?: string | null; dataSourceName?: string | null } | undefined,
    events: IExecutionProgressEvent[],
): IExecutionProgressSourceViewModel {
    const requested = findEvent(events, "DATABASE_QUERY_REQUESTED");
    const started = findEvent(events, "STARTED");
    const dbStarted = findEvent(events, "DATABASE_QUERY_STARTED");
    const finished = findEvent(events, "FINISHED");
    const startedAt = requested?.timestamp ?? started?.timestamp;
    const state: ExecutionProgressStepState = finished
        ? finished.status === "failure"
            ? "failed"
            : "done"
        : startedAt === undefined
          ? "pending"
          : "running";

    return {
        resultId,
        dataSourceId:
            dataSource?.dataSourceId ?? events.find((event) => event.dataSourceId)?.dataSourceId ?? undefined,
        dataSourceName:
            dataSource?.dataSourceName ??
            events.find((event) => event.dataSourceName)?.dataSourceName ??
            undefined,
        state,
        startedAt,
        finishedAt: finished?.timestamp,
        queuedMs: computeQueuedMs(requested, dbStarted, finished),
        cacheHit: finished?.cacheHit === true,
    };
}

/**
 * The wait between the query request and the data source starting it. Only meaningful when it is
 * a real part of the query: positive and shorter than the whole request → finish span.
 */
function computeQueuedMs(
    requested: IExecutionProgressEvent | undefined,
    dbStarted: IExecutionProgressEvent | undefined,
    finished: IExecutionProgressEvent | undefined,
): number | undefined {
    if (!requested || !dbStarted) {
        return undefined;
    }
    const queuedMs = dbStarted.timestamp - requested.timestamp;
    const totalMs = finished ? finished.timestamp - requested.timestamp : undefined;
    if (queuedMs <= 0 || (totalMs !== undefined && queuedMs >= totalMs)) {
        return undefined;
    }
    return queuedMs;
}

const timingOf = (event: IExecutionProgressEvent, key: string): number | undefined => {
    const value = event.timing?.[key];
    return typeof value === "number" ? definedNumber(value) : undefined;
};

/**
 * Where the time of a finished query went, from the FINISHED timing (or the late milestone events):
 * waiting = query start − request, database = streaming start − query start, transfer = finish −
 * streaming start. Undefined until the query finished, for a raw cache hit, or when a milestone is
 * missing or out of order.
 */
function computeQueryBreakdown(
    events: IExecutionProgressEvent[],
): IExecutionProgressQueryBreakdown | undefined {
    const finished = findEvent(events, "FINISHED");
    if (!finished || finished.cacheHit === true || finished.status === "failure") {
        return undefined;
    }
    const requested =
        timingOf(finished, "databaseQueryRequested") ??
        findEvent(events, "DATABASE_QUERY_REQUESTED")?.timestamp;
    const queryStarted =
        timingOf(finished, "databaseQueryStarted") ?? findEvent(events, "DATABASE_QUERY_STARTED")?.timestamp;
    const streamingStarted =
        timingOf(finished, "databaseQueryResultsStreamingStarted") ??
        findEvent(events, "DATABASE_QUERY_RESULT_STREAMING_STARTED")?.timestamp;
    const end = finished.timestamp;
    if (requested === undefined || queryStarted === undefined || streamingStarted === undefined) {
        return undefined;
    }
    if (!(requested <= queryStarted && queryStarted <= streamingStarted && streamingStarted <= end)) {
        return undefined;
    }
    return {
        waitingMs: queryStarted - requested,
        databaseMs: streamingStarted - queryStarted,
        transferMs: end - streamingStarted,
    };
}

/**
 * While sources run, the one waited on is the running one that started first (it has been running
 * the longest). Once all settled, the one with the longest duration.
 */
function findSlowestSource(sources: IExecutionProgressSourceViewModel[]): string | undefined {
    const running = sources.filter((source) => source.state === "running" && source.startedAt !== undefined);
    if (running.length > 0) {
        return running.reduce((slowest, source) =>
            source.startedAt! < slowest.startedAt! ? source : slowest,
        ).resultId;
    }
    const settled = sources.filter(
        (source) => source.startedAt !== undefined && source.finishedAt !== undefined,
    );
    if (settled.length === 0) {
        return undefined;
    }
    return settled.reduce((slowest, source) =>
        source.finishedAt! - source.startedAt! > slowest.finishedAt! - slowest.startedAt! ? source : slowest,
    ).resultId;
}

interface IChildInfo {
    resultId: string;
    role?: string;
    dataSourceId?: string;
    dataSourceName?: string;
}

function collectChildren(events: IExecutionProgressEvent[]): Map<string, IChildInfo> {
    const children = new Map<string, IChildInfo>();
    events.forEach((event) => {
        const merge = (
            resultId: string,
            info: { role?: string | null; dataSourceId?: string | null; dataSourceName?: string | null },
        ) => {
            const known = children.get(resultId);
            children.set(resultId, {
                resultId,
                role: known?.role ?? info.role ?? undefined,
                dataSourceId: known?.dataSourceId ?? info.dataSourceId ?? undefined,
                dataSourceName: known?.dataSourceName ?? info.dataSourceName ?? undefined,
            });
        };
        (event.children ?? []).forEach((child) => merge(child.resultId, child));
        // a child's own events may carry its role and data source as well
        if (event.parentResultId) {
            merge(event.resultId, event);
        }
    });
    return children;
}

function groupByResult(events: IExecutionProgressEvent[]): Map<string, IExecutionProgressEvent[]> {
    const byResult = new Map<string, IExecutionProgressEvent[]>();
    events.forEach((event) => {
        const list = byResult.get(event.resultId) ?? [];
        list.push(event);
        byResult.set(event.resultId, list);
    });
    return byResult;
}

function findEvent(
    events: IExecutionProgressEvent[],
    type: IExecutionProgressEvent["type"],
): IExecutionProgressEvent | undefined {
    return events.find((event) => event.type === type);
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}

/**
 * What a cache hit saved compared to computing the result again:
 *
 * - `time` — the original total minus this load's time, when that is positive.
 * - `queries` — no meaningful time (this load's time unknown, or not faster): the data source
 *   queries that were not run.
 */
export type ExecutionCacheSaving =
    | { kind: "time"; savedMs: number; approximate: boolean }
    | { kind: "queries"; count: number };

export function computeCacheSaving(
    original: IExecutionProgressOriginalViewModel,
    thisLoadMs: number | undefined,
): ExecutionCacheSaving {
    if (original.originalTotalMs !== undefined && thisLoadMs !== undefined) {
        const savedMs = original.originalTotalMs - thisLoadMs;
        if (savedMs > 0) {
            return { kind: "time", savedMs, approximate: original.originalTotalApproximate };
        }
    }
    return { kind: "queries", count: Math.max(original.sources.length, 1) };
}
