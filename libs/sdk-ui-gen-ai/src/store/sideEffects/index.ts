// (C) 2024 GoodData Corporation

import { takeEvery, takeLatest } from "redux-saga/effects";
import {
    setVerboseAction,
    loadThreadAction,
    clearThreadAction,
    newMessageAction,
    evaluateMessageAction,
} from "../messages/messagesSlice.js";
import { onVerboseStore } from "./onVerboseStore.js";
import { onThreadLoad } from "./onThreadLoad.js";
import { onThreadClear } from "./onThreadClear.js";
import { onUserMessage } from "./onUserMessage.js";
import { threadPolling } from "./threadPolling.js";

/**
 * One saga to rule them all.
 * @internal
 */
export function* rootSaga() {
    yield takeEvery(setVerboseAction.type, onVerboseStore);
    yield takeLatest(loadThreadAction.type, onThreadLoad);
    yield takeLatest(clearThreadAction.type, onThreadClear);
    yield takeLatest(newMessageAction.type, onUserMessage);
    yield takeLatest(evaluateMessageAction.type, threadPolling);
}
