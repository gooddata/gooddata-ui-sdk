// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, delay, put, select, takeEvery } from "redux-saga/effects";

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { type ObjRef, insightUri, isIdentifierRef, objRefToString } from "@gooddata/sdk-model";

import {
    DeleteReportFailureReason,
    type IDeleteReportAction,
    deleteReportConfirmation,
    deleteReportFailed,
    deleteReportFinished,
    deleteReportStarted,
    hideSuccessMessage,
} from "../actions/delete_actions.js";
import { backend } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getLastSavedReportUri } from "../selectors/report_selector.js";
import {
    logVisualizationDeleteFailed,
    logVisualizationDeleted,
} from "../services/telemetry/tracking_events.js";
import { buildApplicationResetCarrier } from "../store/app_context/application_reset_events.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { getRouteUri, setLocation } from "../utils/location.js";
import { logError } from "../utils/logging/error_logging.js";

export const HIDE_DELETE_MESSAGE_AFTER = 2500;

export function getStartTime(): number {
    return Date.now();
}

export function getDuration(startTime: number): number {
    return Date.now() - startTime;
}

export function getCurrentlyOpenedReportUri(state: IAppState): string | undefined {
    return getLastSavedReportUri(state);
}

export function performDelete(projectId: string, insightRef: ObjRef) {
    return backend.workspace(projectId).insights().deleteInsight(insightRef);
}

export function* deleteReport({ payload: { insightRef, forceDelete, meta } }: IDeleteReportAction) {
    if (forceDelete) {
        const startTime: ReturnType<typeof getStartTime> = yield call(getStartTime);
        try {
            let uri = objRefToString(insightRef);
            const workspaceId: ReturnType<typeof getProjectId> = yield select(getProjectId);

            if (isIdentifierRef(insightRef)) {
                const getInsight = backend.workspace(workspaceId).insights().getInsight;
                const insight: SagaReturnType<typeof getInsight> = yield call(getInsight, insightRef);
                uri = insightUri(insight);
            }

            // Check whether the currently opened report is being deleted needs to be done before
            // the DELETE_REPORT_START action, cause after the action the currently opened report
            // will be gone.
            const openReportUri: ReturnType<typeof getCurrentlyOpenedReportUri> =
                yield select(getCurrentlyOpenedReportUri);
            const isDeletingCurrentlyOpenedReport = openReportUri === uri;
            yield put(deleteReportStarted(insightRef));

            yield call(performDelete, workspaceId, insightRef);

            if (isDeletingCurrentlyOpenedReport) {
                const uri: ReturnType<typeof getRouteUri> = yield select(getRouteUri, {
                    reportId: DEFAULT_REPORT_ID,
                });

                yield call(setLocation, uri);
            }

            const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);

            // Deleting the OPEN report resets the application; the carrier's presence on the
            // event IS that condition, decided here where the fact is known — so the reset lands
            // in the same dispatch as the delete-finished writes, so the
            // transformer's did (store/app_context/application_reset_events.ts).
            if (isDeletingCurrentlyOpenedReport) {
                const visualizationClasses: ReturnType<typeof getVisualizationClassesState> = yield select(
                    getVisualizationClassesState,
                );
                const reset: SagaReturnType<typeof buildApplicationResetCarrier> = yield call(
                    buildApplicationResetCarrier,
                    visualizationClasses,
                );
                yield put(deleteReportFinished(duration, uri, reset));
            } else {
                yield put(deleteReportFinished(duration, uri));
            }

            yield delay(HIDE_DELETE_MESSAGE_AFTER);

            yield put(hideSuccessMessage());

            const state: IAppState = yield select();

            yield call(logVisualizationDeleted, { state, time: duration });
        } catch (error) {
            logError("Error while deleting insight", error);

            const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
            const reason = isUnexpectedResponseError(error)
                ? DeleteReportFailureReason.FAILED_TO_DELETE_REFERENCED_REPORT
                : DeleteReportFailureReason.UNKNOWN;

            yield put(deleteReportFailed(duration, reason, error as Error));

            const state: IAppState = yield select();

            yield call(logVisualizationDeleteFailed, { state, time: duration });
        }
    } else {
        yield put(deleteReportConfirmation(insightRef, meta));
    }
}

export function* watchDeleteReport() {
    yield takeEvery(ActionTypeKeys.DELETE_REPORT_REQUESTED, deleteReport);
}
