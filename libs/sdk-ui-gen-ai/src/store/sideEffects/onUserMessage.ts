// (C) 2024 GoodData Corporation

import { IAnalyticalBackend, IChatThreadQuery, IGenAIChatEvaluation } from "@gooddata/sdk-backend-spi";
import { call, cancelled, getContext, put } from "redux-saga/effects";
import { evaluateMessageAction, evaluateMessageErrorAction } from "../messages/messagesSlice.js";
import { extractError } from "./utils.js";
import { PayloadAction } from "@reduxjs/toolkit";
import { isTextContents, isUserMessage, makeAssistantMessage, Message } from "../../model.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessage({ payload }: PayloadAction<Message>) {
    const newAssistantMessage = makeAssistantMessage([]);

    try {
        // Make sure the message is a user message and it got text contents
        if (!isUserMessage(payload)) {
            return;
        }

        const textContents = payload.content.find(isTextContents)?.text;

        if (!textContents) {
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        // Set evaluation state in store and start polling
        yield put(evaluateMessageAction({ message: newAssistantMessage }));

        // Make the request to start the evaluation
        const chatThreadQuery = backend.workspace(workspace).genAI().getChatThread().query(textContents);

        yield call(evaluateUserMessage, chatThreadQuery);
    } catch (e) {
        yield put(
            evaluateMessageErrorAction({
                userMessageId: payload.localId,
                assistantMessageId: newAssistantMessage.localId,
                error: extractError(e),
            }),
        );
    }
}

function* evaluateUserMessage(preparedChatThread: IChatThreadQuery) {
    const controller = new AbortController();
    try {
        const results: IGenAIChatEvaluation = yield call(preparedChatThread.query.bind(preparedChatThread), {
            signal: controller.signal,
        });

        return results;
    } finally {
        const wasCancelled: boolean = yield cancelled();

        if (wasCancelled) {
            controller.abort();
        }
    }
}
