// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { GdcAdEventType } from "@gooddata/sdk-embedding";

import { displayConfirmUnsavedChangesDialogWithPostMessageAction } from "../../actions/confirm_unsaved_changes_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { isReportChanging } from "../../selectors/confirm_unsaved_changes_dialog_selector.js";
import { isExploreFromKD } from "../../selectors/route_selector.js";
import { hasMetricEditorUnsavedChanges } from "../../store/metric_editor/metric_editor_selector.js";
import { adPostEvent } from "../outgoing/post_event_helper.js";

export function* handleCancelEditFromKD() {
    const reportChanged: ReturnType<typeof isReportChanging> = yield select(isReportChanging);
    const exploreFromKd: ReturnType<typeof isExploreFromKD> = yield select(isExploreFromKD);
    const metricEditorChanged: ReturnType<typeof hasMetricEditorUnsavedChanges> = yield select(
        hasMetricEditorUnsavedChanges,
    );

    // Unsaved metric editor work is lost with the overlay no matter how AD was opened, so it asks
    // for confirmation even in explore mode (the confirm saga routes it to the metric editor's own
    // save-or-discard dialog, which posts the cancellation once resolved — same as host navigation).
    if ((reportChanged && !exploreFromKd) || metricEditorChanged) {
        yield put(displayConfirmUnsavedChangesDialogWithPostMessageAction());
    } else {
        yield call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null);
    }
}

export function* watchCancelEditFromKD() {
    yield takeEvery(ActionTypeKeys.CANCEL_EDIT_FROM_KD, handleCancelEditFromKD);
}
