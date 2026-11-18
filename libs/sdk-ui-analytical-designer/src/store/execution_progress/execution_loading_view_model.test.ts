// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionProgressEvent } from "@gooddata/sdk-backend-tiger";

import {
    STEP_REVEAL_GAP_MS,
    advanceStepReveal,
    buildExecutionLoadingViewModel,
    formatStepDuration,
    initialStepRevealState,
    loadingStepDuration,
    nextStepRevealAt,
    revealedLoadingSteps,
} from "./execution_loading_view_model.js";
import { buildMockExecutionProgressEvents } from "./execution_progress_mock.js";
import { type IExecutionProgressState, executionProgressInitialState } from "./execution_progress_state.js";
import { buildExecutionProgressViewModel } from "./execution_progress_view_model.js";

const T0 = 1_731_350_000_000;

function loading(events: IExecutionProgressEvent[], overrides: Partial<IExecutionProgressState> = {}) {
    const state: IExecutionProgressState = {
        ...executionProgressInitialState,
        reportExecutionId: "report-execution",
        executionId: "mock-execution",
        source: "network",
        streamStatus: "streaming",
        reportStartedAt: T0,
        events: events.map((event) => ({ event, receivedAt: event.timestamp + 10 })),
        ...overrides,
    };
    return buildExecutionLoadingViewModel(buildExecutionProgressViewModel(state));
}

const until = (events: IExecutionProgressEvent[], at: number) =>
    events.filter((event) => event.timestamp <= T0 + at);

const stepStates = (view: ReturnType<typeof loading>) => view.steps.map((step) => [step.kind, step.state]);

