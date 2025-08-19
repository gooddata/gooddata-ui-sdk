// (C) 2024-2025 GoodData Corporation

import { call, fork, takeEvery, takeLatest } from "redux-saga/effects";

import { loadColorPalette } from "./loadColorPalette.js";
import { onEvent } from "./onEvent.js";
import { onThreadClear } from "./onThreadClear.js";
import { onThreadLoad } from "./onThreadLoad.js";
import { onUserFeedback } from "./onUserFeedback.js";
import { onUserMessage } from "./onUserMessage.js";
import { onVerboseStore } from "./onVerboseStore.js";
import { onVisualisationRender } from "./onVisualisationRender.js";
import { onVisualizationSave } from "./onVisualizationSave.js";
import { onVisualizationSuccessSave } from "./onVisualizationSuccessSave.js";
import {
    clearThreadAction,
    loadThreadAction,
    newMessageAction,
    saveVisualisationRenderStatusAction,
    saveVisualizationAction,
    saveVisualizationSuccessAction,
    setUserFeedback,
    setVerboseAction,
} from "../messages/messagesSlice.js";

/**
 * One saga to rule them all.
 * @internal
 */
export function* rootSaga() {
    yield takeEvery(setVerboseAction.type, onVerboseStore);
    yield takeLatest(loadThreadAction.type, onThreadLoad);
    yield takeLatest(clearThreadAction.type, onThreadClear);
    yield takeLatest(newMessageAction.type, onUserMessage);
    yield takeEvery(setUserFeedback.type, onUserFeedback);
    yield takeEvery(saveVisualizationAction.type, onVisualizationSave);
    yield takeEvery(saveVisualizationSuccessAction.type, onVisualizationSuccessSave);
    yield takeEvery(saveVisualisationRenderStatusAction.type, onVisualisationRender);
    yield fork(onEvent);
    yield call(loadColorPalette);
}
