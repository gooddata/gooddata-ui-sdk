// (C) 2026 GoodData Corporation

import { type SagaReturnType, put, select, takeEvery } from "redux-saga/effects";

import { type IReportExecutionFinishedAction } from "../../actions/report_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";

import { currentReportExecutionSettled } from "./execution_coordination_events.js";
import { getExecutionState } from "./execution_selectors.js";

/**
 * REPORT_EXECUTION_FINISHED → `currentReportExecutionSettled`.
 *
 * Closing `report.nowOpen` when the finished result belongs to the CURRENT execution is a
 * cross-domain write, so it goes through an explicit coordination event the report domain honors.
 * The id guard is the same condition the execution slice tests: a result from a SUPERSEDED execution
 * must not close anything. Testing it here AFTER the slice reduced the action is safe because none
 * of the execution actions writes `id`.
 *
 * The put is one nested dispatch behind the trigger, inside the same outer dispatch, and
 * `report.nowOpen` has no reader between the two (its only consumers read it from selectors on
 * render), so the gap is unobservable.
 */
export function* onReportExecutionFinished(action: IReportExecutionFinishedAction) {
    const execution: SagaReturnType<typeof getExecutionState> = yield select(getExecutionState);

    if (execution.id === action.meta.id) {
        yield put(currentReportExecutionSettled());
    }
}

export function* watchExecutionCoordination() {
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_FINISHED, onReportExecutionFinished);
}
