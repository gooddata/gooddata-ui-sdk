// (C) 2024-2026 GoodData Corporation

import { call, cancel, cancelled, getContext, put, select } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversation,
    type IChatConversationError,
    type IChatConversationItem,
    type IChatConversationThreadQuery,
    type IChatThreadQuery,
    type IGenAIChatEvaluation,
    type IUserWorkspaceSettings,
    isChatConversationError,
    isChatConversationItem,
} from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType, type IAllowedRelationshipType } from "@gooddata/sdk-model";

import { processContents } from "./converters/interactionsToMessages.js";
import { convertToLocalContent } from "./converters/toLocalContent.js";
import { extractError } from "./utils.js";
import {
    type AssistantMessage,
    type IChatConversationLocalItem,
    type Message,
    isChatConversationLocalItem,
    isTextContents,
    isUserMessage,
    makeAssistantItem,
    makeAssistantMessage,
} from "../../model.js";
import {
    allowedRelationshipTypesSelector,
    objectTypesSelector,
    settingsSelector,
} from "../chatWindow/chatWindowSelectors.js";
import {
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
} from "../messages/messagesSelectors.js";
import {
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageUpdateAction,
    type newMessageAction,
} from "../messages/messagesSlice.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessage({ payload }: ReturnType<typeof newMessageAction>) {
    const settings: IUserWorkspaceSettings = yield select(settingsSelector);

    if (isChatConversationLocalItem(payload)) {
        if (!settings.enableAiAgenticConversations) {
            throw new Error("Thread mode is turned on, but conversation message was provided.");
        }
        yield conversationUserMessage(payload);
    } else {
        if (settings.enableAiAgenticConversations) {
            throw new Error("Conversation mode is turned on, but thread message was provided.");
        }
        yield threadUserMessage(payload);
    }
}

//THREAD API

