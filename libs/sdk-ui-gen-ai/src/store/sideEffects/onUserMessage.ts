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

import {
    type AssistantMessage,
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    type Message,
    isChatConversationLocalItem,
    isTextContents,
    isUserMessage,
    makeAssistantItem,
    makeAssistantMessage,
} from "../../model.js";
import { generateTitleFromQuestion } from "../../utils.js";
import {
    agentSwitchingActiveSelector,
    allowedRelationshipTypesSelector,
    effectiveContextSelector,
    objectTypesSelector,
    settingsSelector,
    tagsSelector,
} from "../chatWindow/chatWindowSelectors.js";
import { clearUserContextAction } from "../chatWindow/chatWindowSlice.js";
import {
    conversationMessagesByIdSelector,
    conversationSelector,
    messagesSelector,
    pendingAgentSwitchSelector,
    selectedAgentIdSelector,
} from "../messages/messagesSelectors.js";
import {
    applyPendingAgentSwitchAction,
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageUpdateAction,
    type newMessageAction,
    revertAgentSwitchAction,
    setCurrentConversationAction,
} from "../messages/messagesSlice.js";

import { processContents } from "./converters/interactionsToMessages.js";
import { convertToLocalContent } from "./converters/toLocalContent.js";
import { convertMessageToChatConversation, extractError } from "./utils.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessage({ payload }: ReturnType<typeof newMessageAction>) {
    const conversation: IChatConversationLocal | undefined = yield select(conversationSelector);
    let message = payload;

    if (conversation && !isChatConversationLocalItem(message)) {
        message = convertMessageToChatConversation(message);
    }

    if (isChatConversationLocalItem(message)) {
        if (!conversation) {
            throw new Error("Thread mode is turned on, but conversation message was provided.");
        }
        yield conversationUserMessage(message);
    } else {
        if (conversation) {
            throw new Error("Conversation mode is turned on, but thread message was provided.");
        }
        yield threadUserMessage(message);
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
    const { user, ambient }: ReturnType<typeof effectiveContextSelector> =
        yield select(effectiveContextSelector);
    // Clear user context immediately — it is a one-shot value
    yield put(clearUserContextAction());

    const showReasoning = Boolean(settings?.enableGenAIReasoningVisibility);

    // Track interaction ID to assistant message mapping
    let currentAssistantMessage = message;
    let currentInteractionId: string | undefined = undefined;

    let queryBuilder = preparedChatThread
        .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 10)
        .withObjectTypes(objectTypes);

    if (allowedRelationshipTypes?.length) {
        queryBuilder = queryBuilder.withAllowedRelationshipTypes(allowedRelationshipTypes);
    }

    const context = user ?? ambient;
    if (context) {
        queryBuilder = queryBuilder.withUserContext(context);
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

    // Check current conversation
    const conversationState: IChatConversationLocal | undefined = yield select(conversationSelector);
    let conversation: IChatConversationLocal | undefined = undefined;

    try {
        // Make sure the message is a user message and it got text contents
        if (message.role !== "user") {
            return;
        }
        if (message.content.type !== "text") {
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const isPreview: boolean | undefined = yield getContext("isPreview");

        // Check state
        if (!conversationState?.localId) {
            throw new Error("Conversation ID is not available.");
        }

        // Create assistant message
        initialAssistantMessage = makeAssistantItem();

        // If we are in the transient new-conversation state, create the conversation first
        if (conversationState.id) {
            conversation = conversationState;
        } else {
            const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
            // agentSwitchingActiveSelector is false in preview mode, so preview conversations are
            // never created with an explicit agent and stay pinned to the preview agent being built.
            const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
            const selectedAgentId: string | undefined = agentSwitchingActive
                ? yield select(selectedAgentIdSelector)
                : undefined;
            const created: IChatConversation = yield call(
                { context: api, fn: api.create },
                selectedAgentId
                    ? {
                          agentId: selectedAgentId,
                      }
                    : undefined,
            );
            const updated: IChatConversation = yield call(api.update.bind(api), created.id, {
                title: generateTitleFromQuestion(message.content.text),
            });
            //save
            conversation = {
                ...updated,
                agentId: updated.agentId ?? created.agentId ?? selectedAgentId,
                localId: conversationState.localId,
            };
            // Store it as current conversation and clear the transient flag
            yield put(setCurrentConversationAction({ conversation }));
        }

        if (!conversation) {
            throw new Error("Conversation is not available.");
        }

        // Block input immediately so the user cannot send another message while
        // the deferred switchAgent call (or the streaming response) is in flight.
        yield put(
            evaluateMessageAction({
                message: initialAssistantMessage,
                conversationId: conversation.localId,
            }),
        );

        // Flush any pending agent switch before sending the message so that the
        // "Switched to X" item and the switchAgent API call happen together with
        // the first message sent to the new agent. evaluateMessageAction above is
        // local-only state — the message stream does not start until after the
        // switch is confirmed by the backend.
        // Guard with the feature flag: when agent switching is off the pending
        // switch should never be set, but skip defensively to preserve the
        // original no-switching behaviour in that case.
        const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
        const pendingSwitch: ReturnType<typeof pendingAgentSwitchSelector> = agentSwitchingActive
            ? yield select(pendingAgentSwitchSelector, conversation.localId)
            : undefined;
        if (pendingSwitch) {
            try {
                yield put(
                    applyPendingAgentSwitchAction({
                        conversationLocalId: conversation.localId,
                        beforeItemLocalId: message.localId,
                    }),
                );
                const chatConversations = backend
                    .workspace(workspace)
                    .genAI()
                    .getChatConversations({ isPreview });
                const updatedConversation: IChatConversation = yield call(
                    chatConversations.switchAgent.bind(chatConversations),
                    conversation.id,
                    pendingSwitch.agentId,
                );
                yield put(
                    setCurrentConversationAction({
                        conversation: { ...updatedConversation, localId: conversation.localId },
                    }),
                );
            } catch (e) {
                console.error("Failed to switch agent before sending message", e);
                yield put(
                    revertAgentSwitchAction({
                        previousAgentId: pendingSwitch.previousAgentId,
                        failedAgentId: pendingSwitch.agentId,
                        conversationLocalId: conversation.localId,
                    }),
                );
                yield put(
                    evaluateMessageErrorAction({
                        assistantMessageId: initialAssistantMessage.localId,
                        error: extractError(e),
                        conversationId: conversation.localId,
                    }),
                );
                return;
            }
        }

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
            conversation,
            message,
            initialAssistantMessage,
            chatThreadQuery,
            !conversationState.id,
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
                    conversationId: conversation?.localId,
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
            const currentMessages: Message[] = yield select(
                conversationMessagesByIdSelector,
                conversation?.localId,
            );
            const messageExists = currentMessages.some((m) => m.localId === messageToComplete.localId);

            if (messageExists) {
                yield put(
                    evaluateMessageCompleteAction({
                        assistantMessageId: messageToComplete.localId,
                        conversationId: conversation?.localId,
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
    conversation: IChatConversationLocal,
    userMessage: IChatConversationLocalItem,
    assistantMessage: IChatConversationLocalItem,
    preparedChatThread: IChatConversationThreadQuery,
    isStartMessage: boolean,
) {
    let reader: ReadableStreamReader<IChatConversationItem | IChatConversationError> | undefined = undefined;
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const objectTypes: GenAIObjectType[] | undefined = yield select(objectTypesSelector);
    const { includeTags, excludeTags }: ReturnType<typeof tagsSelector> = yield select(tagsSelector);
    const allowedRelationshipTypes: IAllowedRelationshipType[] | undefined = yield select(
        allowedRelationshipTypesSelector,
    );
    // One-shot context (e.g. Summarize) wins over the ambient dashboard context;
    // the ambient part persists and rides on every message.
    const { user, ambient }: ReturnType<typeof effectiveContextSelector> =
        yield select(effectiveContextSelector);
    // Clear the one-shot user context immediately — it is a one-shot value
    yield put(clearUserContextAction());

    // Track interaction ID to assistant message mapping
    let currentUserMessage: IChatConversationLocalItem | undefined = userMessage;
    let currentAssistantMessage: IChatConversationLocalItem = assistantMessage;
    let currentInteractionId: string | undefined = undefined;

    let queryBuilder = preparedChatThread
        .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 10)
        .withObjectTypes(objectTypes);

    if (excludeTags) {
        queryBuilder = queryBuilder.withExcludeTags(excludeTags);
    }

    if (includeTags) {
        queryBuilder = queryBuilder.withIncludeTags(includeTags);
    }

    if (allowedRelationshipTypes?.length) {
        queryBuilder = queryBuilder.withAllowedRelationshipTypes(allowedRelationshipTypes);
    }

    const context = user ?? ambient;
    if (context) {
        queryBuilder = queryBuilder.withUserContext(context);
    }

    try {
        const results: ReadableStream<IChatConversationItem | IChatConversationError> = yield call([
            queryBuilder,
            queryBuilder.stream,
        ]);

        reader = results.getReader();
        while (true) {
            const {
                value,
                done,
            }: {
                value?: IChatConversationItem | IChatConversationError;
                done: boolean;
            } = yield call([reader, reader.read]);

            if (done) {
                break;
            }

            if (value) {
                if (isChatConversationItem(value)) {
                    // Special case, when we have current user message
                    if (value.role === "user" && currentUserMessage) {
                        yield put(
                            evaluateMessageUpdateAction({
                                conversation,
                                conversationId: conversation.localId,
                                userMessageId: currentUserMessage.localId,
                                interactionId: value.id,
                                message: value,
                                isStartMessage,
                            }),
                        );
                        //reset
                        currentUserMessage = undefined;
                    }
                    // Skip user and system messages — system items are stored as standalone
                    // conversation items and must not overwrite the current assistant message.
                    if (value.role === "user" || value.role === "system") {
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
                            conversationMessagesByIdSelector,
                            conversation.localId,
                        );
                        const messageExists = currentMessages.some(
                            (m) => m.localId === currentAssistantMessage.localId,
                        );

                        if (messageExists) {
                            // Mark current message as complete
                            yield put(
                                evaluateMessageCompleteAction({
                                    assistantMessageId: currentAssistantMessage.localId,
                                    conversationId: conversation.localId,
                                }),
                            );
                        }

                        // Create new assistant message for the new interaction
                        currentAssistantMessage = makeAssistantItem();
                        yield put(
                            evaluateMessageAction({
                                message: currentAssistantMessage,
                                conversationId: conversation.localId,
                            }),
                        );
                    }

                    // Track the current interaction ID
                    if (chunkInteractionId) {
                        currentInteractionId = chunkInteractionId;
                    }

                    // Dispatch streaming content to current message
                    yield put(
                        evaluateMessageStreamingAction({
                            content: convertToLocalContent(value.content),
                            assistantMessageId: currentAssistantMessage.localId,
                            conversationId: conversation.localId,
                            interactionId: chunkInteractionId,
                            item: value,
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
                            conversationMessagesByIdSelector,
                            conversation.localId,
                        );
                        const messageExists = currentMessages.some(
                            (m) => m.localId === currentAssistantMessage.localId,
                        );

                        if (messageExists) {
                            // Mark current message as complete
                            yield put(
                                evaluateMessageCompleteAction({
                                    assistantMessageId: currentAssistantMessage.localId,
                                    conversationId: conversation.localId,
                                }),
                            );
                        }

                        // Create new assistant message for the new interaction
                        currentAssistantMessage = makeAssistantItem();
                        yield put(
                            evaluateMessageAction({
                                message: currentAssistantMessage,
                                conversationId: conversation.localId,
                            }),
                        );
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
                            conversationId: conversation.localId,
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
        const messages: IChatConversationLocalItem[] = yield select(
            conversationMessagesByIdSelector,
            conversation.localId,
        );
        const found = messages.find((m) => m.localId === currentAssistantMessage.localId);
        if (!found) {
            yield cancel();
        }
    }
}
