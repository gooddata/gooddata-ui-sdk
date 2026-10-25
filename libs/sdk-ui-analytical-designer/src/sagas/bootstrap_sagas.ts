// (C) 2007-2026 GoodData Corporation

import { SpanStatusCode, trace } from "@opentelemetry/api";
import { all, call, put, select } from "redux-saga/effects";

import { isContractExpired, isNotAuthenticated, isProtectedDataError } from "@gooddata/sdk-backend-spi";

import {
    type BootstrapError,
    appFinishedLoading,
    appFinishedSuccessfulInitialization,
    appStartedLoading,
    bootstrapError,
    loadExternalScripts,
} from "../actions/app_context_actions.js";
import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { externalScripts, getProjectId } from "../selectors/bootstrap_selector.js";
import { SERVICE_NAME, VERSION } from "../services/telemetry/openTelemetry/constants.js";
import { logAccessingAD } from "../services/telemetry/tracking_events.js";
import { setCatalogFirstLoaded } from "../store/catalog/catalog_store_actions.js";
import { type IAppState } from "../store/types.js";
import { type ICustomRouteParams } from "../typings/location.js";
import { logError } from "../utils/logging/error_logging.js";

import { fetchBootstrapData } from "./bootstrap/bootstrapData.js";
import { setupTigerTelemetryTracking } from "./bootstrap/tiger.js";
import {
    NOT_AUTHENTICATED_ERROR,
    NOT_AUTHORIZED_ERROR,
    verifyUserAccess,
} from "./bootstrap/verifyUserAccess.js";
import { loadCatalog } from "./catalog/catalog_saga.js";
import { initializeDateDatasetsMeta } from "./date_datasets/date_datasets_sagas.js";
import { fetchDraftReport, fetchReport } from "./open_report_sagas.js";
import { loadVisualizationClasses } from "./visualization_class_sagas.js";

export function* logAccess() {
    const state: IAppState = yield select();
    yield call(logAccessingAD, { state });
}

export function* bootstrap(routeParams: ICustomRouteParams) {
    const { projectId, reportId, sourceInsight: sourceInsightId } = routeParams;

    yield put(appStartedLoading());

    const bootstrapSpan = trace.getTracer(SERVICE_NAME, VERSION).startSpan("appBootstrap");

    yield call(logAccess);

    try {
        yield call(fetchBootstrapData, routeParams);

        yield call(setupTigerTelemetryTracking);

        // Verify if user has all required permissions & feature flags for current app context
        // Throws error, when not
        yield call(verifyUserAccess);

        // Load external scripts, when provided
        const extScripts: ReturnType<typeof externalScripts> = yield select(externalScripts);
        if (extScripts) {
            yield put(loadExternalScripts(extScripts));
        }

        // Set current workspaceId as a stashed project in the user profile settings
        const currentProjectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

        yield call(loadVisualizationClasses, currentProjectId);

        if (reportId === DEFAULT_REPORT_ID) {
            if (sourceInsightId) {
                // if opening a report right away, load catalog and date datasets meta first as we need
                // them for report opening and force availability refresh for reloads
                // this will always just set the available items to null as there are no buckets at this point
                yield all([call(loadCatalog, true), call(initializeDateDatasetsMeta)]);
                yield call(fetchDraftReport, currentProjectId, sourceInsightId);
            }

            // if not opening a report right away, load catalog after appFinishedLoading to increase perceived responsiveness
            yield put(appFinishedLoading());
            if (!sourceInsightId) {
                yield put(setCatalogFirstLoaded(false));
                yield all([call(loadCatalog), call(initializeDateDatasetsMeta)]);
            }
            yield put(appFinishedSuccessfulInitialization(true));
        } else {
            // if opening a report right away, load catalog and date datasets meta first as we need
            // them for report opening and force availability refresh for reloads
            // this will always just set the available items to null as there are no buckets at this point
            yield all([call(loadCatalog, true), call(initializeDateDatasetsMeta)]);
            yield call(fetchReport, currentProjectId, reportId);
            yield put(appFinishedLoading());
            yield put(appFinishedSuccessfulInitialization(false));
        }
    } catch (error) {
        logError("Error during bootstrap", error);

        // convert SDK8 errors to legacy errors for which there is already proper handling in place
        if (isNotAuthenticated(error)) {
            yield put(bootstrapError(projectId, NOT_AUTHENTICATED_ERROR));
        } else if (isProtectedDataError(error)) {
            yield put(bootstrapError(projectId, NOT_AUTHORIZED_ERROR));
        } else {
            const bootstrapErr = error as BootstrapError;
            yield put(bootstrapError(projectId, bootstrapErr));
            if (isContractExpired(error)) {
                yield put(appFinishedLoading());
            }
        }
        bootstrapSpan.setStatus({ code: SpanStatusCode.ERROR });
        bootstrapSpan.addEvent("BootstrapError");
    } finally {
        bootstrapSpan.end();
    }
}
