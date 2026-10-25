// (C) 2007-2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { openReportStarted } from "../../actions/open_actions.js";
import {
    type IReportExecutionWarningPayload,
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
    reportExecutionWarning,
} from "../../actions/report_actions.js";
import { NOT_FOUND } from "../../constants/errors.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { withReport } from "../../tests/state_builder.test.helpers.js";
import { buildOpenReportFailed } from "../../utils/open_report_actions.js";
import { type IAppState } from "../types.js";

import { getExecutionState } from "./execution_selectors.js";
import { executionInitialState } from "./execution_state.js";

/**
 * The domain mount driven with the whole root state, the way the root chain calls it. The cases
 * that also write the foreign report/insight leaves or rewrite the undo/redo history live in the
 * apply reducer and are covered by reducers/test/execute_report_characterization.test.ts through
 * the full chain.
 *
 * Carries over the cases of the deleted reducers/test/execute_report_reducer.test.ts.
 */
describe("store/execution mount", () => {
    const reduce = (state: IAppState, action: UnknownAction) => combinedRootReducer(state, action);

    const running = (id: string) => reduce(initialState, reportExecutionStarted(id, 0));

    describe("self-initialization", () => {
        it("seeds the subtree from the slice (the combined root self-initializes it)", () => {
            const result = reduce(initialState, { type: "@@INIT" });

            expect(result.report.execution).toEqual({
                id: null,
                running: false,
                hasData: false,
            });
        });

        it("returns the root by reference when nothing changed", () => {
            const initialized = reduce(initialState, { type: "@@INIT" });

            expect(reduce(initialized, { type: "SOME_OTHER_ACTION" })).toBe(initialized);
        });

        /** The slice must reduce a subtree an external writer left behind, not just its own. */
        it("reduces a subtree written outside the slice", () => {
            const externallyWritten = withReport(initialState, {
                execution: { ...initialState.report.execution, id: "exec-1", running: true },
            });

            const result = reduce(externallyWritten, reportExecutionFinished({}, "exec-1", 0, 1));

            expect(result.report.execution).toEqual({
                id: "exec-1",
                running: false,
                hasData: true,
            });
        });
    });

    describe("REPORT_EXECUTION_STARTED", () => {
        it("sets the execution id, marks it running and clears the data flag", () => {
            const result = running("1");

            expect(getExecutionState(result)).toEqual({
                id: "1",
                running: true,
                hasData: false,
            });
        });

        it("deletes the data, warning and error of the previous execution", () => {
            const previous = reduce(
                reduce(running("1"), reportExecutionWarning({ limitBreaks: [] }, "1", 0, 1)),
                reportExecutionFailed({ status: "ERROR" }, "1", 0, 1),
            );

            const result = reduce(previous, reportExecutionStarted("2", 2));

            expect(getExecutionState(result)).toEqual({
                id: "2",
                running: true,
                hasData: false,
            });
        });
    });

    describe("REPORT_EXECUTION_ERROR", () => {
        it("should not update state if execution ids differ", () => {
            const state = running("123");

            expect(reduce(state, reportExecutionFailed({ status: "ERROR" }, "678", 901, 906))).toBe(state);
        });

        it("should set execution error if execution's id matches", () => {
            const error = {
                responseData: { traceId: "trace_id", message: "error_message" },
                status: "ERROR",
            };

            const result = reduce(running("123"), reportExecutionFailed(error, "123", 901, 906));

            expect(getExecutionState(result).error).toEqual(error);
        });

        it("should store an empty response data object when it is null", () => {
            const result = reduce(
                running("123"),
                reportExecutionFailed({ responseData: undefined, status: "ERROR" }, "123", 901, 906),
            );

            expect(getExecutionState(result).error?.responseData).toEqual({});
        });

        it("should set running to false", () => {
            const result = reduce(
                running("123"),
                reportExecutionFailed({ status: "ERROR" }, "123", 901, 906),
            );

            expect(getExecutionState(result).running).toBe(false);
        });
    });

    describe("REPORT_EXECUTION_FINISHED", () => {
        it("should not update state if execution ids differ", () => {
            const state = running("1");

            expect(reduce(state, reportExecutionFinished({}, "2", 123, 456))).toBe(state);
        });

        it("stops the execution and marks the data present", () => {
            const result = reduce(running("1"), reportExecutionFinished({}, "1", 123, 456));

            expect(getExecutionState(result)).toEqual({
                id: "1",
                running: false,
                hasData: true,
            });
        });

        it("keeps the limit breaks reported by the same execution", () => {
            const limitBreaks: IReportExecutionWarningPayload["limitBreaks"] = [
                { limitType: "xtab-rows", limit: 60000, value: 70000 },
            ];
            const warned = reduce(running("1"), reportExecutionWarning({ limitBreaks }, "1", 123, 456));

            const result = reduce(warned, reportExecutionFinished({}, "1", 123, 456));

            expect(getExecutionState(result).warning?.limitBreaks).toEqual(limitBreaks);
        });
    });

    describe("REPORT_EXECUTION_WARNING", () => {
        const limitBreaks: IReportExecutionWarningPayload["limitBreaks"] = [
            { limitType: "xtab-rows", limit: 60000, value: 70000 },
        ];

        it("stores the execution limit breaks", () => {
            const result = reduce(running("1"), reportExecutionWarning({ limitBreaks }, "1", 123, 456));

            expect(getExecutionState(result).warning?.limitBreaks).toEqual(limitBreaks);
        });

        it("does not update the limit breaks if execution ids differ", () => {
            const state = running("2");

            expect(reduce(state, reportExecutionWarning({ limitBreaks }, "1", 123, 456))).toBe(state);
        });
    });

    /**
     * The pluggable visualization reports its validation failures from RENDER
     * (PluggableVisualization#onError -> reportExecutionFailed), so re-reporting the SAME result
     * must leave the state reference untouched. A write that produces a new object every dispatch
     * closes a render -> dispatch -> render loop that pins the browser's main thread — switching an
     * insight with two date items to a pie chart froze AD until the tab was killed.
     *
     * These assertions pin the IDENTITY, not the values — the values alone cannot catch the
     * regression.
     */
    describe("re-reporting the same result is a no-op (loop guard)", () => {
        it("REPORT_EXECUTION_ERROR twice returns the identical root", () => {
            const error = { status: "INVALID_BUCKETS", responseData: { traceId: "t" } };
            const first = reduce(running("1"), reportExecutionFailed(error, "1", 0, 1));

            expect(reduce(first, reportExecutionFailed(error, "1", 0, 1))).toBe(first);
        });

        it("REPORT_EXECUTION_ERROR twice with an equal-but-not-same payload returns the identical root", () => {
            const first = reduce(
                running("1"),
                reportExecutionFailed({ status: "INVALID_BUCKETS", responseData: {} }, "1", 0, 1),
            );

            const repeated = reduce(
                first,
                reportExecutionFailed({ status: "INVALID_BUCKETS", responseData: {} }, "1", 0, 1),
            );

            expect(repeated).toBe(first);
        });

        it("a genuinely different error still replaces the branch", () => {
            const first = reduce(
                running("1"),
                reportExecutionFailed({ status: "INVALID_BUCKETS" }, "1", 0, 1),
            );

            const changed = reduce(first, reportExecutionFailed({ status: "NO_DATA" }, "1", 0, 1));

            expect(changed).not.toBe(first);
            expect(getExecutionState(changed).error?.status).toBe("NO_DATA");
        });

        it("REPORT_EXECUTION_WARNING twice returns the identical root", () => {
            const limitBreaks: IReportExecutionWarningPayload["limitBreaks"] = [
                { limitType: "xtab-rows", limit: 60000, value: 70000 },
            ];
            const first = reduce(running("1"), reportExecutionWarning({ limitBreaks }, "1", 0, 1));

            const repeated = reduce(
                first,
                reportExecutionWarning(
                    { limitBreaks: [{ limitType: "xtab-rows", limit: 60000, value: 70000 }] },
                    "1",
                    0,
                    1,
                ),
            );

            expect(repeated).toBe(first);
        });

        it("REPORT_EXECUTION_FINISHED twice returns the identical root", () => {
            const first = reduce(running("1"), reportExecutionFinished({}, "1", 0, 1));

            expect(reduce(first, reportExecutionFinished({}, "1", 0, 1))).toBe(first);
        });
    });

    describe("the absorbed OPEN_REPORT_* writes", () => {
        it("OPEN_REPORT_STARTED clears the previous report's error and warning", () => {
            const failed = reduce(running("1"), reportExecutionFailed({ status: "ERROR" }, "1", 0, 1));

            const result = reduce(failed, openReportStarted("project", "report"));

            expect(getExecutionState(result)).toEqual({
                id: "1",
                running: false,
                hasData: false,
            });
        });

        /**
         * Through the FULL chain, because the ORDERING is the point: the application reset rewrites
         * this subtree, and the mount registered after it puts the not-found status on top.
         */
        it("OPEN_REPORT_FAILED without a reason reports the insight as not found", () => {
            const result = rootReducer(initialState, buildOpenReportFailed(initialState));

            expect(result.report.execution.error?.status).toBe(NOT_FOUND);
        });

        it("OPEN_REPORT_FAILED without a reason keeps the missing items it names on the not-found error", () => {
            const missingItem = {
                datasetTitle: "Delivery date",
                identifier: "delivery_date.minuteOfHour",
                granularity: "GDC.time.minute_in_hour",
            };
            const result = rootReducer(
                initialState,
                buildOpenReportFailed(initialState, false, undefined, [missingItem]),
            );

            expect(result.report.execution.error).toEqual({ status: NOT_FOUND, missingItems: [missingItem] });
        });

        it("OPEN_REPORT_FAILED with a reason leaves the subtree at its reset value", () => {
            const result = rootReducer(
                initialState,
                buildOpenReportFailed(initialState, false, "incorrectMetadata"),
            );

            expect(getExecutionState(result)).toEqual(executionInitialState);
        });
    });
});
