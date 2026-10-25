// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, put, select, takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../constants/actions.js";
import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getDatasetIdentifier } from "../selectors/route_selector.js";
import { logADClear, logADClearInsight } from "../services/telemetry/tracking_events.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
    buildInsightContentResetCarrier,
    insightContentCleared,
} from "../store/app_context/application_reset_events.js";
import { getRouteReportId } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { getRouteUri, setLocation } from "../utils/location.js";

import { updateDateDataSets } from "./date_datasets/date_datasets_sagas.js";

export function hasDefaultReportId(state: IAppState) {
    return getRouteReportId(state) === DEFAULT_REPORT_ID;
}

export function* resetReportIdInUri(state: IAppState) {
    const isDefaultReportId: SagaReturnType<typeof hasDefaultReportId> = yield call(
        hasDefaultReportId,
        state,
    );
    if (isDefaultReportId) {
        return;
    }

    const uri: ReturnType<typeof getRouteUri> = yield select(getRouteUri, { reportId: DEFAULT_REPORT_ID });

    yield call(setLocation, uri);
}

export function* logReset(state: IAppState) {
    yield call(logADClear, { state });
}

export function* resetDateDatasets() {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const activeDatasetId: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);
    yield call(updateDateDataSets, projectId, activeDatasetId);
}

/**
 * RESET_APPLICATION / CLEAR_INSIGHT_CONTENT are pure INTENT triggers — they write nothing. Each
 * worker below translates its trigger into the semantic reset event the slices honor
 * (store/app_context/application_reset_events.ts).
 *
 * ORDER INSIDE THE WORKER IS LOAD-BEARING: the event is put FIRST, so the `select()`s below read the
 * POST-reset state — the telemetry formatters need the refreshed sessionId, for one. Keeping the put
 * and the side effects in ONE worker is also what removes any dependence on watcher registration
 * order.
 */
export function* onResetApplication() {
    const visualizationClasses: SagaReturnType<typeof getVisualizationClassesState> = yield select(
        getVisualizationClassesState,
    );
    const reset: SagaReturnType<typeof buildApplicationResetCarrier> = yield call(
        buildApplicationResetCarrier,
        visualizationClasses,
    );
    yield put(applicationCleared({ reset }));

    const state: IAppState = yield select();

    yield call(logReset, state);
    yield call(resetReportIdInUri, state);
    yield call(resetDateDatasets);
    yield call(logADClearInsight, { state });
}

export function* onClearInsight() {
    const reset: SagaReturnType<typeof buildInsightContentResetCarrier> = yield call(
        buildInsightContentResetCarrier,
    );
    yield put(insightContentCleared({ reset }));

    const state: IAppState = yield select();

    yield call(logADClearInsight, { state });
    yield call(resetDateDatasets);
}

export function* watchReset() {
    yield takeEvery(ActionTypeKeys.RESET_APPLICATION, onResetApplication);
    yield takeEvery(ActionTypeKeys.CLEAR_INSIGHT_CONTENT, onClearInsight);
}
