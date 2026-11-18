// (C) 2026 GoodData Corporation

import { type IComputationProfile, type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import { IS_DEBUG } from "../../buildParams.js";

/**
 * Mocked execution progress streams following the backend contract — to develop and demo the
 * progress panel without the backend endpoint. Also the fixtures of the view model tests.
 *
 * Enable in the browser with `?executionProgressMock=<scenario>` in the URL or
 * `localStorage.executionProgressMock = "<scenario>"`.
 */
export type ExecutionProgressMockScenario =
    | "fresh"
    | "federation"
    | "cacheHit"
    | "cacheHitNoProfile"
    | "failure";

const SCENARIOS: ExecutionProgressMockScenario[] = [
    "fresh",
    "federation",
    "cacheHit",
    "cacheHitNoProfile",
    "failure",
];

type MockEvent = Omit<IExecutionProgressEvent, "seq" | "executionId" | "timestamp" | "profile"> & {
    /** the profile of a cache hit, with times in ms relative to the execution start */
    profile?: IComputationProfile;
    /** ms since the execution started when the event is sent */
    at: number;
    /** ms since the execution started the event happened, when it is sent late (default `at`) */
    happenedAt?: number;
};

const ROOT = "root-xtab";
const MAIN = "main-afm";

function freshScenario(): MockEvent[] {
    return [
        { at: 0, resultId: ROOT, parentResultId: null, type: "STARTED" },
        { at: 20, resultId: ROOT, parentResultId: null, type: "PREPROCESSING_STARTED" },
        {
            at: 80,
            resultId: ROOT,
            parentResultId: null,
            type: "CHILDREN_REQUESTED",
            children: [
                { resultId: MAIN, role: "main", dataSourceId: "demo-ds", dataSourceName: "Demo PostgreSQL" },
            ],
        },
        { at: 90, resultId: MAIN, parentResultId: ROOT, role: "main", type: "STARTED" },
        {
            at: 120,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "SQL_GENERATION_STARTED",
            dataSourceId: "demo-ds",
            dataSourceName: "Demo PostgreSQL",
        },
        {
            at: 450,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "SQL_GENERATION_FINISHED",
            dataSourceId: "demo-ds",
            dataSourceName: "Demo PostgreSQL",
        },
        {
            at: 470,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "DATABASE_QUERY_REQUESTED",
            dataSourceId: "demo-ds",
            dataSourceName: "Demo PostgreSQL",
        },
        // the late timestamps arrive together with the child's FINISHED
        {
            at: 3500,
            happenedAt: 600,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "DATABASE_QUERY_STARTED",
            dataSourceId: "demo-ds",
            dataSourceName: "Demo PostgreSQL",
        },
        {
            at: 3505,
            happenedAt: 3480,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "DATABASE_QUERY_RESULT_STREAMING_STARTED",
        },
        {
            at: 3520,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "FINISHED",
            status: "success",
            cacheHit: false,
            rows: 120,
            columns: 4,
            // relative times, shifted to absolute ones like the timestamps
            timing: {
                started: 90,
                databaseQueryRequested: 470,
                databaseQueryStarted: 600,
                databaseQueryResultsStreamingStarted: 3480,
                finished: 3520,
            },
        },
        {
            at: 3540,
            resultId: ROOT,
            parentResultId: null,
            type: "POSTPROCESSING_STARTED",
            postprocessingType: "XTAB",
        },
        {
            at: 3900,
            resultId: ROOT,
            parentResultId: null,
            type: "FINISHED",
            status: "success",
            cacheHit: false,
            rows: 30,
            columns: 4,
        },
    ];
}

const FEDERATION_INPUTS = [
    {
        resultId: "input-postgres",
        dataSourceId: "postgres-sales",
        dataSourceName: "Sales (PostgreSQL)",
        requested: 700,
        dbStarted: 760,
        finished: 1900,
    },
    {
        resultId: "input-snowflake",
        dataSourceId: "snowflake-dwh",
        dataSourceName: "Data warehouse (Snowflake)",
        requested: 720,
        dbStarted: 1500,
        finished: 5200,
    },
    {
        resultId: "input-csv",
        dataSourceId: "gdstorage-csv",
        dataSourceName: "CSV uploads",
        requested: 730,
        dbStarted: 735,
        finished: 1100,
    },
];

function federationScenario(): MockEvent[] {
    const inputs = FEDERATION_INPUTS;
    return [
        { at: 0, resultId: ROOT, parentResultId: null, type: "STARTED" },
        { at: 20, resultId: ROOT, parentResultId: null, type: "PREPROCESSING_STARTED" },
        {
            at: 60,
            resultId: ROOT,
            parentResultId: null,
            type: "CHILDREN_REQUESTED",
            children: [{ resultId: MAIN, role: "main" }],
        },
        { at: 70, resultId: MAIN, parentResultId: ROOT, role: "main", type: "STARTED" },
        {
            at: 100,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "SQL_GENERATION_STARTED",
            dataSourceId: "postgres-sales",
        },
        {
            at: 650,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "SQL_GENERATION_FINISHED",
            dataSourceId: "postgres-sales",
        },
        {
            at: 680,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "CHILDREN_REQUESTED",
            children: inputs.map(({ resultId, dataSourceId, dataSourceName }) => ({
                resultId,
                dataSourceId,
                dataSourceName,
                role: "blendingInput",
            })),
        },
        ...inputs.flatMap(({ resultId, dataSourceId, requested, dbStarted, finished }): MockEvent[] => [
            {
                at: requested,
                resultId,
                parentResultId: MAIN,
                role: "blendingInput",
                type: "DATABASE_QUERY_REQUESTED",
                dataSourceId,
            },
            // the backend sends the query start late, together with the input's FINISHED
            {
                at: finished - 1,
                happenedAt: dbStarted,
                resultId,
                parentResultId: MAIN,
                type: "DATABASE_QUERY_STARTED",
                dataSourceId,
            },
            {
                at: finished,
                resultId,
                parentResultId: MAIN,
                type: "FINISHED",
                status: "success",
                cacheHit: false,
            },
        ]),
        {
            at: 5220,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "POSTPROCESSING_STARTED",
            postprocessingType: "DATA_BLENDING",
        },
        { at: 5600, resultId: MAIN, parentResultId: ROOT, type: "FINISHED", status: "success" },
        {
            at: 5620,
            resultId: ROOT,
            parentResultId: null,
            type: "POSTPROCESSING_STARTED",
            postprocessingType: "XTAB",
        },
        { at: 5800, resultId: ROOT, parentResultId: null, type: "FINISHED", status: "success" },
    ];
}

const HOUR = 60 * 60 * 1000;

/** the cached result was computed 2 hours ago, querying two data sources */
function cachedProfile(): IComputationProfile {
    const computedAt = -2 * HOUR;
    return {
        v: 1,
        computedAt,
        startedAt: computedAt - 3700,
        finishedAt: computedAt,
        totalDurationMs: 3700,
        sources: [
            {
                resultId: "input-postgres",
                dataSourceId: "postgres-sales",
                dataSourceName: "Sales (PostgreSQL)",
                queryRequestedAt: computedAt - 3400,
                queryStartedAt: computedAt - 3300,
                streamingStartedAt: computedAt - 200,
                finishedAt: computedAt - 100,
                dbDurationMs: 3100,
                totalDurationMs: 3200,
                queryFinishedAt: computedAt - 80,
                queryDurationMs: 3320,
                rows: 42,
            },
            {
                resultId: "input-csv",
                dataSourceId: "gdstorage-csv",
                dataSourceName: "CSV uploads",
                queryStartedAt: computedAt - 900,
                finishedAt: computedAt - 500,
                dbDurationMs: 350,
                totalDurationMs: 400,
                rows: 12,
            },
        ],
    };
}

function cacheHitScenario(): MockEvent[] {
    return cacheHitNoProfileScenario().map((event) =>
        event.type === "CACHE_HIT" ? { ...event, profile: cachedProfile() } : event,
    );
}

function cacheHitNoProfileScenario(): MockEvent[] {
    return [
        { at: 0, resultId: ROOT, parentResultId: null, type: "STARTED" },
        { at: 15, resultId: ROOT, parentResultId: null, type: "CACHE_HIT" },
        {
            at: 18,
            resultId: ROOT,
            parentResultId: null,
            type: "FINISHED",
            status: "success",
            cacheHit: true,
            rows: 30,
            columns: 4,
        },
    ];
}

function failureScenario(): MockEvent[] {
    return [
        ...freshScenario().filter((event) => event.at <= 470),
        {
            at: 2100,
            resultId: MAIN,
            parentResultId: ROOT,
            type: "FINISHED",
            status: "failure",
            errorType: "DATA_SOURCE_ERROR",
        },
        {
            at: 2110,
            resultId: ROOT,
            parentResultId: null,
            type: "FINISHED",
            status: "failure",
            errorType: "DATA_SOURCE_ERROR",
        },
    ];
}

const SCENARIO_BUILDERS: Record<ExecutionProgressMockScenario, () => MockEvent[]> = {
    fresh: freshScenario,
    federation: federationScenario,
    cacheHit: cacheHitScenario,
    cacheHitNoProfile: cacheHitNoProfileScenario,
    failure: failureScenario,
};

interface IScheduledMockEvent {
    /** ms since the execution started when the event is sent */
    sendAt: number;
    event: IExecutionProgressEvent;
}

function buildMockSchedule(
    scenario: ExecutionProgressMockScenario,
    startTime: number,
    executionId: string,
): IScheduledMockEvent[] {
    return SCENARIO_BUILDERS[scenario]()
        .sort((a, b) => a.at - b.at)
        .map(({ at, happenedAt, profile, timing, ...event }, index) => ({
            sendAt: at,
            event: {
                ...event,
                ...(timing
                    ? {
                          timing: Object.fromEntries(
                              Object.entries(timing).map(([key, value]) => [
                                  key,
                                  typeof value === "number" ? startTime + value : value,
                              ]),
                          ),
                      }
                    : {}),
                ...(profile ? { profile: shiftProfile(profile, startTime) } : {}),
                seq: index + 1,
                executionId,
                timestamp: startTime + (happenedAt ?? at),
            },
        }));
}

const shift = (value: number | null | undefined, startTime: number) =>
    typeof value === "number" ? startTime + value : value;

function shiftProfile(profile: IComputationProfile, startTime: number): IComputationProfile {
    return {
        ...profile,
        computedAt: shift(profile.computedAt, startTime),
        startedAt: shift(profile.startedAt, startTime),
        finishedAt: shift(profile.finishedAt, startTime),
        sources: profile.sources?.map((source) => ({
            ...source,
            queryRequestedAt: shift(source.queryRequestedAt, startTime),
            queryFinishedAt: shift(source.queryFinishedAt, startTime),
            queryStartedAt: shift(source.queryStartedAt, startTime),
            streamingStartedAt: shift(source.streamingStartedAt, startTime),
            finishedAt: shift(source.finishedAt, startTime),
        })),
    };
}

/**
 * The events of a scenario in the order the backend sends them, with absolute timestamps from
 * `startTime`.
 */
export function buildMockExecutionProgressEvents(
    scenario: ExecutionProgressMockScenario,
    startTime: number,
    executionId = "mock-execution",
): IExecutionProgressEvent[] {
    return buildMockSchedule(scenario, startTime, executionId).map(({ event }) => event);
}

function readMockScenario(): ExecutionProgressMockScenario | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }
    let value: string | null = null;
    try {
        value =
            new URLSearchParams(window.location.search).get("executionProgressMock") ??
            window.localStorage?.getItem("executionProgressMock") ??
            null;
    } catch {
        return undefined;
    }
    return SCENARIOS.find((scenario) => scenario === value);
}

