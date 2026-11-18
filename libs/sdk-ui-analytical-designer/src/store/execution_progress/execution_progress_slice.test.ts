// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
} from "../../actions/report_actions.js";

import { executionProgressCleared } from "./execution_progress_actions.js";
import { shouldClearExecutionProgress } from "./execution_progress_saga.js";
import { executionProgressSliceReducer } from "./execution_progress_slice.js";
import { executionProgressInitialState } from "./execution_progress_state.js";

const T0 = 1_731_350_000_000;
const started = executionProgressSliceReducer(
    executionProgressInitialState,
    reportExecutionStarted("report-execution", T0),
);

describe("executionProgressSliceReducer", () => {
    it("settles a finished report execution at its end time", () => {
        const state = executionProgressSliceReducer(
            started,
            reportExecutionFinished({} as never, "report-execution", T0, T0 + 300),
        );

        expect(state.reportFinishedAt).toBe(T0 + 300);
    });

    it("settles a failed (e.g. empty) report execution without an end time of its own", () => {
        const state = executionProgressSliceReducer(
            started,
            reportExecutionFailed({}, "report-execution", T0, null as unknown as number),
        );

        expect(state.reportFinishedAt).toBe(T0);
    });

    it("ignores the stale end time of an earlier execution", () => {
        const state = executionProgressSliceReducer(
            started,
            reportExecutionFailed({}, "report-execution", T0, T0 - 5000),
        );

        expect(state.reportFinishedAt).toBe(T0);
    });
});

describe("clearing the stats once nothing executes", () => {
    const settled = executionProgressSliceReducer(
        started,
        reportExecutionFinished({} as never, "report-execution", T0, T0 + 300),
    );

    it("resets the stored stats", () => {
        expect(executionProgressSliceReducer(settled, executionProgressCleared())).toEqual(
            executionProgressInitialState,
        );
    });

    it("clears the stats of a report that does not execute any more", () => {
        expect(shouldClearExecutionProgress(false, settled)).toBe(true);
    });

    it("keeps the stats of an executable report", () => {
        expect(shouldClearExecutionProgress(true, settled)).toBe(false);
    });

    it("has nothing to clear without stats", () => {
        expect(shouldClearExecutionProgress(false, executionProgressInitialState)).toBe(false);
    });
});
