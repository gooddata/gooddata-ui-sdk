// (C) 2007-2026 GoodData Corporation

import { isAnyOf } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import {
    type SagaReturnType,
    all,
    call,
    delay,
    put,
    race,
    select,
    take,
    takeEvery,
} from "redux-saga/effects";

import {
    type AccessGranularPermission,
    type IInsight,
    type IInsightDefinition,
    insightUri,
} from "@gooddata/sdk-model";

import { resetInsightUsageOnDashboards } from "../actions/data_actions.js";
import {
    hideConfirmUnsavedChangesDialog,
    hideDialog,
    showDialogSavingUntitledReport,
} from "../actions/dialogs_actions.js";
import { createEmbedDialogOpenAction } from "../actions/embed_dialog_actions.js";
import { delayedLongSaving } from "../actions/messages_actions.js";
import {
    type ISaveReportCheckAction,
    type ISaveReportRequestedAction,
    type ISaveReportStartedAction,
    hideSuccessMessage,
    saveReportError,
    saveReportFinished,
    saveReportRequested as saveReportRequestedCreator,
    saveReportStarted,
} from "../actions/save_actions.js";
import { backend } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { saveInsightFailed, saveInsightFinished } from "../postMessageApi/actions/save_insight_actions.js";
import { getPostMessageContextId } from "../postMessageApi/sagas/post_message_saga_helper.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { enableVisualizationPermissions } from "../selectors/feature_flag_selector.js";
import { getInsightForCreateViaMd, getInsightForSaveViaMd } from "../selectors/insight_selectors.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import {
    getLastSavedReportPermissions,
    getReportSummary,
    isReportSavedSelector,
} from "../selectors/report_selector.js";
import { getDatasetIdentifier } from "../selectors/route_selector.js";
import { hasDescriptionChanged, hasTitleChanged } from "../selectors/save_report_selector.js";
import { isReportTitleEmpty } from "../services/report_service.js";
import {
    logInsightCreated,
    logInsightCreatedFailed,
    logInsightSavedOrEdited,
    logVisualizationSaveFailed,
    logVisualizationSaved,
} from "../services/telemetry/tracking_events.js";
import { locationRedirectLock } from "../store/router/router_actions.js";
import { type IAppState } from "../store/types.js";
import { type IVisualization } from "../typings/bear/bearTypes.js";
import { getObjectIdFromUri } from "../utils/api.js";
import { getRouteUri, setLocation } from "../utils/location.js";
import { logError } from "../utils/logging/error_logging.js";
import { convertModelInsightToADRep } from "../utils/sdkModelToADRep/InsightConverter.js";
import { getDuration, getTime } from "../utils/timers.js";

import { updateDateDataSets } from "./date_datasets/date_datasets_sagas.js";
import { changedDescriptionSaved } from "./description_tooltip/description_tooltip_ui_actions.js";
import { applyDraftedInsightAccess } from "./insight_access_sagas.js";
import { getInsight } from "./open_report_sagas.js";

export const SHOW_LONG_SAVING_MESSAGE_AFTER = 1000;
export const HIDE_SUCCESS_MESSAGE_AFTER = 2500;

export function performSaveExisting(projectId: string, insightToSave: IInsight) {
    const saver = backend.workspace(projectId).insights();
    return saver.updateInsight(insightToSave);
}

export function performSaveNew(projectId: string, insightToSave: IInsightDefinition) {
    const saver = backend.workspace(projectId).insights();
    return saver.createInsight(insightToSave);
}

export function getReportObjectForSaveEmbeddingMessage(_projectId: string, insight: IInsight) {
    return insight;
}

// the save response carries no permissions: an update changes no grants, a new visualization is asked for its own
export function* savedInsightPermissions(
    projectId: string,
    reportId: string,
    isUpdate: boolean,
): SagaIterator<AccessGranularPermission[] | undefined> {
    const enabled: ReturnType<typeof enableVisualizationPermissions> = yield select(
        enableVisualizationPermissions,
    );
    if (!enabled) {
        return undefined;
    }
    if (isUpdate) {
        const kept: ReturnType<typeof getLastSavedReportPermissions> = yield select(
            getLastSavedReportPermissions,
        );
        return kept;
    }
    try {
        const { insight }: SagaReturnType<typeof getInsight> = yield call(getInsight, projectId, reportId);
        return insight.insight.permissions;
    } catch (error) {
        logError("Error while loading permissions of the saved insight", error);
        return undefined;
    }
}

