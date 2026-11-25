// (C) 2024-2026 GoodData Corporation

import { call, cancel, cancelled, getContext, put, select } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversationError,
    type IChatConversationInteractionStep,
    type IChatConversationItem,
    type IChatConversationThreadQuery,
    type IUserWorkspaceSettings,
    isChatConversationError,
    isChatConversationInteractionStep,
    isChatConversationItem,
} from "@gooddata/sdk-backend-spi";
import {
    type GenAIChatEffort,
    type GenAIObjectType,
    type IAllowedRelationshipType,
} from "@gooddata/sdk-model";

import { extractHeading } from "../../components/utils/markdownUtils.js";
import {
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    makeAssistantItem,
} from "../../model.js";
import { publisherDocumentFormatOf } from "../../publisherDocumentPart.js";
import {
    allowedRelationshipTypesSelector,
    objectTypesSelector,
    settingsSelector,
    tagsSelector,
    userContextSelector,
} from "../chatWindow/chatWindowSelectors.js";
import { type EventDispatcher } from "../events.js";
import {
    conversationEffortSelector,
    conversationMessagesByIdSelector,
    conversationSelector,
    selectedAgentIdSelector,
} from "../messages/messagesSelectors.js";
import {
    appendInteractionStepAction,
    appendResponseDetailAction,
    appendTracedActionAction,
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageUpdateAction,
    type newMessageAction,
    upsertConversationAction,
} from "../messages/messagesSlice.js";

import { convertToLocalContent } from "./converters/toLocalContent.js";
import { notifyDefinitionReceived } from "./onDefinitionReceivedTrigger.js";
import { ensureUserMessageConversation, flushPendingAgentSwitch } from "./userMessageConversation.js";
import { extractErrorContent } from "./utils.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessage({ payload }: ReturnType<typeof newMessageAction>) {
    const conversation: IChatConversationLocal | undefined = yield select(conversationSelector);
    const message = payload;

    if (!conversation) {
        throw new Error("Thread mode is turned on, but conversation message was provided.");
    }

    yield conversationUserMessage(message);
}

//CONVERSATIONS API

