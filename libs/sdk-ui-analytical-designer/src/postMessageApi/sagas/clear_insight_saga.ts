// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { resetApplication } from "../../actions/app_context_actions.js";
import { reportSaving } from "../../selectors/editor_header_selector.js";
import { isResetDisabledSelector } from "../../selectors/reset_button_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IClearInsightFailedAction,
    type IClearInsightFinishedAction,
    type IClearInsightRequestedAction,
    clearInsightFailed,
    clearInsightFished,
} from "../actions/clear_insight_actions.js";
import { clearFailedEvent, clearFinishedEvent } from "../outgoing/clear_insight_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { getPostMessageContextId } from "./post_message_saga_helper.js";

export function* handleClearInsightFailed({ payload: { postMessageContext } }: IClearInsightFailedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    yield call(clearFailedEvent, contextId);
}

export function* handleClearInsightFinished({
    payload: { postMessageContext },
}: IClearInsightFinishedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(clearFinishedEvent, availableCommands, contextId);
}

export function* clearInsightRequested({ payload: { postMessageContext } }: IClearInsightRequestedAction) {
    const isResetDisabled: ReturnType<typeof isResetDisabledSelector> = yield select(isResetDisabledSelector);
    const isReportSaving: ReturnType<typeof reportSaving> = yield select(reportSaving);

    const contextId: string = getPostMessageContextId(postMessageContext);
    if (isResetDisabled || isReportSaving) {
        yield put(clearInsightFailed(contextId));
        return;
    }
    yield put(resetApplication());
    yield put(clearInsightFished(contextId));
}

export function* watchClear() {
    yield takeEvery(PostEventActionTypeKeys.CLEAR_INSIGHT_REQUESTED, clearInsightRequested);
    yield takeEvery(PostEventActionTypeKeys.CLEAR_INSIGHT_FAILED, handleClearInsightFailed);
    yield takeEvery(PostEventActionTypeKeys.CLEAR_INSIGHT_FINISHED, handleClearInsightFinished);
}