function* threadUserMessage(message: Message) {
    let initialAssistantMessage: AssistantMessage | undefined = undefined;
    let lastAssistantMessage: AssistantMessage | undefined = undefined;

    try {
        // Make sure the message is a user message and it got text contents
        if (!isUserMessage(message)) {
            return;
        }

        const textContents = message.content.find(isTextContents)?.text;

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
    const allowedRelationshipTypes: IAllowedRelationshipType[] | undefined = yield select(
        allowedRelationshipTypesSelector,
    );
    const showReasoning = Boolean(settings?.enableGenAIReasoningVisibility);

    // Track interaction ID to assistant message mapping
    let currentAssistantMessage = message;
    let currentInteractionId: string | undefined = undefined;

    let queryBuilder = preparedChatThread
        .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 5)
        .withObjectTypes(objectTypes);

    if (allowedRelationshipTypes?.length) {
        queryBuilder = queryBuilder.withAllowedRelationshipTypes(allowedRelationshipTypes);
    }

    try {
        const results: ReadableStream<IGenAIChatEvaluation> = yield call([queryBuilder, queryBuilder.stream]);

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

//CONVERSATIONS API

function* conversationUserMessage(message: IChatConversationLocalItem) {
    let initialAssistantMessage: IChatConversationLocalItem | undefined = undefined;
    let lastAssistantMessage: IChatConversationLocalItem | undefined = undefined;

    try {
        // Make sure the message is a user message and it got text contents
        if (message.role !== "user") {
            return;
        }
        if (message.content.type !== "text") {
            return;
        }

        // Check current conversation
        const conversation: IChatConversation | undefined = yield select(conversationSelector);
        if (!conversation?.id) {
            throw new Error("Conversation ID is not available.");
        }

        initialAssistantMessage = makeAssistantItem();

        // Set evaluation state in store
        yield put(evaluateMessageAction({ message: initialAssistantMessage }));

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        // Make the request to start the evaluation
        const chatThreadQuery = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations()
            .getConversationThread(conversation.id)
            .query(message.content.text);

        // evaluateUserMessage may create additional assistant messages if the stream contains
        // multiple interaction IDs. It returns the last message that needs to be completed.
        const result: EvaluateUserConversationMessageResult = yield call(
            evaluateUserConversationMessage,
            message,
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
            const currentMessages: Message[] = yield select(conversationMessagesSelector);
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
type EvaluateUserConversationMessageResult = {
    /**
     * The last assistant message that was being processed when the stream ended.
     * This is the message that needs to be marked as complete by the caller.
     */
    lastAssistantMessage: IChatConversationLocalItem;
};

function* evaluateUserConversationMessage(
    userMessage: IChatConversationLocalItem,
    assistantMessage: IChatConversationLocalItem,
    preparedChatThread: IChatConversationThreadQuery,
) {
    let reader: ReadableStreamReader<IChatConversationItem | IChatConversationError> | undefined = undefined;
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const objectTypes: GenAIObjectType[] | undefined = yield select(objectTypesSelector);
    const allowedRelationshipTypes: IAllowedRelationshipType[] | undefined = yield select(
        allowedRelationshipTypesSelector,
    );

    // Track interaction ID to assistant message mapping
    let currentUserMessage: IChatConversationLocalItem | undefined = userMessage;
    let currentAssistantMessage: IChatConversationLocalItem = assistantMessage;
    let currentInteractionId: string | undefined = undefined;

    let queryBuilder = preparedChatThread
        .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 5)
        .withObjectTypes(objectTypes);

    if (allowedRelationshipTypes?.length) {
        queryBuilder = queryBuilder.withAllowedRelationshipTypes(allowedRelationshipTypes);
    }

    try {
        const results: ReadableStream<IChatConversationItem | IChatConversationError> = yield call([
            queryBuilder,
            queryBuilder.stream,
        ]);

        reader = results.getReader();
        while (true) {
            const { value, done }: { value?: IChatConversationItem | IChatConversationError; done: boolean } =
                yield call([reader, reader.read]);

            if (done) {
                break;
            }

            if (value) {
                if (isChatConversationItem(value)) {
                    // Special case, when we have current user message
                    if (value.role === "user" && currentUserMessage) {
                        yield put(
                            evaluateMessageUpdateAction({
                                userMessageId: currentUserMessage.localId,
                                interactionId: value.id,
                                message: value,
                            }),
                        );
                        //reset
                        currentUserMessage = undefined;
                    }
                    // Skip user messages
                    if (value.role === "user") {
                        continue;
                    }

                    const chunkInteractionId = value.id;
                    // If we see a NEW interaction ID, create a new assistant message
                    if (
                        chunkInteractionId &&
                        currentInteractionId &&
                        chunkInteractionId !== currentInteractionId
                    ) {
                        // Check if the current message still exists before marking it complete
                        // (it may have been removed if the chat was cleared)
                        const currentMessages: IChatConversationLocalItem[] = yield select(
                            conversationMessagesSelector,
                        );
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
                        currentAssistantMessage = makeAssistantItem();
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
                            content: convertToLocalContent(value.content, true),
                        }),
                    );
                }
                if (isChatConversationError(value)) {
                    const chunkInteractionId = value.message;
                    // If we see a NEW interaction ID, create a new assistant message
                    if (
                        chunkInteractionId &&
                        currentInteractionId &&
                        chunkInteractionId !== currentInteractionId
                    ) {
                        // Check if the current message still exists before marking it complete
                        // (it may have been removed if the chat was cleared)
                        const currentMessages: IChatConversationLocalItem[] = yield select(
                            conversationMessagesSelector,
                        );
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
                        currentAssistantMessage = makeAssistantItem();
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
                            content: value,
                        }),
                    );
                }
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
        const messages: IChatConversationLocalItem[] = yield select(conversationMessagesSelector);
        const found = messages.find((m) => m.localId === currentAssistantMessage.localId);
        if (!found) {
            yield cancel();
        }
    }
}
