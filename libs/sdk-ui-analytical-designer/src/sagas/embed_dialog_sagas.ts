// (C) 2020-2026 GoodData Corporation

import { defineMessage } from "react-intl";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { type IEmbedDialogCopyCodeAction } from "../actions/embed_dialog_actions.js";
import { addMessage } from "../actions/messages_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { displayedMessagesSelector } from "../selectors/messages_selector.js";
import {
    logEmbedDialogCodeByReactCopied,
    logEmbedDialogCodeByWebComponentsCopied,
    logEmbedDialogOpen,
} from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";

export function* copyCode(action: IEmbedDialogCopyCodeAction) {
    const { codeType } = action.payload;
    const translationKey = defineMessage({ id: "embedInsightDialog.code.copied.success" }).id;

    const state: IAppState = yield select();

    const messages: ReturnType<typeof displayedMessagesSelector> = yield select(displayedMessagesSelector);

    const messageExist = messages.messages.find((message) => message.id === translationKey);

    if (!messageExist) {
        yield put(
            addMessage({
                type: "success",
                translationKey: translationKey,
                durationInMs: 3000,
            }),
        );
    }

    if (codeType === "react") {
        yield call(logEmbedDialogCodeByReactCopied, { state });
    } else {
        yield call(logEmbedDialogCodeByWebComponentsCopied, { state });
    }
}

export function* openEmbedDialog() {
    const state: IAppState = yield select();

    yield call(logEmbedDialogOpen, { state });
}

export function* watchEmbedDialogSaga() {
    yield takeEvery(ActionTypeKeys.UI_EMBED_DIALOG_COPY_CODE, copyCode);
    yield takeEvery(ActionTypeKeys.UI_EMBED_DIALOG_OPEN, openEmbedDialog);
}
