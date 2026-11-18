// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import { buildMockExecutionProgressEvents } from "./execution_progress_mock.js";
import { type IExecutionProgressState, executionProgressInitialState } from "./execution_progress_state.js";
import { buildExecutionProgressViewModel } from "./execution_progress_view_model.js";

const T0 = 1_731_350_000_000;
/** client clock runs 2 s ahead of the server, events arrive 10 ms after they happen */
const CLOCK_OFFSET = 2_000;
const LATENCY = 10;

function stateWith(
    events: IExecutionProgressEvent[],
    overrides: Partial<IExecutionProgressState> = {},
): IExecutionProgressState {
    return {
        ...executionProgressInitialState,
        reportExecutionId: "report-execution",
        executionId: "mock-execution",
        source: "network",
        streamStatus: "streaming",
        reportStartedAt: T0 + CLOCK_OFFSET,
        events: events.map((event) => ({
            event,
            receivedAt: event.timestamp + CLOCK_OFFSET + LATENCY,
        })),
        ...overrides,
    };
}

/** the events the stream delivered until `at` ms after the execution started */
const eventsUntil = (events: IExecutionProgressEvent[], at: number) =>
    events.filter((event) => event.timestamp <= T0 + at);

/** a hand-built progress event of one computation, `at` ms after T0 */
function progressEvent(
    seq: number,
    type: IExecutionProgressEvent["type"],
    resultId: string,
    at: number,
    extra: Partial<IExecutionProgressEvent> = {},
): IExecutionProgressEvent {
    return {
        seq,
        executionId: "mock-execution",
        resultId,
        parentResultId: resultId === "root" ? null : "root",
        type,
        timestamp: T0 + at,
        ...extra,
    };
}

/** a federation of two blending inputs: `a` finished (with its own post-processing), `b` still queries */
function federationEvents(withRolesOnDescriptors: boolean): IExecutionProgressEvent[] {
    const role = withRolesOnDescriptors ? "blendingInput" : null;
    return [
        progressEvent(1, "STARTED", "root", 0),
        progressEvent(2, "CHILDREN_REQUESTED", "root", 100, {
            children: [
                { resultId: "a", role, dataSourceId: "ds-a" },
                { resultId: "b", role, dataSourceId: "ds-b" },
            ],
        }),
        progressEvent(3, "STARTED", "a", 110, { role: "blendingInput" }),
        progressEvent(4, "STARTED", "b", 110, { role: "blendingInput" }),
        progressEvent(5, "DATABASE_QUERY_REQUESTED", "a", 120, { role: "blendingInput" }),
        progressEvent(6, "DATABASE_QUERY_REQUESTED", "b", 120, { role: "blendingInput" }),
        progressEvent(7, "POSTPROCESSING_STARTED", "a", 250, { postprocessingType: "XTAB" }),
        progressEvent(8, "FINISHED", "a", 300, { status: "success" }),
    ];
}

const stepStates = (state: IExecutionProgressState) =>
    buildExecutionProgressViewModel(state).steps.map((step) => [step.kind, step.state]);

