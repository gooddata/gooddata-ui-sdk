// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { clearInsightContent } from "../../actions/app_context_actions.js";
import { reportSaving } from "../../selectors/editor_header_selector.js";
import { isClearInsightContentDisabledSelector } from "../../selectors/reset_button_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IClearInsightContentFailedAction,
    type IClearInsightContentFinishedAction,
    type IClearInsightContentRequestedAction,
    clearInsightContentFailed,
    clearInsightContentFished,
} from "../actions/clear_insight_content_actions.js";
import {
    clearInsightContentFailedEvent,
    clearInsightContentFinishedEvent,
} from "../outgoing/clear_insight_content_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { getPostMessageContextId } from "./post_message_saga_helper.js";

export function* handleClearInsightContentFailed({
    payload: { postMessageContext },
}: IClearInsightContentFailedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    yield call(clearInsightContentFailedEvent, contextId);
}

export function* handleClearInsightContentFinished({
    payload: { postMessageContext },
}: IClearInsightContentFinishedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(clearInsightContentFinishedEvent, availableCommands, contextId);
}

export function* clearInsightContentRequested({
    payload: { postMessageContext },
}: IClearInsightContentRequestedAction) {
    const isClearDisabled: ReturnType<typeof isClearInsightContentDisabledSelector> = yield select(
        isClearInsightContentDisabledSelector,
    );

    const isReportSaving: ReturnType<typeof reportSaving> = yield select(reportSaving);

    const contextId: string = getPostMessageContextId(postMessageContext);
    if (isClearDisabled || isReportSaving) {
        yield put(clearInsightContentFailed(contextId));
        return;
    }
    yield put(clearInsightContent());
    yield put(clearInsightContentFished(contextId));
}

export function* watchClearInsightContent() {
    yield takeEvery(PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_REQUESTED, clearInsightContentRequested);
    yield takeEvery(PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FAILED, handleClearInsightContentFailed);
    yield takeEvery(
        PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FINISHED,
        handleClearInsightContentFinished,
    );
}
