// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import { type IChangeDatasetAction } from "../actions/data_actions.js";
import { requestExplain } from "../actions/explain_actions.js";
import { explainExecDef } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { isExplainSupported } from "../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import {
    getDataSet,
    getExplainType,
    getReportId,
    getSourceInsightId,
    isExplainRequested,
    isForceReload,
    isFullReloadNeeded,
    isLocationChangeLocked,
    isSourceInsightParamChanged,
    reportIdParamChanged,
} from "../selectors/route_selector.js";
import {
    buildApplicationResetCarrier,
    wholeApplicationReset,
} from "../store/app_context/application_reset_events.js";
import { hasAttributeHierarchiesChanged } from "../store/catalog/catalog_selector.js";
import { setAttributeHierarchiesChanged } from "../store/catalog/catalog_store_actions.js";
import {
    type locationChanged as locationChangedCreator,
    locationRedirectLock,
    reportIdChanged,
    routeChanged,
    routeParamsChanged,
    sourceInsightChanged,
} from "../store/router/router_actions.js";
import { buildNextRoute, shouldResetOnNavigation } from "../store/router/router_helpers.js";
import { getRouteState } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { explainDownload } from "../utils/explainDownloader.js";
import { getBaseUri, getRouteParams, getRouteUri, setLocation } from "../utils/location.js";

import { bootstrap } from "./bootstrap_sagas.js";
import { loadAttributeHierarchies } from "./catalog/catalog_saga.js";
import { updateSelectedDataset } from "./datasets_sagas.js";
import { fetchDraftReport, fetchReport } from "./open_report_sagas.js";

export function* setDatasetRouteParam(action: IChangeDatasetAction) {
    const { dataset } = action.payload;

    const currentDataSet: ReturnType<typeof getDataSet> = yield select(getDataSet);
    if (dataset !== currentDataSet) {
        const state: IAppState = yield select();

        const options = { dataset };
        const uri: SagaReturnType<typeof getRouteUri> = yield call(getRouteUri, state, options);
        yield call(setLocation, uri);
    }
}

export function* invokeFullReload(state: IAppState) {
    const uriParams: SagaReturnType<typeof getRouteParams> = yield call(getRouteParams, state);

    yield call(updateSelectedDataset, true);

    yield call(bootstrap, uriParams);

    const forceReload: SagaReturnType<typeof isForceReload> = yield call(isForceReload, state);
    if (forceReload) {
        const uri: SagaReturnType<typeof getRouteUri> = yield call(getRouteUri, state);
        yield call(setLocation, uri.replace(/\/reload(\W|$)/, "$1"));
    }
}

export function* updateReport(action: ReturnType<typeof reportIdChanged>) {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const reportId = action.payload.reportId;

    yield call(fetchReport, projectId, reportId);
}

export function* updateDraftReport(action: ReturnType<typeof sourceInsightChanged>) {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const sourceInsightId = action.payload.sourceInsightId;

    yield call(fetchDraftReport, projectId, sourceInsightId);
}

export function* locationChanged(action: ReturnType<typeof locationChangedCreator>) {
    /**
     * THE ROUTE WRITE AND THE RESET DECISION COME FIRST, before anything that can yield or
     * dispatch — including the click handlers `document.body.click()` below can fire. The prefix up
     * to the two puts is synchronous effects only, so a rapid follow-up navigation cannot cancel
     * this takeLatest worker before the route pair and the reset have landed.
     *
     * The previous route is the pre-navigation `route` value read HERE: LOCATION_CHANGED itself
     * writes nothing, so the read still sees the old value, and the `routeChanged` event carries the
     * pair for the two leaves (store/router/route_leaf_reducers.ts). The reset decision is pure over
     * the same pair.
     */
    const previousRoute: ReturnType<typeof getRouteState> = yield select(getRouteState);
    const route: ReturnType<typeof buildNextRoute> = yield call(
        buildNextRoute,
        action.payload.hash,
        previousRoute,
    );

    yield put(routeChanged(route, previousRoute));

    if (shouldResetOnNavigation(route, previousRoute)) {
        const visualizationClasses: ReturnType<typeof getVisualizationClassesState> = yield select(
            getVisualizationClassesState,
        );
        yield put(wholeApplicationReset({ reset: buildApplicationResetCarrier(visualizationClasses) }));
    }

    // hide menu and dialogs
    document.body.click();

    const state: IAppState = yield select();

    const explainType: ReturnType<typeof getExplainType> = yield select(getExplainType);

    const explainRequested: ReturnType<typeof isExplainRequested> = yield select(isExplainRequested);
    const explainSupported: ReturnType<typeof isExplainSupported> = yield select(isExplainSupported);

    if (explainRequested && explainSupported) {
        if (explainExecDef) {
            yield call(explainDownload, explainExecDef, { explainType });
            return;
        } else {
            yield put(requestExplain());
        }
    }

    const locationChangeLocked: SagaReturnType<typeof isLocationChangeLocked> = yield call(
        isLocationChangeLocked,
        state,
    );
    if (locationChangeLocked) {
        yield put(locationRedirectLock(false));
        return;
    }

    const fullReloadNeeded: SagaReturnType<typeof isFullReloadNeeded> = yield call(isFullReloadNeeded, state);
    if (fullReloadNeeded) {
        yield call(invokeFullReload, state);
        return;
    }

    const isReportIdParamChanged: SagaReturnType<typeof reportIdParamChanged> = yield call(
        reportIdParamChanged,
        state,
    );
    if (isReportIdParamChanged) {
        const newReportId: SagaReturnType<typeof getReportId> = yield call(getReportId, state);
        yield put(setAttributeHierarchiesChanged(false));
        yield put(reportIdChanged(newReportId));
    } else {
        const isSourceInsightChanged: SagaReturnType<typeof isSourceInsightParamChanged> = yield call(
            isSourceInsightParamChanged,
            state,
        );
        if (isSourceInsightChanged) {
            const sourceInsightId: SagaReturnType<typeof getSourceInsightId> = yield call(
                getSourceInsightId,
                state,
            );
            yield put(setAttributeHierarchiesChanged(false));
            yield put(sourceInsightChanged(sourceInsightId));
        }
    }

    const shouldLoadAttributeHierarchies: SagaReturnType<typeof hasAttributeHierarchiesChanged> =
        yield select(hasAttributeHierarchiesChanged);

    if (shouldLoadAttributeHierarchies) {
        yield call(loadAttributeHierarchies);
    }

    yield put(routeParamsChanged());
}

function* openCurrentInsightInNewTab() {
    const state: IAppState = yield select();
    const uriParams: SagaReturnType<typeof getRouteParams> = yield call(getRouteParams, state);
    // The page of the host shell that owns AD, without the embedding query params.
    const uri = `/workspace/${uriParams.projectId}/analyze/${getBaseUri(uriParams)}`;
    open(uri, "_blank");
}

export function* watchRouter() {
    yield takeLatest(ActionTypeKeys.LOCATION_CHANGED, locationChanged);
    yield takeEvery(ActionTypeKeys.UI_CHANGE_DATASET, setDatasetRouteParam);
    yield takeLatest(ActionTypeKeys.SAGA_REPORT_ID_CHANGED, updateReport);
    yield takeLatest(ActionTypeKeys.SAGA_SOURCE_INSIGHT_CHANGED, updateDraftReport);
    yield takeEvery(ActionTypeKeys.UI_OPEN_IN_ANALYTICAL_DESIGNER, openCurrentInsightInNewTab);
}
