// (C) 2020-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { GdcAdEventType } from "@gooddata/sdk-embedding";

import { resetApplication } from "../actions/app_context_actions.js";
import {
    type ILeaveAnywayButtonClickedAction,
    type IShowConfirmUnsavedChangesDialogAction,
    showConfirmUnsageChangesDialogAction,
} from "../actions/confirm_unsaved_changes_actions.js";
import { deleteDataSamplingPercentage } from "../actions/data_sample_actions.js";
import { hideDialog } from "../actions/dialogs_actions.js";
import { runPendingHostNavigation } from "../appMode/pendingHostNavigation.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { HOST_NAVIGATION } from "../constants/platform.js";
import { adPostEvent } from "../postMessageApi/outgoing/post_event_helper.js";
import { metricEditorShowUnsavedChangesDialog } from "../store/metric_editor/metric_editor_actions.js";
import { hasMetricEditorUnsavedChanges } from "../store/metric_editor/metric_editor_selector.js";

export function* showConfirmUnsavedChangesDialog(action: IShowConfirmUnsavedChangesDialogAction) {
    const { active } = action.payload;

    const metricEditorDialogUnsaved: ReturnType<typeof hasMetricEditorUnsavedChanges> = yield select(
        hasMetricEditorUnsavedChanges,
    );
    if (metricEditorDialogUnsaved) {
        yield put(metricEditorShowUnsavedChangesDialog(action.payload.data));
    } else if (active) {
        yield put(showConfirmUnsageChangesDialogAction(action.payload));
    }
}

export function* unsaveChangeDialogLeaveAnywayButtonClicked(action: ILeaveAnywayButtonClickedAction) {
    const { goToPage, firePostMessage } = action.payload;
    if (goToPage === HOST_NAVIGATION) {
        // The host tears this application down as part of navigating, so there is nothing to reset.
        yield put(hideDialog());
        yield call(runPendingHostNavigation);
        return;
    }
    if (firePostMessage) {
        yield call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null);
    }
    yield put(resetApplication());
    yield put(deleteDataSamplingPercentage());
    yield put(hideDialog());
}

export function* confirmUnsavedChangesWatcher() {
    yield takeEvery(ActionTypeKeys.SAGA_CONFIRM_UNSAVED_CHANGES_REQUEST, showConfirmUnsavedChangesDialog);
    yield takeEvery(
        ActionTypeKeys.UI_UNSAVE_CHANGES_DIALOG_LEAVE_ANYWAY_BUTTON_CLICKED,
        unsaveChangeDialogLeaveAnywayButtonClicked,
    );
}
