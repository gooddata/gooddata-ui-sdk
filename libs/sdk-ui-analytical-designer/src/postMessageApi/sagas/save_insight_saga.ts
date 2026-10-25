// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { GdcErrorType } from "@gooddata/sdk-embedding";

import { reportTitleChange } from "../../actions/report_actions.js";
import { saveReportRequested } from "../../actions/save_actions.js";
import { isReportSavedSelector } from "../../selectors/report_selector.js";
import { isSaveAsNewDisabledSelector } from "../../selectors/save_report_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import { type ISaveAsInsightRequestedAction } from "../actions/save_as_insight_actions.js";
import {
    type ISaveInsightFailedAction,
    type ISaveInsightFinishedAction,
    type ISaveInsightRequestedAction,
    saveInsightFailed,
} from "../actions/save_insight_actions.js";
import {
    insightSaved,
    insightSavingFailed,
    insightSavingInvalidState,
} from "../outgoing/save_insight_events.js";
import { getPostMessageContextId } from "../sagas/post_message_saga_helper.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

type SaveInsightAction = ISaveInsightRequestedAction | ISaveAsInsightRequestedAction;

export function* saveInsight(action: SaveInsightAction, saveAsNew: boolean) {
    const {
        payload: { title, postMessageContext },
    } = action;
    const contextId = getPostMessageContextId(postMessageContext);
    const isSaveAsNewDisabled: ReturnType<typeof isSaveAsNewDisabledSelector> =
        yield select(isSaveAsNewDisabledSelector);
    const isReportSaved: ReturnType<typeof isReportSavedSelector> = yield select(isReportSavedSelector);
    const isInvalidState = saveAsNew ? isSaveAsNewDisabled || !isReportSaved : isSaveAsNewDisabled;
    if (isInvalidState) {
        yield put(saveInsightFailed(saveAsNew, undefined, contextId, GdcErrorType.InvalidState));
        return;
    }
    yield put(reportTitleChange(title));
    yield put(saveReportRequested(saveAsNew, false, contextId));
}

export function* handleSaveInsightRequested(action: ISaveInsightRequestedAction) {
    yield saveInsight(action, false);
}

export function* handleSaveAsInsightRequested(action: ISaveAsInsightRequestedAction) {
    yield saveInsight(action, true);
}

export function* handleSaveInsightFailed({
    payload: { postMessageContext, errorCode: errorType = GdcErrorType.RuntimeError },
}: ISaveInsightFailedAction) {
    const contextId = getPostMessageContextId(postMessageContext);

    if (errorType === GdcErrorType.InvalidState) {
        yield call(insightSavingInvalidState, contextId);
    } else {
        yield call(insightSavingFailed, contextId);
    }
}

export function* handleSaveInsightFinished({
    payload: { reportObjectForSaveEmbeddingMessage, postMessageContext },
}: ISaveInsightFinishedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(insightSaved, availableCommands, reportObjectForSaveEmbeddingMessage, contextId);
}

export function* watchSaveInsight() {
    yield takeEvery(PostEventActionTypeKeys.SAVE_INSIGHT_REQUESTED, handleSaveInsightRequested);
    yield takeEvery(PostEventActionTypeKeys.SAVE_AS_INSIGHT_REQUESTED, handleSaveAsInsightRequested);
    yield takeEvery(PostEventActionTypeKeys.SAVE_INSIGHT_FAILED, handleSaveInsightFailed);
    yield takeEvery(PostEventActionTypeKeys.SAVE_INSIGHT_FINISHED, handleSaveInsightFinished);
}
