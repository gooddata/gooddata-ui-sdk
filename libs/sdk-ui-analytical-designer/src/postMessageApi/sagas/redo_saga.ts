// (C) 2007-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import { redo } from "../../actions/time_travel_actions.js";
import { redoPossible, reportSaving } from "../../selectors/editor_header_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IRedoFailedAction,
    type IRedoFinishedAction,
    type IRedoRequestedAction,
    redoFailed,
    redoFinished,
} from "../actions/redo_actions.js";
import { redoFailedEvent, redoFinishedEvent } from "../outgoing/redo_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { getPostMessageContextId } from "./post_message_saga_helper.js";

export function* redoRequested({ payload: { postMessageContext } }: IRedoRequestedAction) {
    const isRedoPossible: ReturnType<typeof redoPossible> = yield select(redoPossible);
    const isReportSaving: ReturnType<typeof reportSaving> = yield select(reportSaving);
    const isRedoDisabled = !isRedoPossible || isReportSaving;

    const contextId = getPostMessageContextId(postMessageContext);

    if (isRedoDisabled) {
        yield put(redoFailed(contextId));
        return;
    }
    yield put(redo());
    yield put(redoFinished(contextId));
}

export function* handleRedoFailed({ payload: { postMessageContext } }: IRedoFailedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    yield call(redoFailedEvent, contextId);
}

export function* handleRedoFinished({ payload: { postMessageContext } }: IRedoFinishedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(redoFinishedEvent, availableCommands, contextId);
}

export function* watchRedo() {
    yield takeEvery(PostEventActionTypeKeys.REDO_REQUESTED, redoRequested);
    yield takeEvery(PostEventActionTypeKeys.REDO_FAILED, handleRedoFailed);
    yield takeEvery(PostEventActionTypeKeys.REDO_FINISHED, handleRedoFinished);
}
