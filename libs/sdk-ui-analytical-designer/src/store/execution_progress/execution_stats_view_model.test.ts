// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import {
    type ExecutionProgressMockScenario,
    buildMockComputationProfile,
    buildMockExecutionProgressEvents,
} from "./execution_progress_mock.js";
import { type IExecutionProgressState, executionProgressInitialState } from "./execution_progress_state.js";
import { buildExecutionStatsViewModel } from "./execution_stats_view_model.js";

const T0 = 1_731_350_000_000;
const CLOCK_OFFSET = 2_000;
const HOUR = 60 * 60 * 1000;

function settledState(
    events: IExecutionProgressEvent[],
    overrides: Partial<IExecutionProgressState> = {},
): IExecutionProgressState {
    const lastTimestamp = events.length > 0 ? events[events.length - 1].timestamp : T0;
    return {
        ...executionProgressInitialState,
        reportExecutionId: "report-execution",
        executionId: "mock-execution",
        resultId: "result",
        source: "network",
        streamStatus: "done",
        reportStartedAt: T0 + CLOCK_OFFSET - 30,
        reportFinishedAt: lastTimestamp + CLOCK_OFFSET + 50,
        events: events.map((event) => ({ event, receivedAt: event.timestamp + CLOCK_OFFSET + 10 })),
        ...overrides,
    };
}

const scenarioState = (
    scenario: ExecutionProgressMockScenario,
    overrides?: Partial<IExecutionProgressState>,
) => settledState(buildMockExecutionProgressEvents(scenario, T0), overrides);

const loaded = (scenario: ExecutionProgressMockScenario): Partial<IExecutionProgressState> => ({
    storedProfile: { status: "loaded", profile: buildMockComputationProfile(scenario, T0) },
});

