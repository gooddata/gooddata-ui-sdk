// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { undo } from "../../actions/time_travel_actions.js";
import { reportSaving, undoPossible } from "../../selectors/editor_header_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IUndoFailedAction,
    type IUndoFinishedAction,
    type IUndoRequestedAction,
    undoFailed,
    undoFinished,
} from "../actions/undo_actions.js";
import { undoFailedEvent, undoFinishedEvent } from "../outgoing/undo_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { getPostMessageContextId } from "./post_message_saga_helper.js";

export function* undoRequested({ payload: { postMessageContext } }: IUndoRequestedAction) {
    const isUndoPossible: ReturnType<typeof undoPossible> = yield select(undoPossible);
    const isReportSaving: ReturnType<typeof reportSaving> = yield select(reportSaving);
    const isUndoDisabled = !isUndoPossible || isReportSaving;

    const contextId = getPostMessageContextId(postMessageContext);

    if (isUndoDisabled) {
        yield put(undoFailed(contextId));
        return;
    }

    yield put(undo());
    yield put(undoFinished(contextId));
}

export function* handleUndoFailed({ payload: { postMessageContext } }: IUndoFailedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    yield call(undoFailedEvent, contextId);
}

export function* handleUndoFinished({ payload: { postMessageContext } }: IUndoFinishedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(undoFinishedEvent, availableCommands, contextId);
}

export function* watchUndo() {
    yield takeEvery(PostEventActionTypeKeys.UNDO_REQUESTED, undoRequested);
    yield takeEvery(PostEventActionTypeKeys.UNDO_FAILED, handleUndoFailed);
    yield takeEvery(PostEventActionTypeKeys.UNDO_FINISHED, handleUndoFinished);
}
