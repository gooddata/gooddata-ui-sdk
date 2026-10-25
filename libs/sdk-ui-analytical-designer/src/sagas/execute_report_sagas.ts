// (C) 2007-2026 GoodData Corporation

import { call, select, take, takeEvery } from "redux-saga/effects";

import {
    type IReportExecutionFailedAction,
    type IReportExecutionFinishedAction,
} from "../actions/report_actions.js";
import { explainExecDef } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { getInsightForSaveViaMd } from "../selectors/insight_selectors.js";
import { getExplainType } from "../selectors/route_selector.js";
import { getInsightStats } from "../services/telemetry/custom_variables.js";
import {
    logTooManyDataPointsError,
    logVisualizationExecuted,
    logVisualizationExecutionFailed,
} from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";
import { explainDownload } from "../utils/explainDownloader.js";

export function* logReportExecutionFinished(action: IReportExecutionFinishedAction) {
    const state: IAppState = yield select();
    const { startTime, endTime } = action.meta;

    yield call(logVisualizationExecuted, {
        state,
        time: endTime - startTime,
    });
}

export function* logReportExecutionFailed(action: IReportExecutionFailedAction) {
    const state: IAppState = yield select();
    const { startTime, endTime } = action.meta;

    // the execution error payload is a caught error probed for its message
    const message = (action?.payload as { message?: string } | undefined)?.message;
    if (typeof message === "string" && message.indexOf("limit") !== -1) {
        const insight: ReturnType<typeof getInsightForSaveViaMd> = yield select(getInsightForSaveViaMd);
        const insightStats = getInsightStats(insight);

        yield call(logTooManyDataPointsError, state, message, insightStats);
    }

    yield call(logVisualizationExecutionFailed, {
        state,
        time: endTime - startTime,
    });
}

export function* onInitialAppLoadExplainRequest() {
    const explainType: ReturnType<typeof getExplainType> = yield select(getExplainType);

    yield take([ActionTypeKeys.REPORT_EXECUTION_FINISHED]);

    yield call(explainDownload, explainExecDef, { explainType });
}

export function* watchExecuteReport() {
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_FINISHED, logReportExecutionFinished);
    yield takeEvery(ActionTypeKeys.REPORT_EXECUTION_ERROR, logReportExecutionFailed);
    yield takeEvery(ActionTypeKeys.REQUEST_EXPLAIN, onInitialAppLoadExplainRequest);
}
