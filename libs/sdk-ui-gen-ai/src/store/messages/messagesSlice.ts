// (C) 2024-2026 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { type IChatConversationItem, type IChatSuggestionsItem } from "@gooddata/sdk-backend-spi";
import { type GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";
import { type SdkErrorType } from "@gooddata/sdk-ui";

import {
    type AssistantMessage,
    type Contents,
    type IChatConversationErrorContent,
    type IChatConversationLocal,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type Message,
    type UserMessage,
    isAssistantMessage,
    isChatConversationLocalItem,
    isUserMessage,
    isVisualizationContents,
    makeErrorContent,
    makeErrorContents,
} from "../../model.js";
import { type StoredConversation } from "../../types.js";
import { convertMessageToChatConversation } from "../sideEffects/utils.js";
import {
    createEmptyConversation,
    getConversationData,
    getConversationLocalId,
    isConversationWithLocalId,
} from "../utils.js";

type MessagesSliceState = {
    /**
     * A verbose mode defines how much information is shown in the chat.
     */
    verbose: boolean;
    /**
     * If the thread is loaded.
     */
    loaded: boolean;
    /**
     * A normalized map of messages indexed by their localId.
     */
    messages: Record<string, Message>;
    /**
     * An order of messages in the chat.
     */
    messageOrder: string[];
    /**
     * If the interface is busy, this specifies the details of the async operation.
     * Where:
     * - loading: the thread history is being loaded from the backend (no messages to show yet)
     * - restoring: cached messages have been restored while the backend fetch is still in-flight
     * - clearing: the thread is being cleared
     * - evaluating: the new user message is being evaluated by assistant
     */
    messageAsyncProcess?: "loading" | "restoring" | "clearing" | "evaluating";

    /**
     * A list of conversations.
     */
    conversations: IChatConversationLocal[] | undefined;
    /**
     * The current conversation.
     *  - undefined: no conversation is selected
     */
    currentConversation: IChatConversationLocal | undefined;
    /**
     * Conversation data
     */
    conversationsData: Record<string, StoredConversation>;

    /**
     * A global error object. I.e. if something unexpected went wrong,
     * not on the interaction level.
     */
    globalError?: Record<string, unknown>;
    /**
     * An ID of the conversation thread.
     * Not the same as threadIdSuffix in some of the REST APIs,
     * this one is the actual id from server, useful for telemetry.
     */
    threadId?: string;
};

export const LS_VERBOSE_KEY = "gd-gen-ai-verbose";
export const messagesSliceName = "messages";

/**
 * Get the initial verbose state from the local storage,
 * but provide a fallback for Node.js when running unit tests.
 */
const getInitialVerboseState = () => {
    if (typeof window !== "undefined") {
        return window.localStorage.getItem(LS_VERBOSE_KEY) === "true";
    }

    return false;
};

const initialState: MessagesSliceState = {
    // Start with loading state to avoid re-render from empty state on startup
    loaded: false,
    verbose: getInitialVerboseState(),
    //old messages
    messageAsyncProcess: "loading",
    messageOrder: [],
    messages: {},
    //conversations
    conversations: undefined,
    currentConversation: undefined,
    conversationsData: {},
};

const setNormalizedMessages = (state: MessagesSliceState, messages: Message[]) => {
    state.messages = messages.reduce(
        (acc, message) => {
            acc[message.localId] = message;
            return acc;
        },
        {} as MessagesSliceState["messages"],
    );
    state.messageOrder = messages.map((message) => message.localId);
    state.loaded = true;
};

const setNormalizedConversations = (state: MessagesSliceState, conversations: IChatConversationLocal[]) => {
    state.conversations = conversations;
};

const setNormalizedConversation = (
    state: MessagesSliceState,
    conversation: IChatConversationLocal,
    items: IChatConversationLocalItem[] = [],
) => {
    state.currentConversation = conversation;
    state.loaded = true;

    const data = getConversationData(state.conversationsData, conversation.localId);
    const normalizedItems = items.reduce(
        (acc, message) => {
            acc[message.localId] = message;
            return acc;
        },
        {} as Record<string, IChatConversationLocalItem>,
    );
    const normalizedOrder = items.map((message) => message.localId);
    if (data) {
        data.order = normalizedOrder;
        data.items = normalizedItems;
    }
};

const setConversationInProgress = (
    state: MessagesSliceState,
    inProgress: boolean,
    localConversationId?: string,
) => {
    if (!localConversationId) {
        return;
    }

    state.conversations = state.conversations?.map((conversation) =>
        conversation.localId === localConversationId ? { ...conversation, inProgress } : conversation,
    );

    if (isConversationWithLocalId(state.currentConversation, localConversationId)) {
        state.currentConversation = {
            ...state.currentConversation,
            inProgress,
        };
    }
};

const getAssistantMessageStrict = (
    state: MessagesSliceState,
    assistantMessageId: string,
    conversationId?: string,
): AssistantMessage | IChatConversationLocalItem => {
    if (state.currentConversation) {
        const data = getConversationData(state.conversationsData, conversationId);
        if (!data) {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        const message = data.items[assistantMessageId];
        if (message.role !== "assistant") {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        return message;
    } else {
        const message = state.messages[assistantMessageId];
        if (!isAssistantMessage(message)) {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        return message;
    }
};

const getUserMessageStrict = (
    state: MessagesSliceState,
    assistantMessageId: string,
    conversationId?: string,
): UserMessage | IChatConversationLocalItem => {
    if (state.currentConversation) {
        const data = getConversationData(state.conversationsData, conversationId);
        if (!data) {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        const message = data.items[assistantMessageId];
        if (message.role !== "user") {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        return message;
    } else {
        const message = state.messages[assistantMessageId];
        if (!isUserMessage(message)) {
            throw new Error(`Unexpected error during message evaluation.`);
        }
        return message;
    }
};

const getMessageExists = (
    state: MessagesSliceState,
    assistantMessageId: string,
    conversationId?: string,
): boolean => {
    if (state.currentConversation) {
        if (!conversationId) {
            return false;
        }
        const data = getConversationData(state.conversationsData, conversationId);
        return !!data?.items[assistantMessageId];
    }
    return !!state.messages[assistantMessageId];
};

/**
 * Get the user message before the assistant message, or undefined if there isn't one.
 * This is useful for dynamically created assistant messages that don't have a preceding user message.
 */
const getUserMessageBeforeSafe = (
    state: MessagesSliceState,
    assistantMessageId: string,
    conversationId?: string,
): UserMessage | IChatConversationLocalItem | undefined => {
    if (state.currentConversation) {
        const data = getConversationData(state.conversationsData, conversationId);
        if (!data) {
            return undefined;
        }
        const messageIndex = data.order.indexOf(assistantMessageId);
        if (messageIndex <= 0) {
            return undefined;
        }
        const message = data.items[data.order[messageIndex - 1]];
        return message.role === "user" ? message : undefined;
    }

    const messageIndex = state.messageOrder.indexOf(assistantMessageId);
    if (messageIndex <= 0) {
        return undefined;
    }
    const message = state.messages[state.messageOrder[messageIndex - 1]];
    return isUserMessage(message) ? message : undefined;
};

const messagesSlice = createSlice({
    name: messagesSliceName,
    initialState,
    reducers: {
        loadThreadAction: (state) => {
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                if (data) {
                    data.asyncProcess = "loading";
                }
            } else {
                state.messageAsyncProcess = "loading";
            }
        },
        loadThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        loadThreadSuccessAction: (
            state,
            { payload: { messages, threadId } }: PayloadAction<{ messages: Message[]; threadId: string }>,
        ) => {
            setNormalizedMessages(state, messages);
            state.threadId = threadId;
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        /**
         * Restore previously cached messages immediately while the backend is still loading.
         * Unlike loadThreadSuccessAction, this does not mark the thread as fully loaded,
         * so the backend fetch continues and will replace these messages when complete.
         * Sets asyncProcess to "restoring" so that:
         * - The skeleton spinner is hidden and cached messages are rendered (Messages checks for "loading"/"clearing" only).
         * - The input remains disabled (Input checks !!asyncProcess, and "restoring" is truthy).
         */
        restoreCachedMessagesAction: (
            state,
            { payload: { messages } }: PayloadAction<{ messages: Message[] }>,
        ) => {
            state.messages = messages.reduce(
                (acc, message) => {
                    acc[message.localId] = message;
                    return acc;
                },
                {} as MessagesSliceState["messages"],
            );
            state.messageOrder = messages.map((message) => message.localId);
            state.messageAsyncProcess = "restoring";
        },
        loadConversationsSuccessAction: (
            state,
            {
                payload: { conversations },
            }: PayloadAction<{
                conversations: IChatConversationLocal[];
            }>,
        ) => {
            setNormalizedConversations(state, conversations);
        },
        loadConversationSuccessAction: (
            state,
            {
                payload: { currentConversation, conversationItems, threadId },
            }: PayloadAction<{
                currentConversation: IChatConversationLocal;
                conversationItems: IChatConversationLocalItem[];
                threadId?: string;
            }>,
        ) => {
            setNormalizedConversation(state, currentConversation, conversationItems);
            state.threadId = threadId;
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        clearThreadAction: (state) => {
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                if (data) {
                    data.asyncProcess = "clearing";
                }
            } else {
                state.messageAsyncProcess = "clearing";
            }
        },
        clearThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        clearThreadSuccessAction: (state) => {
            state.messages = {};
            state.messageOrder = [];
            state.loaded = false;
            delete state.globalError;
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        clearConversationSuccessAction: (
            state,
            {
                payload: { conversation, threadId },
            }: PayloadAction<{ conversation: IChatConversationLocal; threadId: string }>,
        ) => {
            state.conversations = [conversation, ...(state.conversations ?? [])];
            state.currentConversation = conversation;
            state.threadId = threadId;
            state.loaded = false;
            delete state.globalError;
            const data = getConversationData(state.conversationsData, state.currentConversation.localId);
            delete data?.asyncProcess;
        },
        /**
         * Add message to the stack
         */
        newMessageAction: (state, action: PayloadAction<Message | IChatConversationLocalItem>) => {
            let message = action.payload;

            if (state.currentConversation && !isChatConversationLocalItem(message)) {
                message = convertMessageToChatConversation(message);
            }

            if (isChatConversationLocalItem(message)) {
                if (!state.currentConversation) {
                    throw new Error("Working with conversation message but thread mode is active.");
                }
                const currentConversation = state.currentConversation;
                currentConversation.updatedAt = new Date().toISOString();
                state.conversations = state.conversations?.map((conversation) => {
                    if (conversation.localId === currentConversation.localId) {
                        return {
                            ...conversation,
                            updatedAt: currentConversation.updatedAt,
                        };
                    }
                    return conversation;
                });

                const data = getConversationData(state.conversationsData, currentConversation.localId);
                if (data) {
                    data.items[message.localId] = message;
                    data.order.push(message.localId);
                }
            } else {
                if (state.currentConversation) {
                    throw new Error("Working with thread message but conversation mode is active.");
                }
                state.messages[message.localId] = message;
                state.messageOrder.push(action.payload.localId);
            }
            state.loaded = true;
        },
        /**
         * Start the message evaluation, adding new assistant message as an incomplete placeholder
         */
        evaluateMessageAction: (
            state,
            {
                payload: { message, conversationId },
            }: PayloadAction<{
                message: AssistantMessage | IChatConversationLocalItem;
                conversationId?: string;
            }>,
        ) => {
            if (isChatConversationLocalItem(message)) {
                if (!conversationId) {
                    throw new Error("Working with conversation message but thread mode is active.");
                }
                const data = getConversationData(state.conversationsData, conversationId);
                if (data) {
                    data.items[message.localId] = message;
                    data.order.push(message.localId);
                }
                setConversationInProgress(state, true, conversationId);
            } else {
                if (state.currentConversation) {
                    throw new Error("Working with thread message but conversation mode is active.");
                }
                state.messages[message.localId] = message;
                state.messageOrder.push(message.localId);
            }
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, conversationId);
                if (data) {
                    data.asyncProcess = "evaluating";
                }
            } else {
                state.messageAsyncProcess = "evaluating";
            }
        },
        /**
         * The evaluation failed, need to update the assistant message.
         */
        evaluateMessageErrorAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                error: string;
                assistantMessageId: string;
                conversationId?: string;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                assistantMessage.complete = true;
                assistantMessage.streaming = false;
                assistantMessage.content = makeErrorContent(payload.error);
                const data = getConversationData(state.conversationsData, payload.conversationId);
                delete data?.asyncProcess;
            } else {
                assistantMessage.complete = true;
                assistantMessage.content.push(makeErrorContents(payload.error));
                delete state.messageAsyncProcess;
            }
        },
        /**
         * Received new chunk from server over SSE.
         */
        evaluateMessageStreamingAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                contents?: Contents[];
                item?: IChatConversationItem;
                content?: IChatConversationLocalContent | IChatConversationErrorContent;
                assistantMessageId: string;
                interactionId?: string;
                conversationId?: string;
            }>,
        ) => {
            //NOTE: During streaming a message, user can choose to close or reset a chat
            // and without this check, we would get an unwanted error
            const exists = getMessageExists(state, payload.assistantMessageId, payload.conversationId);
            if (!exists) {
                return;
            }

            // Update assistant message
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );
            assistantMessage.id = payload.interactionId ?? assistantMessage.id;

            if (isChatConversationLocalItem(assistantMessage)) {
                assistantMessage.content = payload.content ?? {
                    type: "text",
                    text: "",
                };
                assistantMessage.streaming = true;
                assistantMessage.cancelled = false;
                assistantMessage.responseId = payload.item?.responseId ?? "";
                assistantMessage.replyTo = payload.item?.replyTo;
            } else {
                assistantMessage.content.push(...(payload.contents ?? []));
                assistantMessage.cancelled = false;
            }

            // Also update the interaction id in the relevant user message (if one exists)
            // Note: dynamically created assistant messages (for multi-interaction streams)
            // may not have a preceding user message
            const userMessage = getUserMessageBeforeSafe(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );
            if (userMessage) {
                userMessage.id = payload.interactionId ?? userMessage.id;
            }
        },
        evaluateConversationTitleAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                conversation: IChatConversationLocal;
                generatingTitle: boolean;
                title?: string;
            }>,
        ) => {
            const conversation = state.conversations?.find((c) => c.localId === payload.conversation.localId);
            if (!conversation) {
                return;
            }

            conversation.generatingTitle = payload.generatingTitle;
            if (payload.title) {
                conversation.title = payload.title;
                if (isConversationWithLocalId(state.currentConversation, conversation.localId)) {
                    state.currentConversation.title = payload.title;
                }
            }
        },
        evaluateMessageUpdateAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                userMessageId: string;
                conversation: IChatConversationLocal;
                message: IChatConversationItem | UserMessage;
                isStartMessage: boolean;
                interactionId?: string;
                conversationId?: string;
            }>,
        ) => {
            //NOTE: During streaming a message, user can choose to close or reset a chat
            // and without this check, we would get an unwanted error
            const exists = getMessageExists(state, payload.userMessageId, payload.conversationId);
            if (!exists) {
                return;
            }

            // Update assistant message
            const userMessage = getUserMessageStrict(state, payload.userMessageId, payload.conversationId);
            userMessage.id = payload.interactionId ?? userMessage.id;

            if (isChatConversationLocalItem(userMessage)) {
                const message = payload.message as IChatConversationItem;
                userMessage.responseId = message.responseId;
                userMessage.replyTo = message.replyTo;
                userMessage.createdAt = message.createdAt;
            } else {
                const message = payload.message as UserMessage;
                userMessage.created = message.created;
            }
        },
        evaluateMessageCompleteAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                assistantMessageId: string;
                conversationId?: string;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );
            assistantMessage.complete = true;
            setConversationInProgress(state, false, payload.conversationId);

            const data = getConversationData(state.conversationsData, payload.conversationId);
            delete data?.asyncProcess;
            delete state.messageAsyncProcess;
        },
        evaluateMessageSuggestionsAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                item?: IChatSuggestionsItem;
                assistantMessageId: string;
                conversationId?: string;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                assistantMessage.suggestions = payload.item;
            }
        },
        setMessagesAction: (
            state,
            {
                payload: { messages, items },
            }: PayloadAction<{ messages?: Message[]; items?: IChatConversationLocalItem[] }>,
        ) => {
            const conversation = state.currentConversation;
            if (conversation) {
                setNormalizedConversation(state, conversation, items ?? []);
            } else {
                setNormalizedMessages(state, messages ?? []);
            }
        },
        setVerboseAction: (state, { payload: { verbose } }: PayloadAction<{ verbose: boolean }>) => {
            state.verbose = verbose;
        },
        startNewConversationAction: (state) => {
            // keep list of conversations, but clear current conversation data in the view
            state.currentConversation = createEmptyConversation();
            // mark as loaded to prevent auto-loading last conversation while on landing
            state.loaded = true;
        },
        setCurrentConversationAction: (
            state,
            { payload }: PayloadAction<{ conversation: IChatConversationLocal }>,
        ) => {
            const existing = state.conversations?.find((c) => c.localId === payload.conversation.localId);

            if (existing) {
                const data = getConversationData(state.conversationsData, existing.localId);
                state.currentConversation = existing;
                state.loaded = !!data?.order.length;
                state.threadId = payload.conversation.id;
                existing.id = payload.conversation.id;
            } else {
                state.conversations = [payload.conversation, ...(state.conversations ?? [])];
                state.currentConversation = payload.conversation;
                state.threadId = payload.conversation.localId;
                state.loaded = true;
            }
        },
        setGlobalErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
        },
        cancelAsyncAction: (state) => {
            if (state.currentConversation) {
                const data = getConversationData(state.conversationsData, state.currentConversation.localId);
                delete data?.asyncProcess;
            } else {
                delete state.messageAsyncProcess;
            }
        },
        setUserFeedback: (
            state,
            {
                payload,
            }: PayloadAction<{
                assistantMessageId: string;
                feedback: GenAIChatInteractionUserFeedback;
                userTextFeedback?: string;
            }>,
        ) => {
            const conversationId = getConversationLocalId(state.currentConversation);
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                const original = assistantMessage.feedback ?? {
                    type: "feedback",
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime(),
                };
                assistantMessage.feedback = {
                    ...original,
                    feedback: payload.feedback,
                };
            } else {
                assistantMessage.feedback = payload.feedback;
            }
        },
        setUserFeedbackError: (
            state,
            {
                payload,
            }: PayloadAction<{
                assistantMessageId: string;
                conversationId?: string;
                error: string;
            }>,
        ) => {
            // Reset feedback to NONE and set error when submission fails
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                const original = assistantMessage.feedback ?? {
                    type: "feedback",
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime(),
                };

                assistantMessage.feedback = {
                    ...original,
                    feedback: "NONE",
                    error: payload.error,
                };
            } else {
                assistantMessage.feedback = "NONE";
                assistantMessage.feedbackError = payload.error;
            }
        },
        clearUserFeedbackError: (
            state,
            {
                payload,
            }: PayloadAction<{
                assistantMessageId: string;
                conversationId?: string;
            }>,
        ) => {
            // Clear feedback error after showing toast
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );
            if (isChatConversationLocalItem(assistantMessage)) {
                delete assistantMessage.feedback?.error;
            } else {
                delete assistantMessage.feedbackError;
            }
        },
        saveVisualizationAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                visualizationId: string;
                visualizationTitle: string;
                assistantMessageId: string;
                explore: boolean;
            }>,
        ) => {
            const conversationId = getConversationLocalId(state.currentConversation);
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                if (assistantMessage.content.type !== "multipart") {
                    throw new Error("Unexpected message type");
                }

                const visualization: IChatConversationMultipartLocalPart | undefined =
                    assistantMessage.content.parts
                        .filter((filter) => filter.type === "visualization")
                        .find(
                            (content) =>
                                content.visualization?.insight.identifier === payload.visualizationId,
                        );

                if (visualization) {
                    visualization.visualization.insight.title = payload.visualizationTitle;
                    visualization.saving = {
                        started: true,
                        completed: false,
                    };
                }
            } else {
                const visualization = assistantMessage.content
                    .filter(isVisualizationContents)
                    .flatMap((content) => content.createdVisualizations)
                    .find((content) => content.id === payload.visualizationId);

                if (visualization) {
                    visualization.saving = true;
                }
            }
        },
        savedVisualizationAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                visualizationId: string;
                assistantMessageId: string;
            }>,
        ) => {
            const conversationId = getConversationLocalId(state.currentConversation);
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                if (assistantMessage.content.type !== "multipart") {
                    throw new Error("Unexpected message type");
                }

                const visualization: IChatConversationMultipartLocalPart | undefined =
                    assistantMessage.content.parts
                        .filter((filter) => filter.type === "visualization")
                        .find(
                            (content) =>
                                content.visualization?.insight.identifier === payload.visualizationId,
                        );

                if (visualization) {
                    delete visualization.saving;
                }
            }
        },
        saveVisualizationErrorAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                error: {
                    name: string;
                    message: string;
                };
                visualizationId: string;
                assistantMessageId: string;
                conversationId?: string;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                if (assistantMessage.content.type !== "multipart") {
                    throw new Error("Unexpected message type");
                }

                const visualization: IChatConversationMultipartLocalPart | undefined =
                    assistantMessage.content.parts
                        .filter((filter) => filter.type === "visualization")
                        .find(
                            (content) =>
                                content.visualization?.insight.identifier === payload.visualizationId,
                        );

                if (visualization) {
                    visualization.saving = {
                        started: false,
                        completed: false,
                    };
                    visualization.error = payload.error;
                }
            } else {
                const visualization = assistantMessage.content
                    .filter(isVisualizationContents)
                    .flatMap((content) => content.createdVisualizations)
                    .find((content) => content.id === payload.visualizationId);

                if (visualization) {
                    visualization.saving = false;
                }
            }
        },
        saveVisualizationSuccessAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                visualizationId: string;
                assistantMessageId: string;
                savedVisualizationId: string;
                conversationId?: string;
                explore: boolean;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                payload.conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                if (assistantMessage.content.type !== "multipart") {
                    throw new Error("Unexpected message type");
                }

                const visualization: IChatConversationMultipartLocalPart | undefined =
                    assistantMessage.content.parts
                        .filter((filter) => filter.type === "visualization")
                        .find(
                            (content) =>
                                content.visualization?.insight.identifier === payload.visualizationId,
                        );

                if (visualization) {
                    visualization.saving = {
                        started: true,
                        completed: true,
                    };
                    visualization.visualization.insight.identifier = payload.savedVisualizationId;
                }
            } else {
                const visualization = assistantMessage.content
                    .filter(isVisualizationContents)
                    .flatMap((content) => content.createdVisualizations)
                    .find((content) => content.id === payload.visualizationId);

                if (visualization) {
                    visualization.saving = false;
                    visualization.savedVisualizationId = payload.savedVisualizationId;
                }
            }
        },
        saveVisualisationRenderStatusAction: (
            state,
            _action: PayloadAction<{
                visualizationId: string;
                assistantMessageId: string;
                status: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS";
            }>,
        ) => state,
        saveVisualisationRenderStatusSuccessAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                visualizationId: string;
                assistantMessageId: string;
                status: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS";
            }>,
        ) => {
            const conversationId = getConversationLocalId(state.currentConversation);
            const assistantMessage = getAssistantMessageStrict(
                state,
                payload.assistantMessageId,
                conversationId,
            );

            if (isChatConversationLocalItem(assistantMessage)) {
                if (assistantMessage.content.type !== "multipart") {
                    throw new Error("Unexpected message type");
                }

                const visualization: IChatConversationMultipartLocalPart | undefined =
                    assistantMessage.content.parts
                        .filter((filter) => filter.type === "visualization")
                        .find(
                            (content) =>
                                content.visualization?.insight.identifier === payload.visualizationId,
                        );

                if (visualization) {
                    delete visualization.reporting;
                }
            } else {
                const visualization = assistantMessage.content
                    .filter(isVisualizationContents)
                    .flatMap((content) => content.createdVisualizations)
                    .find((content) => content.id === payload.visualizationId);

                if (visualization) {
                    delete visualization.statusReportPending;
                }
            }
        },
        visualizationErrorAction: (
            state,
            _action: PayloadAction<{
                errorType: SdkErrorType;
                errorMessage?: string;
            }>,
        ) => state,
        pinConversationAction: (
            state,
            _action: PayloadAction<{
                conversationId: string;
                pinned: boolean;
            }>,
        ) => state,
        pinConversationSuccessAction: (
            state,
            { payload }: PayloadAction<{ conversationId: string; pinned: boolean }>,
        ) => {
            state.conversations = state.conversations?.map((conversation) =>
                conversation.localId === payload.conversationId
                    ? {
                          ...conversation,
                          pinned: payload.pinned,
                      }
                    : conversation,
            );

            if (isConversationWithLocalId(state.currentConversation, payload.conversationId)) {
                state.currentConversation = {
                    ...state.currentConversation,
                    pinned: payload.pinned,
                };
            }
        },
        pinConversationFailureAction: (
            state,
            { payload }: PayloadAction<{ conversationId: string; error: Error; pinned?: boolean }>,
        ) => {
            state.conversations = state.conversations?.map((conversation) =>
                conversation.localId === payload.conversationId
                    ? {
                          ...conversation,
                          pinned: payload.pinned,
                      }
                    : conversation,
            );

            if (isConversationWithLocalId(state.currentConversation, payload.conversationId)) {
                state.currentConversation = {
                    ...state.currentConversation,
                    pinned: payload.pinned,
                };
            }
        },
        deleteConversationAction: (state, _action: PayloadAction<{ conversationId: string }>) => state,
        deleteConversationStartAction: (state, { payload }: PayloadAction<{ conversationId: string }>) => {
            if (isConversationWithLocalId(state.currentConversation, payload.conversationId)) {
                // keep list of conversations, but clear current conversation data in the view
                state.currentConversation = createEmptyConversation();
            }
            delete state.conversationsData[payload.conversationId];
            state.conversations = state.conversations?.filter(
                (conversation) => conversation.localId !== payload.conversationId,
            );
        },
        deleteConversationSuccessAction: (
            state,
            _action: PayloadAction<{ conversation: IChatConversationLocal }>,
        ) => state,
        deleteConversationFailureAction: (
            state,
            { payload }: PayloadAction<{ conversation: IChatConversationLocal; error: Error }>,
        ) => {
            state.conversations = [...(state.conversations ?? []), payload.conversation];
        },
    },
});