describe("buildExecutionStatsViewModel", () => {
    it("is not available before a report execution settled", () => {
        expect(buildExecutionStatsViewModel(executionProgressInitialState).available).toBe(false);
        expect(
            buildExecutionStatsViewModel(scenarioState("fresh", { reportFinishedAt: null })).available,
        ).toBe(false);
    });

    describe("fresh computation", () => {
        it("tells the computation time and keeps the steps of the load", () => {
            const stats = buildExecutionStatsViewModel(scenarioState("fresh"));

            expect(stats).toMatchObject({
                available: true,
                reportExecutionId: "report-execution",
                load: "fresh",
                // a fresh load is its own original computation
                showsOriginal: false,
                failed: false,
                totalMs: 3900,
                original: { status: "idle" },
            });
            expect(stats.progress.steps.map((step) => [step.kind, step.state])).toEqual([
                ["preparing", "done"],
                ["sqlGeneration", "done"],
                ["query", "done"],
                ["postprocessing", "done"],
            ]);
        });

        it("shows the stored profile once loaded", () => {
            const stats = buildExecutionStatsViewModel(scenarioState("fresh", loaded("fresh")));

            expect(stats.original).toEqual({
                status: "loaded",
                computation: {
                    computedAt: T0 + 3900,
                    totalDurationMs: 3900,
                    totalApproximate: false,
                    sources: [
                        {
                            dataSourceId: "demo-ds",
                            dataSourceName: "Demo PostgreSQL",
                            queryingMs: 3050,
                            dbDurationMs: 2880,
                            totalDurationMs: 2920,
                            rows: 120,
                        },
                    ],
                    originalTotalMs: 3900,
                    originalTotalApproximate: false,
                },
            });
        });

        it("is loading while the stored profile loads", () => {
            const stats = buildExecutionStatsViewModel(
                scenarioState("fresh", { storedProfile: { status: "loading", profile: null } }),
            );

            expect(stats.original).toEqual({ status: "loading" });
        });
    });

    describe("federated computation", () => {
        it("keeps one entry per data source and lists the slowest original source first", () => {
            const stats = buildExecutionStatsViewModel(scenarioState("federation", loaded("federation")));
            const federation = stats.progress.steps.find((step) => step.kind === "federation");

            expect(stats.load).toBe("fresh");
            expect(stats.totalMs).toBe(5800);
            expect(federation?.sources?.map((source) => source.dataSourceId)).toEqual([
                "postgres-sales",
                "snowflake-dwh",
                "gdstorage-csv",
            ]);
            expect(federation?.slowestSourceResultId).toBe("input-snowflake");
            // slowest overall querying first: requested → finished
            expect(
                stats.original.computation?.sources.map((source) => [source.dataSourceId, source.queryingMs]),
            ).toEqual([
                ["snowflake-dwh", 4480],
                ["postgres-sales", 1200],
                ["gdstorage-csv", 370],
            ]);
            expect(stats.original.computation?.originalTotalMs).toBe(5800);
        });
    });

    describe("cache hit", () => {
        it("tells the load from cache and its original computation from the stored profile", () => {
            const stats = buildExecutionStatsViewModel(scenarioState("cacheHit", loaded("cacheHit")));

            expect(stats).toMatchObject({ load: "cacheHit", totalMs: 18, showsOriginal: true });
            expect(stats.progress.steps).toEqual([]);
            expect(stats.original).toMatchObject({
                status: "loaded",
                computation: { computedAt: T0 - 2 * HOUR, totalDurationMs: 3700, originalTotalMs: 3700 },
            });
        });

        it("takes the original computation from the cache hit event before the metadata loaded", () => {
            const stats = buildExecutionStatsViewModel(scenarioState("cacheHit"));

            expect(stats.original).toMatchObject({
                status: "loaded",
                computation: { computedAt: T0 - 2 * HOUR, totalDurationMs: 3700, originalTotalMs: 3700 },
            });
        });

        describe("what the cache saved", () => {
            const withOriginal = (totalDurationMs: number | undefined, sources: number) =>
                buildExecutionStatsViewModel(
                    scenarioState("cacheHit", {
                        storedProfile: {
                            status: "loaded",
                            profile: {
                                v: 1,
                                totalDurationMs,
                                sources: Array.from({ length: sources }, (_, index) => ({
                                    dataSourceId: `ds-${index}`,
                                    queryDurationMs: 300 + index,
                                })),
                            },
                        },
                    }),
                ).saved;

            it("is the original total minus this load", () => {
                // this load: 18 ms
                expect(withOriginal(409, 1)).toEqual({ kind: "time", savedMs: 391, approximate: false });
            });

            it("is approximate when only the slowest querying is known", () => {
                expect(withOriginal(undefined, 2)).toEqual({ kind: "time", savedMs: 283, approximate: true });
            });

            it("is approximate when the original end ends before the post-processing", () => {
                const stats = buildExecutionStatsViewModel(
                    scenarioState("cacheHit", {
                        storedProfile: {
                            status: "loaded",
                            profile: {
                                v: 1,
                                totalDurationMs: 409,
                                finishedAtApprox: "postprocessingStarted",
                            },
                        },
                    }),
                );

                expect(stats.saved).toEqual({ kind: "time", savedMs: 391, approximate: true });
            });

            it("tells the queries not run when this load was not faster", () => {
                expect(withOriginal(18, 1)).toEqual({ kind: "queries", count: 1 });
                expect(withOriginal(10, 3)).toEqual({ kind: "queries", count: 3 });
            });

            it("tells the queries not run when this load's time is unknown", () => {
                const stats = buildExecutionStatsViewModel(
                    scenarioState("cacheHit", {
                        ...loaded("cacheHit"),
                        events: buildMockExecutionProgressEvents("cacheHit", T0)
                            .filter((event) => event.type !== "FINISHED")
                            .map((event) => ({ event, receivedAt: event.timestamp + CLOCK_OFFSET })),
                        reportStartedAt: null,
                    }),
                );

                expect(stats.saved).toEqual({ kind: "queries", count: 2 });
            });

            it("is not told for a fresh load", () => {
                expect(
                    buildExecutionStatsViewModel(scenarioState("fresh", loaded("fresh"))).saved,
                ).toBeUndefined();
            });
        });

        it("has no stored statistics without a profile", () => {
            const stats = buildExecutionStatsViewModel(
                scenarioState("cacheHitNoProfile", loaded("cacheHitNoProfile")),
            );

            expect(stats.load).toBe("cacheHit");
            expect(stats.original).toEqual({ status: "missing" });
        });

        it("tells the load from the browser cache by the client time", () => {
            const stats = buildExecutionStatsViewModel(
                settledState([], {
                    source: "browserCache",
                    reportStartedAt: T0,
                    reportFinishedAt: T0 + 7,
                }),
            );

            expect(stats).toMatchObject({
                available: true,
                load: "browserCache",
                totalMs: 7,
                showsOriginal: true,
            });
        });
    });

    it("tells a failed computation", () => {
        const stats = buildExecutionStatsViewModel(scenarioState("failure"));

        expect(stats).toMatchObject({ load: "fresh", failed: true });
    });

    it("is unknown when no progress arrived", () => {
        const stats = buildExecutionStatsViewModel(
            settledState([], {
                streamStatus: "failed",
                reportStartedAt: T0,
                reportFinishedAt: T0 + 1200,
                storedProfile: { status: "unavailable", profile: null },
            }),
        );

        expect(stats).toMatchObject({ load: "unknown", totalMs: 1200, original: { status: "unavailable" } });
    });
});
