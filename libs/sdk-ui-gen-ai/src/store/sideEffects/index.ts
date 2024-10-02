// (C) 2024 GoodData Corporation

import { takeEvery, takeLatest } from "redux-saga/effects";
import { newMessageAction, setMessages, toggleVerboseAction } from "../messages/messagesSlice.js";
import { onVerboseStore } from "./onVerboseStore.js";
import { onNewMessage, onHistorySetMessage } from "./onNewMessage.js";

/**
 * One saga to rule them all.
 * @internal
 */
export function* rootSaga() {
    yield takeEvery(toggleVerboseAction.type, onVerboseStore);
    yield takeLatest(newMessageAction.type, onNewMessage);
    yield takeLatest(setMessages.type, onHistorySetMessage);
}