/**
 * The profile the backend stores with the result of a scenario (how it was computed), as served by
 * the result metadata; null when none is stored. Times in absolute ms from `startTime`.
 */
export function buildMockComputationProfile(
    scenario: ExecutionProgressMockScenario,
    startTime: number,
): IComputationProfile | null {
    switch (scenario) {
        case "cacheHit":
            return shiftProfile(cachedProfile(), startTime);
        case "fresh":
            return shiftProfile(
                {
                    v: 1,
                    computedAt: 3900,
                    startedAt: 0,
                    finishedAt: 3900,
                    totalDurationMs: 3900,
                    sources: [
                        {
                            resultId: MAIN,
                            dataSourceId: "demo-ds",
                            dataSourceName: "Demo PostgreSQL",
                            queryRequestedAt: 470,
                            queryStartedAt: 600,
                            streamingStartedAt: 3480,
                            finishedAt: 3520,
                            dbDurationMs: 2880,
                            totalDurationMs: 2920,
                            queryFinishedAt: 3520,
                            queryDurationMs: 3050,
                            rows: 120,
                        },
                    ],
                },
                startTime,
            );
        case "federation":
            return shiftProfile(
                {
                    v: 1,
                    computedAt: 5800,
                    startedAt: 0,
                    finishedAt: 5800,
                    totalDurationMs: 5800,
                    sources: FEDERATION_INPUTS.map(
                        ({ resultId, dataSourceId, dataSourceName, requested, dbStarted, finished }) => ({
                            resultId,
                            dataSourceId,
                            dataSourceName,
                            queryRequestedAt: requested,
                            queryStartedAt: dbStarted,
                            finishedAt: finished,
                            dbDurationMs: finished - dbStarted - 20,
                            totalDurationMs: finished - dbStarted,
                            queryFinishedAt: finished,
                            queryDurationMs: finished - requested,
                            rows: 100,
                        }),
                    ),
                },
                startTime,
            );
        default:
            return null;
    }
}

