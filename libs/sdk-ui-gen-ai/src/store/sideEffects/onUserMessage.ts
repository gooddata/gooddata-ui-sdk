// (C) 2024 GoodData Corporation

import { IAnalyticalBackend, IChatThreadQuery, IGenAIChatEvaluation } from "@gooddata/sdk-backend-spi";
import { call, cancelled, getContext, put, race, take } from "redux-saga/effects";
import {
    cancelAsyncAction,
    evaluateMessageAction,
    evaluateMessageCancelAction,
    evaluateMessageErrorAction,
    evaluateMessageSuccessAction,
} from "../messages/messagesSlice.js";
import { processContents } from "./converters/interactionsToMessages.js";
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
        if (!isUserMessage(payload)) {
            return;
        }

        const textContents = payload.content.find((content) => isTextContents(content))?.text;

        if (!textContents) {
            // TODO - handle error?
            return;
        }

        yield put(evaluateMessageAction({ message: newAssistantMessage }));

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const chatThreadQuery = backend.workspace(workspace).genAI().getChatThread().query(textContents);

        const [results, cancelled]: [results: IGenAIChatEvaluation, ReturnType<typeof cancelAsyncAction>] =
            yield race([call(evaluateUserMessage, chatThreadQuery), take(cancelAsyncAction.type)]);

        if (cancelled) {
            yield put(
                evaluateMessageCancelAction({
                    assistantMessageId: newAssistantMessage.localId,
                    userMessageId: payload.localId,
                }),
            );
        } else {
            yield put(
                evaluateMessageSuccessAction({
                    userMessageId: payload.localId,
                    assistantMessageId: newAssistantMessage.localId,
                    assistantMessageContents: processContents(results),
                }),
            );
        }
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
