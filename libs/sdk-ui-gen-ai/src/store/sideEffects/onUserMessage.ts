// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, cancel, cancelled, getContext, put, select } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatThreadQuery,
    type IGenAIChatEvaluation,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType } from "@gooddata/sdk-model";

import { processContents } from "./converters/interactionsToMessages.js";
import { extractError } from "./utils.js";
import {
    type AssistantMessage,
    type Message,
    isTextContents,
    isUserMessage,
    makeAssistantMessage,
} from "../../model.js";
import { objectTypesSelector, settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { messagesSelector } from "../messages/messagesSelectors.js";
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
    let initialAssistantMessage: AssistantMessage | undefined = undefined;
    let lastAssistantMessage: AssistantMessage | undefined = undefined;

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
        initialAssistantMessage = makeAssistantMessage([]);

        // Set evaluation state in store
        yield put(evaluateMessageAction({ message: initialAssistantMessage }));

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        // Make the request to start the evaluation
        const chatThreadQuery = backend.workspace(workspace).genAI().getChatThread().query(textContents);

        // evaluateUserMessage may create additional assistant messages if the stream contains
        // multiple interaction IDs. It returns the last message that needs to be completed.
        const result: EvaluateUserMessageResult = yield call(
            evaluateUserMessage,
            initialAssistantMessage,
            chatThreadQuery,
        );
        lastAssistantMessage = result.lastAssistantMessage;
    } catch (e) {
        const wasCanceled: boolean = yield cancelled();

        // On error, mark the last known message (or initial if no result yet)
        const messageToError = lastAssistantMessage ?? initialAssistantMessage;
        if (messageToError && !wasCanceled) {
            yield put(
                evaluateMessageErrorAction({
                    assistantMessageId: messageToError.localId,
                    error: extractError(e),
                }),
            );
        }
    } finally {
        const wasCanceled: boolean = yield cancelled();

        // Mark the last assistant message as complete
        const messageToComplete = lastAssistantMessage ?? initialAssistantMessage;
        if (messageToComplete && !wasCanceled) {
            // Check if the message still exists before marking it complete
            // (it may have been removed if the chat was cleared)
            const currentMessages: Message[] = yield select(messagesSelector);
            const messageExists = currentMessages.some((m) => m.localId === messageToComplete.localId);

            if (messageExists) {
                yield put(
                    evaluateMessageCompleteAction({
                        assistantMessageId: messageToComplete.localId,
                    }),
                );
            }
        }
    }
}

/**
 * Result of evaluating a user message, containing all assistant messages created during the stream.
 */
type EvaluateUserMessageResult = {
    /**
     * The last assistant message that was being processed when the stream ended.
     * This is the message that needs to be marked as complete by the caller.
     */
    lastAssistantMessage: AssistantMessage;
};

function* evaluateUserMessage(message: AssistantMessage, preparedChatThread: IChatThreadQuery) {
    let reader: ReadableStreamReader<IGenAIChatEvaluation> | undefined = undefined;
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const objectTypes: GenAIObjectType[] | undefined = yield select(objectTypesSelector);
    const showReasoning = Boolean(settings?.enableGenAIReasoningVisibility);

    // Track interaction ID to assistant message mapping
    let currentAssistantMessage = message;
    let currentInteractionId: string | undefined = undefined;

    try {
        const results: ReadableStream<IGenAIChatEvaluation> = yield call([
            preparedChatThread
                .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 5)
                .withObjectTypes(objectTypes),
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
                const chunkInteractionId = value.chatHistoryInteractionId;

                // If we see a NEW interaction ID, create a new assistant message
                if (
                    chunkInteractionId &&
                    currentInteractionId &&
                    chunkInteractionId !== currentInteractionId
                ) {
                    // Check if the current message still exists before marking it complete
                    // (it may have been removed if the chat was cleared)
                    const currentMessages: Message[] = yield select(messagesSelector);
                    const messageExists = currentMessages.some(
                        (m) => m.localId === currentAssistantMessage.localId,
                    );

                    if (messageExists) {
                        // Mark current message as complete
                        yield put(
                            evaluateMessageCompleteAction({
                                assistantMessageId: currentAssistantMessage.localId,
                            }),
                        );
                    }

                    // Create new assistant message for the new interaction
                    currentAssistantMessage = makeAssistantMessage([]);
                    yield put(evaluateMessageAction({ message: currentAssistantMessage }));
                }

                // Track the current interaction ID
                if (chunkInteractionId) {
                    currentInteractionId = chunkInteractionId;
                }

                // Dispatch streaming content to current message
                yield put(
                    evaluateMessageStreamingAction({
                        assistantMessageId: currentAssistantMessage.localId,
                        interactionId: chunkInteractionId,
                        contents: processContents(value, true, { showReasoning }),
                    }),
                );
            }
        }

        return { lastAssistantMessage: currentAssistantMessage };
    } finally {
        if (reader) {
            const wasCancelled: boolean = yield cancelled();

            if (wasCancelled) {
                yield call([reader, reader.cancel]);
            }

            yield call([reader, reader.releaseLock]);
        }

        //Cancel saga
        const messages: Message[] = yield select(messagesSelector);
        const found = messages.find((m) => m.localId === currentAssistantMessage.localId);
        if (!found) {
            yield cancel();
        }
    }
}
