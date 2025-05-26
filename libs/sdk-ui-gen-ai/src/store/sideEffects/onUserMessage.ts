// (C) 2024-2025 GoodData Corporation

import { IAnalyticalBackend, IChatThreadQuery, IGenAIChatEvaluation } from "@gooddata/sdk-backend-spi";
import { call, cancelled, getContext, put } from "redux-saga/effects";
import {
    evaluateMessageAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageCompleteAction,
} from "../messages/messagesSlice.js";
import { extractError } from "./utils.js";
import { PayloadAction } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import {
    AssistantMessage,
    isTextContents,
    isUserMessage,
    makeAssistantMessage,
    Message,
} from "../../model.js";
import { processContents } from "./converters/interactionsToMessages.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessage({ payload }: PayloadAction<Message>) {
    let newAssistantMessage: AssistantMessage | undefined = undefined;

    try {
        // Make sure the message is a user message and it got text contents
        if (!isUserMessage(payload)) {
            return;
        }

        const textContents = payload.content.find(isTextContents)?.text;

        if (!textContents) {
            return;
        }

        // Create a new empty assistant message
        newAssistantMessage = makeAssistantMessage([]);

        // Set evaluation state in store
        yield put(evaluateMessageAction({ message: newAssistantMessage }));

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        // Make the request to start the evaluation
        const chatThreadQuery = backend.workspace(workspace).genAI().getChatThread().query(textContents);

        yield call(evaluateUserMessage, newAssistantMessage, chatThreadQuery);
    } catch (e) {
        if (newAssistantMessage) {
            yield put(
                evaluateMessageErrorAction({
                    assistantMessageId: newAssistantMessage.localId,
                    error: extractError(e),
                }),
            );
        }
    } finally {
        if (newAssistantMessage) {
            yield put(
                evaluateMessageCompleteAction({
                    assistantMessageId: newAssistantMessage.localId,
                }),
            );
        }
    }
}

function* evaluateUserMessage(message: AssistantMessage, preparedChatThread: IChatThreadQuery) {
    let reader: ReadableStreamReader<IGenAIChatEvaluation> | undefined = undefined;

    try {
        const results: ReadableStream<IGenAIChatEvaluation> = yield call([
            preparedChatThread,
            preparedChatThread.stream,
        ]);

        reader = results.getReader();
        while (true) {
            const { value, done }: { value?: IGenAIChatEvaluation; done: boolean } = yield call([
                reader,
                reader.read,
            ]);

            if (done) {
                break;
            }

            if (value) {
                yield put(
                    evaluateMessageStreamingAction({
                        assistantMessageId: message.localId,
                        interactionId: value.chatHistoryInteractionId,
                        contents: processContents(value),
                    }),
                );
            }
        }
    } finally {
        if (reader) {
            const wasCancelled: boolean = yield cancelled();

            if (wasCancelled) {
                yield call([reader, reader.cancel]);
            }

            yield call([reader, reader.releaseLock]);
        }
    }
}
