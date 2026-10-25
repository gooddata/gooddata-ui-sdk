// (C) 2007-2026 GoodData Corporation

import { testSaga } from "redux-saga-test-plan";
import { describe, it } from "vitest";

import { reportExecutionFailed, reportExecutionFinished } from "../actions/report_actions.js";
import { initialState } from "../reducers/initial_state.js";
import {
    logVisualizationExecuted,
    logVisualizationExecutionFailed,
} from "../services/telemetry/tracking_events.js";

import { logReportExecutionFailed, logReportExecutionFinished } from "./execute_report_sagas.js";

describe("executeReport", () => {
    it("should execute log when execution is finished.", () => {
        const action = reportExecutionFinished({}, "id", 10, 20);
        const state = initialState;
        const saga = testSaga(logReportExecutionFinished, action);

        saga.next().select().next(state).call(logVisualizationExecuted, { state, time: 10 });
    });

    it("should execute log when execution failed", () => {
        const action = reportExecutionFailed(new Error(), "id", 10, 20);
        const state = initialState;
        const saga = testSaga(logReportExecutionFailed, action);

        saga.next().select().next(state).call(logVisualizationExecutionFailed, { state, time: 10 });
    });
});