export function* saveReport({
    payload: { saveAsNew, editingFromKD, postMessageContext },
}: ISaveReportStartedAction): SagaIterator<void> {
    const state: IAppState = yield select();
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const isReportSaved: ReturnType<typeof isReportSavedSelector> = yield select(isReportSavedSelector);
    const descriptionChanged = hasDescriptionChanged(state);

    const contextId: string = getPostMessageContextId(postMessageContext);
    const isUpdate = isReportSaved && !saveAsNew;

    const startTime: ReturnType<typeof getTime> = yield call(getTime);
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield call(getIsEmbedded, state);

    const insightToSave:
        | ReturnType<typeof getInsightForSaveViaMd>
        | ReturnType<typeof getInsightForCreateViaMd> = yield select(
        isUpdate ? getInsightForSaveViaMd : getInsightForCreateViaMd,
    );

    let insightResponse: SagaReturnType<typeof performSaveExisting>;
    try {
        insightResponse = isUpdate
            ? yield call(performSaveExisting, projectId, insightToSave as IInsight)
            : yield call(performSaveNew, projectId, insightToSave);
    } catch (error) {
        logError("Error while saving insight", error);

        const time: ReturnType<typeof getDuration> = yield call(getDuration, startTime);

        yield put(saveReportError(saveAsNew, time, editingFromKD, error as Error));
        yield call(logInsightCreatedFailed, { state });

        if (isEmbedded) {
            yield put(saveInsightFailed(saveAsNew, time, contextId));
        }

        yield call(logVisualizationSaveFailed, {
            saveAsNew,
            isUpdate,
            state,
            time,
            editingFromKD,
        });

        return;
    }

    const reportId = getObjectIdFromUri(insightUri(insightResponse));
    if (!isUpdate) {
        yield call(applyDraftedInsightAccess, projectId, reportId);
    }
    const permissions = yield* savedInsightPermissions(projectId, reportId, isUpdate);
    const reportMDObject: IVisualization = {
        visualizationObject: convertModelInsightToADRep(
            { insight: { ...insightResponse.insight, ...(permissions && { permissions }) } },
            true,
        ),
    };

    const activeDatasetId: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);

    yield call(updateDateDataSets, projectId, activeDatasetId, insightResponse);

    const duration: ReturnType<typeof getDuration> = yield call(getDuration, startTime);

    const newUri: ReturnType<typeof getRouteUri> = yield select(getRouteUri, { reportId });

    if (!isUpdate) {
        yield put(locationRedirectLock(true));
        yield call(setLocation, newUri);
        // unlock (locationRedirectLock(false)) is triggered in location change handler
        yield call(logInsightCreated, { state });
    }

    yield put(saveReportFinished(reportMDObject, saveAsNew, duration, editingFromKD));
    if (descriptionChanged) {
        yield put(changedDescriptionSaved(getReportSummary(state)));
    }

    if (isEmbedded) {
        if (editingFromKD) {
            yield put(hideDialog());
        }
        // embedding objects are a bit different so we need to get them differently, insight conversion is not enough
        // ideally, we would like to use IInsight objects directly here in the future
        const reportObjectForSaveEmbeddingMessage: IVisualization | IInsight = yield call(
            getReportObjectForSaveEmbeddingMessage,
            projectId,
            insightResponse,
        );

        yield put(saveInsightFinished(reportObjectForSaveEmbeddingMessage, saveAsNew, duration, contextId));
    }

    yield call(logVisualizationSaved, {
        saveAsNew,
        isUpdate,
        state,
        time: duration,
        editingFromKD,
        insight: insightResponse,
    });

    yield call(logInsightSavedOrEdited, {
        isUpdate,
        state,
    });

    yield delay(HIDE_SUCCESS_MESSAGE_AFTER);

    yield put(hideSuccessMessage());
}

export function* saveReportCheck({
    payload: { saveAsNew, editingFromKD, reOpenEmbedDialog },
}: ISaveReportCheckAction): SagaIterator<void> {
    const isTitleEmpty: ReturnType<typeof isReportTitleEmpty> = yield select(isReportTitleEmpty);
    const titleChanged: ReturnType<typeof hasTitleChanged> = yield select(hasTitleChanged);
    const isTitleChangeRequired = saveAsNew && !titleChanged;

    if (!editingFromKD && (isTitleEmpty || isTitleChangeRequired)) {
        yield put(showDialogSavingUntitledReport({ saveAsNew, reOpenEmbedDialog }));
    } else {
        yield put(hideConfirmUnsavedChangesDialog());
        yield put(saveReportRequestedCreator(saveAsNew, editingFromKD));
    }
}

/** The save terminated, either way. An RTK matcher over the two creators, not a string list. */
export const isSavingDoneAction = isAnyOf(saveReportFinished, saveReportError);

export function* saveReportRequested({
    payload: { saveAsNew, editingFromKD, postMessageContext, reOpenEmbedDialog },
}: ISaveReportRequestedAction): SagaIterator<void> {
    const contextId: string = getPostMessageContextId(postMessageContext);

    yield put(saveReportStarted(saveAsNew, undefined, editingFromKD, contextId));

    if (saveAsNew) {
        yield put(resetInsightUsageOnDashboards());
    }
    // If 1s comes before the save report finished,
    // show long saving message
    const {
        isSavingTooLong,
    }: {
        isSavingTooLong: boolean;
    } = yield race({
        isSavingTooLong: delay(SHOW_LONG_SAVING_MESSAGE_AFTER),
        reportSaved: take(isSavingDoneAction),
    });

    if (isSavingTooLong) {
        yield put(delayedLongSaving());
    }

    if (reOpenEmbedDialog) {
        yield delay(isSavingTooLong ? SHOW_LONG_SAVING_MESSAGE_AFTER : 0);
        yield put(createEmbedDialogOpenAction());
    }
}

export function* watchSaveReport() {
    yield all([
        takeEvery(ActionTypeKeys.SAVE_REPORT_STARTED, saveReport),
        takeEvery(ActionTypeKeys.SAVE_REPORT_CHECK, saveReportCheck),
        takeEvery(ActionTypeKeys.SAVE_REPORT_REQUESTED, saveReportRequested),
    ]);
}