const errorToObject = (error: Error) =>
    Object.fromEntries(Object.getOwnPropertyNames(error).map((key) => [key, (error as any)[key]]));

export const messagesSliceReducer: Reducer<MessagesSliceState> = messagesSlice.reducer;
export const {
    loadThreadAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
    loadConversationsSuccessAction,
    loadConversationSuccessAction,
    restoreCachedMessagesAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
    clearConversationSuccessAction,
    evaluateConversationTitleAction,
    evaluateMessageAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageUpdateAction,
    evaluateMessageSuggestionsAction,
    evaluateMessageCompleteAction,
    setMessagesAction,
    setVerboseAction,
    setGlobalErrorAction,
    cancelAsyncAction,
    setUserFeedback,
    setUserFeedbackError,
    clearUserFeedbackError,
    saveVisualizationAction,
    savedVisualizationAction,
    saveVisualizationErrorAction,
    saveVisualizationSuccessAction,
    saveVisualisationRenderStatusAction,
    saveVisualisationRenderStatusSuccessAction,
    visualizationErrorAction,
    startNewConversationAction,
    setCurrentConversationAction,
    pinConversationAction,
    pinConversationSuccessAction,
    pinConversationFailureAction,
    deleteConversationAction,
    deleteConversationStartAction,
    deleteConversationSuccessAction,
    deleteConversationFailureAction,

    /**
     * @public
     */
    clearThreadAction,
    /**
     * @public
     */
    newMessageAction,
} = messagesSlice.actions;
