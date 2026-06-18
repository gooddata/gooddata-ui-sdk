// (C) 2024-2026 GoodData Corporation

import { call, fork, takeEvery, takeLatest } from "redux-saga/effects";

import { setOpenAction } from "../chatWindow/chatWindowSlice.js";
import {
    clearThreadAction,
    deleteConversationAction,
    evaluateMessageUpdateAction,
    loadThreadAction,
    newMessageAction,
    pinConversationAction,
    renameConversationAction,
    saveVisualisationRenderStatusAction,
    saveVisualizationAction,
    saveVisualizationSuccessAction,
    setUserFeedback,
    setVerboseAction,
} from "../messages/messagesSlice.js";

import { loadAgents } from "./loadAgents.js";
import { loadCatalogItems } from "./loadCatalogItems.js";
import { loadColorPalette } from "./loadColorPalette.js";
import { loadSettings } from "./loadSettings.js";
import { onChatOpenSync } from "./onChatOpenSync.js";
import { onConversationDelete } from "./onConversationDelete.js";
import { onConversationPin } from "./onConversationPin.js";
import { onConversationRename } from "./onConversationRename.js";
import { onEvent } from "./onEvent.js";
import { onThreadClear } from "./onThreadClear.js";
import { onThreadLoad } from "./onThreadLoad.js";
import { onUserFeedback } from "./onUserFeedback.js";
import { onUserMessage } from "./onUserMessage.js";
import { onUserMessageUpdate } from "./onUserMessageUpdate.js";
import { onVerboseStore } from "./onVerboseStore.js";
import { onVisualisationRender } from "./onVisualisationRender.js";
import { onVisualizationSave } from "./onVisualizationSave.js";
import { onVisualizationSuccessSave } from "./onVisualizationSuccessSave.js";

/**
 * One saga to rule them all.
 * @internal
 */
export function* rootSaga() {
    yield takeLatest(loadThreadAction.type, onThreadLoad);
    yield takeLatest(clearThreadAction.type, onThreadClear);
    // Re-sync the active conversation with the backend when the chat is (re)opened so that
    // a conversation started/switched on another host micro-frontend is reflected without reload.
    yield takeLatest(setOpenAction.type, onChatOpenSync);
    yield takeEvery(newMessageAction.type, onUserMessage);
    //messages API
    yield takeEvery(setUserFeedback.type, onUserFeedback);
    yield takeEvery(saveVisualizationAction.type, onVisualizationSave);
    yield takeEvery(saveVisualizationSuccessAction.type, onVisualizationSuccessSave);
    yield takeEvery(saveVisualisationRenderStatusAction.type, onVisualisationRender);
    //conversations API
    yield takeEvery(pinConversationAction.type, onConversationPin);
    yield takeEvery(renameConversationAction.type, onConversationRename);
    yield takeEvery(deleteConversationAction.type, onConversationDelete);
    yield takeEvery(evaluateMessageUpdateAction.type, onUserMessageUpdate);
    //others
    yield takeEvery(setVerboseAction.type, onVerboseStore);
    yield fork(onEvent);
    yield call(loadColorPalette);
    yield call(loadSettings);
    yield call(loadAgents);
    yield call(loadCatalogItems);
}
