// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { openReportStarted } from "../actions/open_actions.js";
import {
    reportDescriptionChange,
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
    reportExecutionWarning,
    reportTitleChange,
} from "../actions/report_actions.js";
import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { selectTimeTravel } from "../store/_infra/time_travel.js";
import { insightContentCleared } from "../store/app_context/application_reset_events.js";
import { currentReportExecutionSettled } from "../store/execution/execution_coordination_events.js";
import { getExecutionState } from "../store/execution/execution_selectors.js";
import { executionInitialState } from "../store/execution/execution_state.js";
import { getReportLoadingError } from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withReport } from "../tests/state_builder.test.helpers.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

/**
 * Characterization suite for the execute_report domain: the `report.execution` subtree and the
 * report/insight leaves the same actions write (`report.nowOpen`, `report.loadingError`,
 * `data.title`, `data.summary`).
 *
 * Every test drives the FULL root chain (rootReducer), so if an assertion has to be edited, that
 * edit IS a behavior change.
 *
 * The undo/redo history does NOT capture the `report` branch, so a snapshot has no execution that
 * could go stale and nothing has to be rewritten inside the history — several specs below pin that
 * invariant (see also store/_infra/test/time_travel_characterization.test.ts).
 */
describe("execute_report characterization", () => {
    const state = getInitializedState();

    const dispatch = (initial: IAppState, ...actions: UnknownAction[]): IAppState =>
        actions.reduce((acc, action) => rootReducer(acc, action), initial);

    // the report.nowOpen close is the execution domain's coordination EVENT
    // (store/execution/execution_coordination_saga.ts re-tests the id guard and emits it);
    // this replicates the watcher's exact decision so the characterization keeps driving
    // real dispatches
    const finishCurrent = (initial: IAppState, finishedAction: UnknownAction, id: string): IAppState => {
        const next = dispatch(initial, finishedAction);
        return getExecutionState(next).id === id ? dispatch(next, currentReportExecutionSettled()) : next;
    };

    const limitBreaks = [{ limitType: "xtab-rows", limit: 60000, value: 70000 }];

    describe("REPORT_EXECUTION_STARTED", () => {
        it("marks the execution running under the action's id and clears the previous result flag", () => {
            const result = dispatch(state, reportExecutionStarted("exec-1", 100));

            expect(result.report.execution.running).toBe(true);
            expect(result.report.execution.id).toEqual("exec-1");
            expect(result.report.execution.hasData).toBe(false);
        });

        it("drops the warning, the error and the report loading error of the previous run", () => {
            const previous = withReport(
                dispatch(
                    state,
                    reportExecutionStarted("exec-1", 100),
                    reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200),
                    reportExecutionFailed({ status: "ERROR" }, "exec-1", 100, 200),
                ),
                { loadingError: "incorrectMetadata" },
            );

            const result = dispatch(previous, reportExecutionStarted("exec-2", 300));

            expect(result.report.execution.warning).toBeUndefined();
            expect(result.report.execution.error).toBeUndefined();
            // read through the domain accessor: the loading-error clear moved into
            // the report slice, which stores null rather than deleting the key —
            // the accessor restores the undefined every reader tests against
            expect(getReportLoadingError(result)).toBeUndefined();
        });

        it("leaves report.nowOpen untouched", () => {
            const opened = withReport(state, { nowOpen: true });

            const result = dispatch(opened, reportExecutionStarted("exec-1", 100));

            expect(result.report.nowOpen).toBe(true);
        });
    });

    describe("EXECUTION_ERROR", () => {
        const running = () => dispatch(state, reportExecutionStarted("exec-1", 100));

        it("stores status and responseData and stops the execution when the id matches", () => {
            const error = {
                status: "ERROR",
                responseData: { traceId: "trace_id", message: "error_message" },
            };

            const result = dispatch(running(), reportExecutionFailed(error, "exec-1", 100, 200));

            expect(result.report.execution.error?.status).toEqual("ERROR");
            expect(result.report.execution.error?.responseData).toEqual({
                traceId: "trace_id",
                message: "error_message",
            });
            expect(result.report.execution.running).toBe(false);
        });

        it("stores an empty object when the error carries no responseData", () => {
            const result = dispatch(
                running(),
                reportExecutionFailed({ status: "ERROR", responseData: undefined }, "exec-1", 100, 200),
            );

            expect(result.report.execution.error?.responseData).toEqual({});
        });

        it("clears a warning left by the same execution", () => {
            const warned = dispatch(running(), reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200));

            const result = dispatch(warned, reportExecutionFailed({ status: "ERROR" }, "exec-1", 100, 200));

            expect(result.report.execution.warning).toBeUndefined();
        });

        it("does not touch the current state when the execution id differs", () => {
            const current = running();

            const result = dispatch(
                current,
                reportExecutionFailed({ status: "ERROR" }, "exec-other", 100, 200),
            );

            expect(result.report.execution.error).toBeUndefined();
            expect(result.report.execution.running).toBe(true);
        });

        it("leaves the undo history alone — a snapshot holds no execution to rewrite", () => {
            const edited = dispatch(
                withReport(state, { execution: { ...state.report.execution, id: "exec-current" } }),
                reportTitleChange("edited"),
            );
            const historyBefore = selectTimeTravel(edited);

            const result = dispatch(
                edited,
                reportExecutionFailed({ status: "ERROR" }, "exec-stale", 100, 200),
            );

            expect(selectTimeTravel(result)).toBe(historyBefore);
            // `IUndoableState` omits `report` outright — a type-level guarantee
            expect("report" in selectTimeTravel(result).past[0].state).toBe(false);
        });
    });

    describe("REPORT_EXECUTION_FINISHED", () => {
        const finished = (id: string) => reportExecutionFinished({ isLoaded: true }, id, 100, 200);

        it("stops the execution, marks data present and closes the just-opened report", () => {
            const running = dispatch(
                withReport(state, { nowOpen: true }),
                reportExecutionStarted("exec-1", 100),
            );

            const result = finishCurrent(running, finished("exec-1"), "exec-1");

            expect(result.report.execution.running).toBe(false);
            expect(result.report.execution.hasData).toBe(true);
            expect(result.report.nowOpen).toBe(false);
        });

        it("keeps the limit breaks reported by the same execution", () => {
            const warned = dispatch(
                state,
                reportExecutionStarted("exec-1", 100),
                reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200),
            );

            const result = dispatch(warned, finished("exec-1"));

            expect(result.report.execution.warning?.limitBreaks).toEqual(limitBreaks);
        });

        it("does not touch the current state when the execution id differs", () => {
            const running = dispatch(state, reportExecutionStarted("exec-1", 100));

            const result = dispatch(running, finished("exec-other"));

            expect(result.report.execution.running).toBe(true);
            expect(result.report.execution.hasData).toBe(false);
        });

        it("leaves the undo history alone and does not close a just-opened report", () => {
            const opened = dispatch(
                withReport(
                    withReport(state, { execution: { ...state.report.execution, id: "exec-current" } }),
                    { nowOpen: true },
                ),
                reportTitleChange("edited"),
            );
            const historyBefore = selectTimeTravel(opened);

            const result = finishCurrent(opened, finished("exec-stale"), "exec-stale");

            expect(result.report.nowOpen).toBe(true);
            expect(selectTimeTravel(result)).toBe(historyBefore);
        });
    });

    describe("EXECUTION_WARNING", () => {
        it("stores the limit breaks when the execution id matches", () => {
            const running = dispatch(state, reportExecutionStarted("exec-1", 100));

            const result = dispatch(running, reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200));

            expect(result.report.execution.warning?.limitBreaks).toEqual(limitBreaks);
        });

        it("does not touch the current state when the execution id differs", () => {
            const running = dispatch(state, reportExecutionStarted("exec-1", 100));

            const result = dispatch(running, reportExecutionWarning({ limitBreaks }, "exec-other", 100, 200));

            expect(result.report.execution.warning).toBeUndefined();
        });

        it("leaves the undo history alone — a snapshot holds no execution to rewrite", () => {
            const edited = dispatch(
                withReport(state, { execution: { ...state.report.execution, id: "exec-current" } }),
                reportTitleChange("edited"),
            );
            const historyBefore = selectTimeTravel(edited);

            const result = dispatch(edited, reportExecutionWarning({ limitBreaks }, "exec-stale", 100, 200));

            expect(selectTimeTravel(result)).toBe(historyBefore);
        });
    });

    describe("the insight leaves the domain's actions write", () => {
        it("REPORT_TITLE_CHANGE writes data.title", () => {
            const result = dispatch(state, reportTitleChange("My report title"));

            expect(result.data.title).toEqual("My report title");
        });

        it("REPORT_DESCRIPTION_CHANGE writes data.summary", () => {
            const result = dispatch(state, reportDescriptionChange("My description"));

            expect(result.data.summary).toEqual("My description");
        });

        it("both are undoable, so each dispatch snapshots the previous state", () => {
            const result = dispatch(state, reportTitleChange("first"), reportDescriptionChange("second"));

            expect(selectTimeTravel(result).past).toHaveLength(2);
        });
    });

    describe("reset paths", () => {
        it("RESET_FOR_PLUGGABLE_MOUNT returns the pristine execution subtree", () => {
            const dirty = dispatch(
                state,
                reportExecutionStarted("exec-1", 100),
                reportExecutionFailed({ status: "ERROR" }, "exec-1", 100, 200),
            );

            const result = dispatch(dirty, resetForPluggableMount());

            // Read through the domain accessor, not the raw path: the action returns the pristine
            // initialState VERBATIM, and no separate seed exists for this subtree, so it is
            // genuinely ABSENT until the next dispatch and only the sliceSelector fallback answers
            // (the 4.5 gate — reducers/test/pristine_state_readers.test.ts covers the readers).
            expect(getExecutionState(result)).toEqual(executionInitialState);
        });

        it("CLEAR_INSIGHT_CONTENT resets the execution subtree to its initial value", () => {
            const dirty = dispatch(
                state,
                reportExecutionStarted("exec-1", 100),
                reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200),
            );

            const result = dispatch(dirty, insightContentCleared({ reset: { sessionId: "fresh" } }));

            expect(result.report.execution).toEqual(state.report.execution);
        });

        it("OPEN_REPORT_STARTED clears the execution error and warning of the previous report", () => {
            const dirty = dispatch(
                state,
                reportExecutionStarted("exec-1", 100),
                reportExecutionWarning({ limitBreaks }, "exec-1", 100, 200),
                reportExecutionFailed({ status: "ERROR" }, "exec-1", 100, 200),
            );

            const result = dispatch(dirty, openReportStarted("project", "report"));

            expect(result.report.execution.error).toBeUndefined();
            expect(result.report.execution.warning).toBeUndefined();
        });
    });

    describe("the pristine execution state", () => {
        it("is owned by the slice and carries no `first` flag", () => {
            expect(initialState.report.execution).toEqual({
                id: null,
                running: false,
                hasData: false,
            });
            expect(state.report.execution).toEqual({
                id: null,
                running: false,
                hasData: false,
            });
        });
    });
});