function* conversationUserMessage(message: IChatConversationLocalItem) {
    let initialAssistantMessage: IChatConversationLocalItem | undefined = undefined;
    let lastAssistantMessage: IChatConversationLocalItem | undefined = undefined;
    let responseCompleted = false;
    let eventDispatcher: EventDispatcher | undefined = undefined;

    // Check current conversation
    const conversationState: IChatConversationLocal | undefined = yield select(conversationSelector);
    let conversation: IChatConversationLocal | undefined = undefined;

    try {
        // Make sure the message is a user message and it got text contents
        if (message.role !== "user") {
            return;
        }
        if (message.content.type !== "text" && message.content.type !== "clarifyingAnswers") {
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const isPreview: boolean | undefined = yield getContext("isPreview");
        eventDispatcher = yield getContext("eventDispatcher");

        // Check state
        if (!conversationState?.localId) {
            throw new Error("Conversation ID is not available.");
        }

        // Capture the turn's agent before selection can change while the response is in flight.
        initialAssistantMessage = {
            ...makeAssistantItem(),
            agentId: conversationState.agentId ?? (yield select(selectedAgentIdSelector)),
        };

        // Block input immediately so the user cannot send another message while
        // the deferred switchAgent call (or the streaming response) is in flight.
        yield put(
            evaluateMessageAction({
                message: initialAssistantMessage,
                conversationId: conversationState.localId,
            }),
        );

        // If we are in the transient new-conversation state, create the conversation first
        const conversationContext = { backend, workspace, isPreview };
        const preparedConversation: IChatConversationLocal = yield call(
            ensureUserMessageConversation,
            conversationContext,
            conversationState,
            message,
        );
        conversation = preparedConversation;
        if (!conversationState.id) {
            yield put(upsertConversationAction({ conversation }));
        }

        if (!conversation) {
            throw new Error("Conversation is not available.");
        }

        eventDispatcher?.dispatch({ type: "chatReasoning", threadId: conversation.id, title: undefined });

        // Flush any pending agent switch before sending the message so that the
        // "Switched to X" item and the switchAgent API call happen together with
        // the first message sent to the new agent. evaluateMessageAction above is
        // local-only state — the message stream does not start until after the
        // switch is confirmed by the backend.
        const switchSucceeded: boolean = yield call(
            flushPendingAgentSwitch,
            conversationContext,
            conversation,
            message.localId,
            initialAssistantMessage.localId,
        );
        if (!switchSucceeded) {
            return;
        }

        // Make the request to start the evaluation
        const chatThreadQuery = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations()
            .getConversationThread(conversation.id)
            .query(message.content);

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
        if (result.error) {
            throw result.error;
        }
        responseCompleted = true;
    } catch (e) {
        const wasCanceled: boolean = yield cancelled();

        // On error, mark the last known message (or initial if no result yet)
        const messageToError = lastAssistantMessage ?? initialAssistantMessage;
        if (messageToError && !wasCanceled) {
            yield put(
                evaluateMessageErrorAction({
                    assistantMessageId: messageToError.localId,
                    error: extractErrorContent(e),
                    conversationId: conversation?.localId ?? conversationState?.localId,
                }),
            );
        }
    } finally {
        if (conversation) {
            eventDispatcher?.dispatch({ type: "chatReasoning", threadId: conversation.id, title: undefined });
        }

        const wasCanceled: boolean = yield cancelled();

        // Mark the last assistant message as complete
        const messageToComplete = lastAssistantMessage ?? initialAssistantMessage;
        if (messageToComplete) {
            yield* completeAssistantMessageIfPresent(conversation?.localId, {
                assistantMessageId: messageToComplete.localId,
                conversationId: conversation?.localId ?? conversationState?.localId ?? "",
                threadId: conversation?.id || undefined,
                cancelled: wasCanceled,
                ...(responseCompleted && !wasCanceled ? { responseCompleted: true } : {}),
            });
        }
    }
}

function* completeAssistantMessageIfPresent(
    conversationId: string | undefined,
    payload: ReturnType<typeof evaluateMessageCompleteAction>["payload"],
) {
    // Check if the message still exists before marking it complete
    // (it may have been removed if the chat was cleared).
    const currentMessages: IChatConversationLocalItem[] = yield select(
        conversationMessagesByIdSelector,
        conversationId,
    );
    if (currentMessages.some((m) => m.localId === payload.assistantMessageId)) {
        yield put(evaluateMessageCompleteAction(payload));
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
    error?: unknown;
};

function* evaluateUserConversationMessage(
    conversation: IChatConversationLocal,
    userMessage: IChatConversationLocalItem,
    assistantMessage: IChatConversationLocalItem,
    preparedChatThread: IChatConversationThreadQuery,
    isStartMessage: boolean,
) {
    let reader:
        | ReadableStreamReader<
              IChatConversationItem | IChatConversationError | IChatConversationInteractionStep
          >
        | undefined = undefined;
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    let reasoningTitle: string | undefined = undefined;
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const objectTypes: GenAIObjectType[] | undefined = yield select(objectTypesSelector);
    const { includeTags, excludeTags }: ReturnType<typeof tagsSelector> = yield select(tagsSelector);
    const allowedRelationshipTypes: IAllowedRelationshipType[] | undefined = yield select(
        allowedRelationshipTypesSelector,
    );

    const context: ReturnType<typeof userContextSelector> = yield select(userContextSelector);
    const selectedEffort: GenAIChatEffort = yield select(conversationEffortSelector, conversation.localId);

    // Track interaction ID to assistant message mapping
    let currentUserMessage: IChatConversationLocalItem | undefined = userMessage;
    let currentAssistantMessage: IChatConversationLocalItem = assistantMessage;
    let currentInteractionId: string | undefined = undefined;
    // The turn's agent, kept for chunks that do not name it.
    let turnAgentId: string | undefined = assistantMessage.agentId;
    // Tool names by callId, so a toolResult's trace detail can name the tool that produced it.
    const toolNamesByCallId = new Map<string, string>();

    let queryBuilder = preparedChatThread
        .withSearchLimit(Number(settings?.["aiChatSearchLimit"]) || 10)
        .withObjectTypes(objectTypes)
        .withEffort(selectedEffort)
        .withPublisherDocumentFormat(publisherDocumentFormatOf(settings));

    if (excludeTags) {
        queryBuilder = queryBuilder.withExcludeTags(excludeTags);
    }

    if (includeTags) {
        queryBuilder = queryBuilder.withIncludeTags(includeTags);
    }

    if (allowedRelationshipTypes?.length) {
        queryBuilder = queryBuilder.withAllowedRelationshipTypes(allowedRelationshipTypes);
    }

    if (context) {
        queryBuilder = queryBuilder.withUserContext(context);
    }

    try {
        const currentMessages: IChatConversationLocalItem[] = yield select(
            conversationMessagesByIdSelector,
            conversation.localId,
        );

        const results: ReadableStream<
            IChatConversationItem | IChatConversationError | IChatConversationInteractionStep
        > = yield call(queryBuilder.stream.bind(queryBuilder, currentMessages as IChatConversationItem[]));

        reader = results.getReader();
        while (true) {
            const {
                value,
                done,
            }: {
                value?: IChatConversationItem | IChatConversationError | IChatConversationInteractionStep;
                done: boolean;
            } = yield call([reader, reader.read]);

            if (done) {
                break;
            }

            // Interaction steps are the "Interaction Intelligence" trace, not messages — they carry the
            // turn's timing and spend and never touch the assistant's content.
            if (value && isChatConversationInteractionStep(value)) {
                yield put(
                    appendInteractionStepAction({
                        conversationId: conversation.localId,
                        step: value,
                    }),
                );
                continue;
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
                    // A `detail` with no `stepId` belongs to the response, not a step. Captured
                    // ahead of the user/system skip below, which would otherwise drop it.
                    if (value.detail && !value.stepId && value.responseId) {
                        yield put(
                            appendResponseDetailAction({
                                conversationId: conversation.localId,
                                responseId: value.responseId,
                                action: {
                                    itemId: value.id,
                                    createdAt: value.createdAt,
                                    detail: value.detail,
                                },
                            }),
                        );
                    }

                    // Skip user and system messages — system items are stored as standalone
                    // conversation items and must not overwrite the current assistant message.
                    if (value.role === "user" || value.role === "system") {
                        continue;
                    }

                    // Remember each tool call's name so the matching toolResult — which carries
                    // only its callId — can be attributed to the tool that produced it.
                    if (value.content.type === "toolCall") {
                        toolNamesByCallId.set(value.content.callId, value.content.name);
                    }

                    // Every tool result that belongs to a step is part of the "Interaction Intelligence"
                    // trace, whether or not it carried a `detail` — one without a body still names
                    // its step after the tool that ran, so the step's time is accounted for.
                    // Captured aside; the item itself still flows on.
                    if (
                        (value.detail || value.content.type === "toolResult") &&
                        value.stepId &&
                        value.responseId
                    ) {
                        yield put(
                            appendTracedActionAction({
                                conversationId: conversation.localId,
                                responseId: value.responseId,
                                stepId: value.stepId,
                                action: {
                                    itemId: value.id,
                                    createdAt: value.createdAt,
                                    toolName:
                                        value.content.type === "toolResult"
                                            ? toolNamesByCallId.get(value.content.callId)
                                            : undefined,
                                    detail: value.detail,
                                },
                            }),
                        );
                    }

                    const chunkInteractionId = value.id;
                    // If we see a NEW interaction ID, create a new assistant message
                    if (
                        chunkInteractionId &&
                        currentInteractionId &&
                        chunkInteractionId !== currentInteractionId
                    ) {
                        yield* completeAssistantMessageIfPresent(conversation.localId, {
                            assistantMessageId: currentAssistantMessage.localId,
                            conversationId: conversation.localId,
                            threadId: conversation.id || undefined,
                        });

                        // Create new assistant message for the new interaction
                        currentAssistantMessage = { ...makeAssistantItem(), agentId: turnAgentId };
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

                    turnAgentId = value.agentId ?? turnAgentId;

                    // Dispatch streaming content to current message
                    const localContent = convertToLocalContent(value.content);
                    yield put(
                        evaluateMessageStreamingAction({
                            content: localContent,
                            assistantMessageId: currentAssistantMessage.localId,
                            conversationId: conversation.localId,
                            threadId: conversation.id || undefined,
                            interactionId: chunkInteractionId,
                            item: value,
                        }),
                    );
                    if (value.role === "assistant" && localContent.type === "reasoning") {
                        const messages: IChatConversationLocalItem[] = yield select(
                            conversationMessagesByIdSelector,
                            conversation.localId,
                        );
                        const content = messages.find(
                            (item) => item.localId === currentAssistantMessage.localId,
                        )?.content;
                        const title = content?.type === "reasoning" ? extractHeading(content.summary) : null;
                        if (title && title !== reasoningTitle) {
                            reasoningTitle = title;
                            eventDispatcher.dispatch({
                                type: "chatReasoning",
                                threadId: conversation.id,
                                interactionId: chunkInteractionId,
                                title,
                            });
                        }
                    }
                    yield call(
                        notifyDefinitionReceived,
                        {
                            ...currentAssistantMessage,
                            content: localContent,
                            id: chunkInteractionId,
                            agentId: turnAgentId,
                        },
                        conversation.localId,
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
                        yield* completeAssistantMessageIfPresent(conversation.localId, {
                            assistantMessageId: currentAssistantMessage.localId,
                            conversationId: conversation.localId,
                            threadId: conversation.id || undefined,
                        });

                        // Create new assistant message for the new interaction
                        currentAssistantMessage = { ...makeAssistantItem(), agentId: turnAgentId };
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
                            threadId: conversation.id || undefined,
                        }),
                    );
                }
            }
        }

        return { lastAssistantMessage: currentAssistantMessage };
    } catch (error) {
        return { lastAssistantMessage: currentAssistantMessage, error };
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