describe("buildExecutionLoadingViewModel", () => {
    const fresh = buildMockExecutionProgressEvents("fresh", T0);

    it("is the single line before anything is known", () => {
        expect(loading([])).toEqual({ mode: "compact", steps: [] });
        expect(loading(until(fresh, 30))).toEqual({ mode: "compact", steps: [] });
    });

    it("expands once the SQL is generated, appending the sub-steps in chronological order", () => {
        const view = loading(until(fresh, 200));

        expect(view.mode).toBe("steps");
        expect(stepStates(view)).toEqual([
            ["cache", "done"],
            ["prepare", "running"],
        ]);
        expect(view.steps[0]).toMatchObject({ startedAt: T0, finishedAt: T0 + 80 });
    });

    it("grows while the query runs, without future steps", () => {
        const view = loading(until(fresh, 1000));

        expect(stepStates(view)).toEqual([
            ["cache", "done"],
            ["prepare", "done"],
            ["query", "running"],
        ]);
        expect(view.steps[2]).toMatchObject({
            startedAt: T0 + 470,
            dataSourceId: "demo-ds",
            dataSourceName: "Demo PostgreSQL",
        });
        expect(view.steps[1]).toMatchObject({ startedAt: T0 + 80, finishedAt: T0 + 470 });
    });

    it("leaves the rendering to the header", () => {
        const view = loading(fresh, { streamStatus: "done" });

        expect(stepStates(view)).toEqual([
            ["cache", "done"],
            ["prepare", "done"],
            ["query", "done"],
        ]);
        expect(view.steps[2]).toMatchObject({ startedAt: T0 + 470, finishedAt: T0 + 3520 });
    });

    it("fails the current step", () => {
        const view = loading(buildMockExecutionProgressEvents("failure", T0), { streamStatus: "done" });

        expect(stepStates(view).at(-1)).toEqual(["query", "failed"]);
    });

    it("keeps the federated sources under the query step", () => {
        const view = loading(until(buildMockExecutionProgressEvents("federation", T0), 1500));
        const query = view.steps.at(-1)!;

        expect(query.kind).toBe("query");
        expect(query.sources?.map((source) => [source.dataSourceName, source.state])).toEqual([
            ["Sales (PostgreSQL)", "running"],
            ["Data warehouse (Snowflake)", "running"],
            ["CSV uploads", "done"],
        ]);
        expect(query.slowestSourceResultId).toBe("input-postgres");
    });

    describe("stays the single line for a cached result", () => {
        it("of a federation whose data sources all came from the raw cache", () => {
            const child = (
                seq: number,
                type: IExecutionProgressEvent["type"],
                resultId: string,
                at: number,
                extra: Partial<IExecutionProgressEvent> = {},
            ): IExecutionProgressEvent => ({
                seq,
                executionId: "mock-execution",
                resultId,
                parentResultId: "root",
                role: "blendingInput",
                type,
                timestamp: T0 + at,
                ...extra,
            });
            const events: IExecutionProgressEvent[] = [
                { seq: 1, executionId: "mock-execution", resultId: "root", type: "STARTED", timestamp: T0 },
                {
                    seq: 2,
                    executionId: "mock-execution",
                    resultId: "root",
                    type: "CHILDREN_REQUESTED",
                    timestamp: T0 + 50,
                    children: [
                        { resultId: "a", role: "blendingInput" },
                        { resultId: "b", role: "blendingInput" },
                    ],
                },
                child(3, "STARTED", "a", 60),
                child(4, "STARTED", "b", 60),
                child(5, "FINISHED", "a", 70, { cacheHit: true, status: "success" }),
                child(6, "FINISHED", "b", 70, { cacheHit: true, status: "success" }),
            ];

            expect(loading(events).mode).toBe("compact");
        });

        it("served from the backend result cache", () => {
            expect(
                loading(buildMockExecutionProgressEvents("cacheHit", T0), { streamStatus: "done" }).mode,
            ).toBe("compact");
        });

        it("served from the raw cache", () => {
            const rawCache = until(fresh, 90).concat([
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

            expect(loading(rawCache).mode).toBe("compact");
        });

        it("served from the browser cache", () => {
            expect(loading([], { source: "browserCache", streamStatus: "done" }).mode).toBe("compact");
        });
    });
});

describe("loadingStepDuration", () => {
    const running = { startedAt: T0, state: "running" as const };

    it("shows nothing for a step running less than 1 s", () => {
        expect(loadingStepDuration(running, T0 + 999)).toBeUndefined();
    });

    it("shows the live whole seconds of a running step from 1 s on", () => {
        expect(loadingStepDuration(running, T0 + 1000)).toBe("1s");
        expect(loadingStepDuration(running, T0 + 7999)).toBe("7s");
    });

    it("shows every finished step: milliseconds under 1 s, whole seconds from it", () => {
        expect(loadingStepDuration({ ...running, state: "done", finishedAt: T0 + 100 }, T0 + 9000)).toBe(
            "100ms",
        );
        expect(loadingStepDuration({ ...running, state: "done", finishedAt: T0 + 7400 }, T0 + 9000)).toBe(
            "7s",
        );
    });

    it("shows nothing for a pending step", () => {
        expect(loadingStepDuration({ state: "pending" }, T0 + 9000)).toBeUndefined();
    });

    it("formats like the design", () => {
        expect(formatStepDuration(0)).toBe("0ms");
        expect(formatStepDuration(150.4)).toBe("150ms");
        expect(formatStepDuration(999)).toBe("999ms");
        expect(formatStepDuration(1000)).toBe("1s");
        expect(formatStepDuration(7999)).toBe("7s");
    });
});

describe("step reveal queue", () => {
    it("reveals the first step at once", () => {
        expect(advanceStepReveal(initialStepRevealState, 1, T0)).toEqual({ revealed: 1, lastRevealAt: T0 });
    });

    it("spaces steps that started together", () => {
        let state = advanceStepReveal(initialStepRevealState, 3, T0);
        // all three started, only one per gap
        state = advanceStepReveal(state, 3, T0 + 100);
        expect(state.revealed).toBe(1);
        expect(nextStepRevealAt(state, 3)).toBe(T0 + STEP_REVEAL_GAP_MS);

        state = advanceStepReveal(state, 3, T0 + STEP_REVEAL_GAP_MS);
        expect(state).toEqual({ revealed: 2, lastRevealAt: T0 + STEP_REVEAL_GAP_MS });

        state = advanceStepReveal(state, 3, T0 + STEP_REVEAL_GAP_MS + 10);
        expect(state.revealed).toBe(2);
        state = advanceStepReveal(state, 3, T0 + 2 * STEP_REVEAL_GAP_MS);
        expect(state.revealed).toBe(3);
        expect(nextStepRevealAt(state, 3)).toBeUndefined();
    });

    it("reveals a step that starts later at once when the gap already passed", () => {
        const state = advanceStepReveal({ revealed: 2, lastRevealAt: T0 }, 3, T0 + 2000);

        expect(state).toEqual({ revealed: 3, lastRevealAt: T0 + 2000 });
    });

    it("shows the revealed sub-steps in chronological order", () => {
        const view = loading(until(buildMockExecutionProgressEvents("fresh", T0), 1000));

        expect(revealedLoadingSteps(view.steps, 1).map((step) => step.kind)).toEqual(["cache"]);
        expect(revealedLoadingSteps(view.steps, 2).map((step) => step.kind)).toEqual(["cache", "prepare"]);
        expect(revealedLoadingSteps(view.steps, 5)).toEqual(view.steps);
    });
});
