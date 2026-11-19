// (C) 2021-2026 GoodData Corporation

import { call, takeEvery } from "redux-saga/effects";

import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IHostVerificationErroredAction,
    type IHostVerificationFailedAction,
    type IInsecureCommandFailedAction,
} from "../actions/command_error_actions.js";
import {
    hostDomainVerificationErroredEvent,
    hostDomainVerificationFailedEvent,
    insecureCommandFailedEvent,
} from "../outgoing/command_error_events.js";

import { getPostMessageContextId } from "./post_message_saga_helper.js";

export function* handleNoPermissionToSecureCommand({
    payload: { postMessageContext, commandType },
}: IInsecureCommandFailedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    yield call(insecureCommandFailedEvent, commandType, contextId);
}

export function* handleHostVerificationFailed({
    payload: { postMessageContext },
}: IHostVerificationFailedAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    yield call(hostDomainVerificationFailedEvent, contextId);
}

export function* handleHostVerificationErrored({
    payload: { postMessageContext },
}: IHostVerificationErroredAction) {
    const contextId: string = getPostMessageContextId(postMessageContext);
    yield call(hostDomainVerificationErroredEvent, contextId);
}

export function* watchInsecureCommand() {
    yield takeEvery(PostEventActionTypeKeys.INSECURE_COMMAND_FAILED, handleNoPermissionToSecureCommand);
    yield takeEvery(PostEventActionTypeKeys.HOST_VERIFICATION_FAILED, handleHostVerificationFailed);
    yield takeEvery(PostEventActionTypeKeys.HOST_VERIFICATION_ERRORED, handleHostVerificationErrored);
}
