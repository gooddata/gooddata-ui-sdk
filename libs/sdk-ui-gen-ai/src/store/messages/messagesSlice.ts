// (C) 2024-2026 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { type IChatConversation, type IChatConversationItem } from "@gooddata/sdk-backend-spi";
import { type GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";
import { type SdkErrorType } from "@gooddata/sdk-ui";

import {
    type AssistantMessage,
    type Contents,
    type IChatConversationErrorContent,
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
     * A list of conversations.
     */
    conversations: IChatConversation[];
    /**
     * The current conversation.
     */
    currentConversation: IChatConversation | undefined;
    /**
     * Conversation items.
     */
    conversationItems: Record<string, IChatConversationLocalItem>;
    /**
     * Conversation items order.
     */
    conversationItemsOrder: string[];

    /**
     * A global error object. I.e. if something unexpected went wrong,
     * not on the interaction level.
     */
    globalError?: Record<string, unknown>;
    /**
     * If the interface is busy, this specifies the details of the async operation.
     * Where:
     * - loading: the thread history is being loaded from the backend (no messages to show yet)
     * - restoring: cached messages have been restored while the backend fetch is still in-flight
     * - clearing: the thread is being cleared
     * - evaluating: the new user message is being evaluated by assistant
     */
    asyncProcess?: "loading" | "restoring" | "clearing" | "evaluating";
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
    asyncProcess: "loading",
    loaded: false,
    verbose: getInitialVerboseState(),
    //old messages
    messageOrder: [],
    messages: {},
    //conversations
    conversations: [],
    currentConversation: undefined,
    conversationItems: {},
    conversationItemsOrder: [],
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

const setNormalizedConversations = (state: MessagesSliceState, conversations: IChatConversation[]) => {
    state.conversations = conversations;
};

const setNormalizedConversation = (
    state: MessagesSliceState,
    conversation: IChatConversation,
    items: IChatConversationLocalItem[] = [],
) => {
    state.currentConversation = conversation;
    state.conversationItems = items.reduce(
        (acc, message) => {
            acc[message.localId] = message;
            return acc;
        },
        {} as MessagesSliceState["conversationItems"],
    );
    state.conversationItemsOrder = items.map((message) => message.localId);
    state.loaded = true;
};

const getAssistantMessageStrict = (
    state: MessagesSliceState,
    assistantMessageId: string,
): AssistantMessage | IChatConversationLocalItem => {
    if (state.currentConversation) {
        const message = state.conversationItems[assistantMessageId];
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
): UserMessage | IChatConversationLocalItem => {
    if (state.currentConversation) {
        const message = state.conversationItems[assistantMessageId];
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

const getMessageExists = (state: MessagesSliceState, assistantMessageId: string): boolean => {
    if (state.currentConversation) {
        return !!state.conversationItems[assistantMessageId];
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
): UserMessage | IChatConversationLocalItem | undefined => {
    if (state.currentConversation) {
        const messageIndex = state.conversationItemsOrder.indexOf(assistantMessageId);
        if (messageIndex <= 0) {
            return undefined;
        }
        const message = state.conversationItems[state.conversationItemsOrder[messageIndex - 1]];
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
            state.asyncProcess = "loading";
        },
        loadThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
            delete state.asyncProcess;
        },
        loadThreadSuccessAction: (
            state,
            { payload: { messages, threadId } }: PayloadAction<{ messages: Message[]; threadId: string }>,
        ) => {
            setNormalizedMessages(state, messages);
            state.threadId = threadId;
            delete state.asyncProcess;
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
            //TODO: s.hacker New needs to be changed
            const normalized = messages.reduce(
                (acc, message) => {
                    acc[message.localId] = message;
                    return acc;
                },
                {} as MessagesSliceState["messages"],
            );
            state.messages = normalized;
            state.messageOrder = messages.map((message) => message.localId);
            state.asyncProcess = "restoring";
        },
        loadConversationsSuccessAction: (
            state,
            {
                payload: { conversations, currentConversation, conversationItems, threadId },
            }: PayloadAction<{
                conversations: IChatConversation[];
                currentConversation: IChatConversation;
                conversationItems: IChatConversationLocalItem[];
                threadId?: string;
            }>,
        ) => {
            setNormalizedConversations(state, conversations);
            setNormalizedConversation(state, currentConversation, conversationItems);
            state.threadId = threadId;
            delete state.asyncProcess;
        },
        clearThreadAction: (state) => {
            state.asyncProcess = "clearing";
        },
        clearThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
            delete state.asyncProcess;
        },
        clearThreadSuccessAction: (state) => {
            state.messages = {};
            state.messageOrder = [];
            state.loaded = false;
            delete state.asyncProcess;
            delete state.globalError;
        },
        clearConversationSuccessAction: (
            state,
            {
                payload: { conversation, threadId },
            }: PayloadAction<{ conversation: IChatConversation; threadId: string }>,
        ) => {
            state.conversations.unshift(conversation);
            state.currentConversation = conversation;
            state.conversationItems = {};
            state.conversationItemsOrder = [];
            state.threadId = threadId;
            state.loaded = false;
            delete state.asyncProcess;
            delete state.globalError;
        },
        /**
         * Add message to the stack
         */
        newMessageAction: (state, action: PayloadAction<Message | IChatConversationLocalItem>) => {
            const message = action.payload;
            if (isChatConversationLocalItem(message)) {
                if (!state.currentConversation) {
                    throw new Error("Working with conversation message but thread mode is active.");
                }
                state.conversationItems[message.localId] = message;
                state.conversationItemsOrder.push(message.localId);
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
                payload: { message },
            }: PayloadAction<{ message: AssistantMessage | IChatConversationLocalItem }>,
        ) => {
            if (isChatConversationLocalItem(message)) {
                if (!state.currentConversation) {
                    throw new Error("Working with conversation message but thread mode is active.");
                }
                state.conversationItems[message.localId] = message;
                state.conversationItemsOrder.push(message.localId);
            } else {
                if (state.currentConversation) {
                    throw new Error("Working with thread message but conversation mode is active.");
                }
                state.messages[message.localId] = message;
                state.messageOrder.push(message.localId);
            }
            state.asyncProcess = "evaluating";
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
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

            if (isChatConversationLocalItem(assistantMessage)) {
                assistantMessage.complete = true;
                assistantMessage.streaming = false;
                assistantMessage.content = makeErrorContent(payload.error);
            } else {
                assistantMessage.complete = true;
                assistantMessage.content.push(makeErrorContents(payload.error));
            }
            delete state.asyncProcess;
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
            }>,
        ) => {
            //NOTE: During streaming a message, user can choose to close or reset a chat
            // and without this check, we would get an unwanted error
            const exists = getMessageExists(state, payload.assistantMessageId);
            if (!exists) {
                return;
            }

            // Update assistant message
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);
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
            const userMessage = getUserMessageBeforeSafe(state, payload.assistantMessageId);
            if (userMessage) {
                userMessage.id = payload.interactionId ?? userMessage.id;
            }
        },
        evaluateMessageUpdateAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                userMessageId: string;
                message: IChatConversationItem | UserMessage;
                interactionId?: string;
            }>,
        ) => {
            //NOTE: During streaming a message, user can choose to close or reset a chat
            // and without this check, we would get an unwanted error
            const exists = getMessageExists(state, payload.userMessageId);
            if (!exists) {
                return;
            }

            // Update assistant message
            const userMessage = getUserMessageStrict(state, payload.userMessageId);
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
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);
            assistantMessage.complete = true;
            delete state.asyncProcess;
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
        setGlobalErrorAction: (state, { payload: { error } }: PayloadAction<{ error: Error }>) => {
            state.globalError = errorToObject(error);
        },
        cancelAsyncAction: (state) => {
            delete state.asyncProcess;
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
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
                error: string;
            }>,
        ) => {
            // Reset feedback to NONE and set error when submission fails
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
            }>,
        ) => {
            // Clear feedback error after showing toast
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);
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
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
                explore: boolean;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

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
    restoreCachedMessagesAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
    clearConversationSuccessAction,
    evaluateMessageAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageUpdateAction,
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

    /**
     * @public
     */
    clearThreadAction,
    /**
     * @public
     */
    newMessageAction,
} = messagesSlice.actions;