export interface IExecutionProgressMock {
    stream: (signal: AbortSignal) => ReadableStream<IExecutionProgressEvent>;
    /** the stored profile of the result, as the result metadata serves it */
    loadComputationProfile: () => Promise<IComputationProfile | null>;
}

/**
 * The mocked stream opener and result metadata when a mock scenario is enabled, otherwise
 * undefined. The events are emitted at their scenario times, so the panel animates like with the
 * real backend.
 */
export function getExecutionProgressMock(): IExecutionProgressMock | undefined {
    // development builds only, like the other debug tools (see backend.ts)
    if (!IS_DEBUG) {
        return undefined;
    }
    const scenario = readMockScenario();
    if (!scenario) {
        return undefined;
    }
    let startTime = Date.now();
    return {
        loadComputationProfile: () =>
            new Promise((resolve) =>
                setTimeout(() => resolve(buildMockComputationProfile(scenario, startTime)), 300),
            ),
        stream: (signal) => {
            startTime = Date.now();
            const schedule = buildMockSchedule(scenario, startTime, "mock-execution");
            const timers: ReturnType<typeof setTimeout>[] = [];
            return new ReadableStream<IExecutionProgressEvent>({
                start(controller) {
                    const stop = () => timers.forEach((timer) => clearTimeout(timer));
                    signal.addEventListener("abort", stop);
                    schedule.forEach(({ sendAt, event }, index) => {
                        timers.push(
                            setTimeout(() => {
                                controller.enqueue(event);
                                if (index === schedule.length - 1) {
                                    controller.close();
                                }
                            }, sendAt),
                        );
                    });
                },
                cancel() {
                    timers.forEach((timer) => clearTimeout(timer));
                },
            });
        },
    };
}