describe("buildExecutionProgressViewModel", () => {
    describe("fresh execution against one data source", () => {
        const events = buildMockExecutionProgressEvents("fresh", T0);

        it("is waiting before any event arrived", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith([]));

            expect(viewModel.phase).toBe("waiting");
            expect(viewModel.hasEvents).toBe(false);
            expect(viewModel.unavailable).toBe(false);
            expect(viewModel.steps).toEqual([]);
        });

        it("shows the preparation running and the remaining steps pending", () => {
            expect(stepStates(stateWith(eventsUntil(events, 50)))).toEqual([
                ["preparing", "running"],
                ["query", "pending"],
                ["postprocessing", "pending"],
            ]);
        });

        it("shows the SQL generation running", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(eventsUntil(events, 200)));

            expect(viewModel.phase).toBe("running");
            expect(viewModel.steps.map((step) => [step.kind, step.state])).toEqual([
                ["preparing", "done"],
                ["sqlGeneration", "running"],
                ["query", "pending"],
                ["postprocessing", "pending"],
            ]);
            expect(viewModel.steps[0]).toMatchObject({ startedAt: T0, finishedAt: T0 + 120 });
        });

        it("shows the query of the data source running", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(eventsUntil(events, 1000)));

            expect(viewModel.steps.map((step) => [step.kind, step.state])).toEqual([
                ["preparing", "done"],
                ["sqlGeneration", "done"],
                ["query", "running"],
                ["postprocessing", "pending"],
            ]);
            expect(viewModel.steps[2]).toMatchObject({ dataSourceId: "demo-ds", startedAt: T0 + 470 });
        });

        it("derives the server clock offset from the arrivals", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(eventsUntil(events, 1000)));

            expect(viewModel.clockOffsetMs).toBe(CLOCK_OFFSET + LATENCY);
        });

        it("finishes every step once the root computation finished", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.phase).toBe("finished");
            expect(viewModel.cacheHit).toBe(false);
            expect(viewModel.finishedAt).toBe(T0 + 3900);
            expect(viewModel.steps.map((step) => [step.kind, step.state])).toEqual([
                ["preparing", "done"],
                ["sqlGeneration", "done"],
                ["query", "done"],
                ["postprocessing", "done"],
            ]);
            expect(viewModel.steps[2]).toMatchObject({
                startedAt: T0 + 470,
                finishedAt: T0 + 3520,
                dataSourceId: "demo-ds",
                dataSourceName: "Demo PostgreSQL",
                // request → query start → streaming start → finish: adds up to the step's 3050 ms
                queryBreakdown: { waitingMs: 130, databaseMs: 2880, transferMs: 40 },
            });
            expect(viewModel.steps[3]).toMatchObject({
                postprocessingTypes: ["XTAB"],
                finishedAt: T0 + 3900,
            });
        });
    });

    describe("federated execution", () => {
        const events = buildMockExecutionProgressEvents("federation", T0);

        it("shows one entry per data source and waits on the longest running one", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(eventsUntil(events, 1500)));
            const federation = viewModel.steps.find((step) => step.kind === "federation");

            expect(viewModel.steps.map((step) => step.kind)).toEqual([
                "preparing",
                "sqlGeneration",
                "federation",
                "postprocessing",
            ]);
            expect(federation?.state).toBe("running");
            expect(federation?.sources?.map((source) => [source.dataSourceId, source.state])).toEqual([
                ["postgres-sales", "running"],
                ["snowflake-dwh", "running"],
                ["gdstorage-csv", "done"],
            ]);
            // postgres was requested first among the running ones
            expect(federation?.slowestSourceResultId).toBe("input-postgres");
        });

        it("is detected when the roles arrive only with the children's own events", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(federationEvents(false)));
            const federation = viewModel.steps.find((step) => step.kind === "federation");

            expect(federation?.startedAt).toBe(T0 + 100);
            expect(federation?.sources?.map((source) => [source.resultId, source.dataSourceId])).toEqual([
                ["a", "ds-a"],
                ["b", "ds-b"],
            ]);
        });

        it("keeps running while a data source queries, despite a finished source's post-processing", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(federationEvents(true)));
            const federation = viewModel.steps.find((step) => step.kind === "federation");

            expect(federation?.state).toBe("running");
            expect(federation?.finishedAt).toBeUndefined();
        });

        it("marks the slowest data source once all of them finished", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));
            const federation = viewModel.steps.find((step) => step.kind === "federation");

            expect(viewModel.phase).toBe("finished");
            expect(federation).toMatchObject({
                state: "done",
                startedAt: T0 + 680,
                finishedAt: T0 + 5200,
                slowestSourceResultId: "input-snowflake",
            });
            expect(federation?.sources?.every((source) => source.state === "done")).toBe(true);
            // queued = request → data source start, from the late DATABASE_QUERY_STARTED timestamps
            expect(federation?.sources?.map((source) => [source.dataSourceId, source.queuedMs])).toEqual([
                ["postgres-sales", 60],
                ["snowflake-dwh", 780],
                ["gdstorage-csv", 5],
            ]);
            expect(viewModel.steps.find((step) => step.kind === "postprocessing")).toMatchObject({
                state: "done",
                postprocessingTypes: ["DATA_BLENDING", "XTAB"],
            });
        });
    });

    describe("query breakdown", () => {
        const events = buildMockExecutionProgressEvents("fresh", T0);
        const queryStep = (state: IExecutionProgressState) =>
            buildExecutionProgressViewModel(state).steps.find((step) => step.kind === "query");

        it("is not shown while the query runs", () => {
            expect(queryStep(stateWith(eventsUntil(events, 3490)))?.queryBreakdown).toBeUndefined();
        });

        it("falls back to the milestone events without the FINISHED timing", () => {
            const withoutTiming = events.map((event) =>
                event.type === "FINISHED" ? { ...event, timing: null } : event,
            );

            expect(queryStep(stateWith(withoutTiming, { streamStatus: "done" }))?.queryBreakdown).toEqual({
                waitingMs: 130,
                databaseMs: 2880,
                transferMs: 40,
            });
        });

        it("is dropped when the milestones are out of order", () => {
            const outOfOrder = events.map((event) =>
                event.type === "FINISHED" && event.parentResultId
                    ? {
                          ...event,
                          timing: { ...event.timing, databaseQueryResultsStreamingStarted: T0 + 500 },
                      }
                    : event,
            );

            expect(
                queryStep(stateWith(outOfOrder, { streamStatus: "done" }))?.queryBreakdown,
            ).toBeUndefined();
        });

        it("is not shown for a query served from the raw cache", () => {
            const rawCache = events
                .filter((event) => event.timestamp <= T0 + 90)
                .concat([
                    {
                        seq: 100,
                        executionId: "mock-execution",
                        resultId: "main-afm",
                        parentResultId: "root-xtab",
                        type: "FINISHED",
                        timestamp: T0 + 140,
                        status: "success",
                        cacheHit: true,
                    },
                ]);

            expect(queryStep(stateWith(rawCache))).toMatchObject({
                cacheHit: true,
                dataSourceName: "Demo PostgreSQL",
            });
            expect(queryStep(stateWith(rawCache))?.queryBreakdown).toBeUndefined();
        });
    });

    it("names the federated data sources", () => {
        const events = buildMockExecutionProgressEvents("federation", T0);
        const federation = buildExecutionProgressViewModel(
            stateWith(events, { streamStatus: "done" }),
        ).steps.find((step) => step.kind === "federation");

        expect(federation?.sources?.map((source) => [source.dataSourceId, source.dataSourceName])).toEqual([
            ["postgres-sales", "Sales (PostgreSQL)"],
            ["snowflake-dwh", "Data warehouse (Snowflake)"],
            ["gdstorage-csv", "CSV uploads"],
        ]);
    });

    describe("cache hit", () => {
        it("shows the result served from the backend cache without any step", () => {
            const events = buildMockExecutionProgressEvents("cacheHit", T0);
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel).toMatchObject({
                phase: "finished",
                cacheHit: true,
                startedAt: T0,
                finishedAt: T0 + 18,
                steps: [],
            });
        });

        it("shows how the cached result was originally computed", () => {
            const events = buildMockExecutionProgressEvents("cacheHit", T0);
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.original).toEqual({
                computedAt: T0 - 2 * 60 * 60 * 1000,
                totalDurationMs: 3700,
                totalApproximate: false,
                sources: [
                    {
                        dataSourceId: "postgres-sales",
                        dataSourceName: "Sales (PostgreSQL)",
                        queryingMs: 3320,
                        dbDurationMs: 3100,
                        totalDurationMs: 3200,
                        rows: 42,
                    },
                    {
                        dataSourceId: "gdstorage-csv",
                        dataSourceName: "CSV uploads",
                        // cached before the querying time was recorded: the query + upload
                        queryingMs: 400,
                        dbDurationMs: 350,
                        totalDurationMs: 400,
                        rows: 12,
                    },
                ],
                // the whole original computation, not only its slowest query
                originalTotalMs: 3700,
                originalTotalApproximate: false,
            });
        });

        it("lists the slowest original data source first and tolerates missing fields", () => {
            const events = buildMockExecutionProgressEvents("cacheHitNoProfile", T0).map(
                (event): IExecutionProgressEvent =>
                    event.type === "CACHE_HIT"
                        ? {
                              ...event,
                              profile: {
                                  v: 1,
                                  sources: [
                                      { dataSourceId: "fast", totalDurationMs: 100 },
                                      { dataSourceId: null, rows: 5 },
                                      { dataSourceId: "slow", totalDurationMs: 900 },
                                  ],
                              },
                          }
                        : event,
            );
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.original?.computedAt).toBeUndefined();
            expect(viewModel.original?.sources.map((source) => source.dataSourceId)).toEqual([
                "slow",
                "fast",
                undefined,
            ]);
            expect(viewModel.original?.originalTotalMs).toBe(900);
        });

        it("shows the original end-to-end time of a profile without sources", () => {
            const events = buildMockExecutionProgressEvents("cacheHitNoProfile", T0).map(
                (event): IExecutionProgressEvent =>
                    event.type === "CACHE_HIT"
                        ? {
                              ...event,
                              profile: {
                                  v: 1,
                                  totalDurationMs: 680,
                                  finishedAtApprox: "postprocessingStarted",
                              },
                          }
                        : event,
            );
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.original).toEqual({
                totalDurationMs: 680,
                totalApproximate: true,
                sources: [],
                originalTotalMs: 680,
                originalTotalApproximate: true,
            });
        });

        it("has no original computation without a profile", () => {
            const events = buildMockExecutionProgressEvents("cacheHitNoProfile", T0);
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.cacheHit).toBe(true);
            expect(viewModel.original).toBeUndefined();
        });

        it("has no original computation for a profile without sources", () => {
            const events = buildMockExecutionProgressEvents("cacheHitNoProfile", T0).map((event) =>
                event.type === "CACHE_HIT"
                    ? { ...event, profile: { v: 1, computedAt: T0, sources: [] } }
                    : event,
            );

            expect(
                buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" })).original,
            ).toBeUndefined();
        });

        it("is a cache hit as soon as CACHE_HIT arrived", () => {
            const events = buildMockExecutionProgressEvents("cacheHit", T0);
            const viewModel = buildExecutionProgressViewModel(stateWith(eventsUntil(events, 15)));

            expect(viewModel.cacheHit).toBe(true);
            expect(viewModel.phase).toBe("running");
        });

        it("shows the result served from the browser cache", () => {
            const viewModel = buildExecutionProgressViewModel(
                stateWith([], { source: "browserCache", streamStatus: "done", reportFinishedAt: T0 + 5 }),
            );

            expect(viewModel).toMatchObject({
                phase: "finished",
                source: "browserCache",
                unavailable: false,
                cacheHit: false,
                steps: [],
            });
        });

        it("shows a query served from the raw cache", () => {
            const events = buildMockExecutionProgressEvents("fresh", T0)
                .filter((event) => event.timestamp <= T0 + 90)
                .concat([
                    {
                        seq: 100,
                        executionId: "mock-execution",
                        resultId: "main-afm",
                        parentResultId: "root-xtab",
                        type: "FINISHED",
                        timestamp: T0 + 140,
                        status: "success",
                        cacheHit: true,
                    },
                ]);
            const viewModel = buildExecutionProgressViewModel(stateWith(events));

            expect(viewModel.cacheHit).toBe(false);
            expect(viewModel.steps.find((step) => step.kind === "query")).toMatchObject({
                state: "done",
                cacheHit: true,
                startedAt: T0 + 90,
                finishedAt: T0 + 140,
            });
        });
    });

    describe("failure", () => {
        it("fails the running step when the root computation failed", () => {
            const events = buildMockExecutionProgressEvents("failure", T0);
            const viewModel = buildExecutionProgressViewModel(stateWith(events, { streamStatus: "done" }));

            expect(viewModel.phase).toBe("failed");
            expect(viewModel.steps.map((step) => [step.kind, step.state])).toEqual([
                ["preparing", "done"],
                ["sqlGeneration", "done"],
                ["query", "failed"],
            ]);
        });

        it("is unavailable when the stream failed before any event", () => {
            const viewModel = buildExecutionProgressViewModel(stateWith([], { streamStatus: "failed" }));

            expect(viewModel.unavailable).toBe(true);
            expect(viewModel.hasEvents).toBe(false);
        });

        it("keeps the received progress but is unavailable when the stream failed later", () => {
            const events = buildMockExecutionProgressEvents("fresh", T0);
            const viewModel = buildExecutionProgressViewModel(
                stateWith(eventsUntil(events, 1000), { streamStatus: "failed" }),
            );

            expect(viewModel.unavailable).toBe(true);
            expect(viewModel.hasEvents).toBe(true);
            expect(viewModel.phase).toBe("running");
            expect(viewModel.steps.length).toBeGreaterThan(0);
        });
    });
});
