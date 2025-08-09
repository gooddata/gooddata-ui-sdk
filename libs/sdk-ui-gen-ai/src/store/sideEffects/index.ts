// (C) 2024-2025 GoodData Corporation

import { call, fork, takeEvery, takeLatest } from "redux-saga/effects";
import {
    setVerboseAction,
    loadThreadAction,
    clearThreadAction,
    newMessageAction,
    setUserFeedback,
    saveVisualizationAction,
    saveVisualizationSuccessAction,
    saveVisualisationRenderStatusAction,
} from "../messages/messagesSlice.js";
import { onVerboseStore } from "./onVerboseStore.js";
import { onThreadLoad } from "./onThreadLoad.js";
import { onThreadClear } from "./onThreadClear.js";
import { onUserMessage } from "./onUserMessage.js";
import { onUserFeedback } from "./onUserFeedback.js";
import { onVisualizationSuccessSave } from "./onVisualizationSuccessSave.js";
import { onVisualisationRender } from "./onVisualisationRender.js";
import { onEvent } from "./onEvent.js";
import { onVisualizationSave } from "./onVisualizationSave.js";
import { loadColorPalette } from "./loadColorPalette.js";

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
