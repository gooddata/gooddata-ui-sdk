// (C) 2024-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import { call, cancelled, getContext, put, select } from "redux-saga/effects";

import {
    IAnalyticalBackend,
    IChatThreadQuery,
    IGenAIChatEvaluation,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import { processContents } from "./converters/interactionsToMessages.js";
import { extractError } from "./utils.js";
import {
    AssistantMessage,
    Message,
    isTextContents,
    isUserMessage,
    makeAssistantMessage,
} from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
} from "../messages/messagesSlice.js";

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
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);

    try {
        const results: ReadableStream<IGenAIChatEvaluation> = yield call([
            preparedChatThread.withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 5),
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
                        contents: processContents(value, true),
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
