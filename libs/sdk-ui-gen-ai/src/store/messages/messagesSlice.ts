// (C) 2024-2025 GoodData Corporation
import { createSlice, PayloadAction, Reducer } from "@reduxjs/toolkit";
import { GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";
import {
    AssistantMessage,
    Contents,
    isAssistantMessage,
    isUserMessage,
    isVisualizationContents,
    makeErrorContents,
    Message,
    UserMessage,
} from "../../model.js";
import { SdkErrorType } from "@gooddata/sdk-ui";

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
     * A global error message. I.e. if something unexpected went wrong,
     * not on the interaction level.
     */
    globalError?: string;
    /**
     * If the interface is busy, this specifies the details of the async operation.
     * Where:
     * - loading: the thread history is being loaded
     * - clearing: the thread is being cleared
     * - evaluating: the new user message is being evaluated by assistant
     */
    asyncProcess?: "loading" | "clearing" | "evaluating";
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
    messageOrder: [],
    messages: {},
    loaded: false,
    verbose: getInitialVerboseState(),
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

const getAssistantMessageStrict = (
    state: MessagesSliceState,
    assistantMessageId: string,
): AssistantMessage => {
    const message = state.messages[assistantMessageId];
    if (!isAssistantMessage(message)) {
        throw new Error(`Unexpected error during message evaluation.`);
    }
    return message;
};

const getUserMessageBeforeStrict = (state: MessagesSliceState, assistantMessageId: string): UserMessage => {
    const messageIndex = state.messageOrder.indexOf(assistantMessageId);
    const message = state.messages[state.messageOrder[messageIndex - 1]];
    if (!isUserMessage(message)) {
        throw new Error(`Unexpected error during message evaluation.`);
    }
    return message;
};

const messagesSlice = createSlice({
    name: messagesSliceName,
    initialState,
    reducers: {
        loadThreadAction: (state) => {
            state.asyncProcess = "loading";
        },
        loadThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: string }>) => {
            state.globalError = error;
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
        clearThreadAction: (state) => {
            state.asyncProcess = "clearing";
        },
        clearThreadErrorAction: (state, { payload: { error } }: PayloadAction<{ error: string }>) => {
            state.globalError = error;
            delete state.asyncProcess;
        },
        clearThreadSuccessAction: (state) => {
            state.messages = {};
            state.messageOrder = [];
            state.loaded = false;
            delete state.asyncProcess;
            delete state.globalError;
        },
        /**
         * Add message to the stack
         */
        newMessageAction: (state, action: PayloadAction<Message>) => {
            state.messages[action.payload.localId] = action.payload;
            state.messageOrder.push(action.payload.localId);
            state.loaded = true;
        },
        /**
         * Start the message evaluation, adding new assistant message as an incomplete placeholder
         */
        evaluateMessageAction: (
            state,
            { payload: { message } }: PayloadAction<{ message: AssistantMessage }>,
        ) => {
            state.asyncProcess = "evaluating";
            state.messages[message.localId] = message;
            state.messageOrder.push(message.localId);
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

            assistantMessage.complete = true;
            assistantMessage.content.push(makeErrorContents(payload.error));
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
                contents: Contents[];
                assistantMessageId: string;
                interactionId?: string;
            }>,
        ) => {
            // Update assistant message
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);
            assistantMessage.id = payload.interactionId ?? assistantMessage.id;
            assistantMessage.content.push(...payload.contents);
            assistantMessage.cancelled = false;

            // Also update the interaction id in the relevant user message
            const userMessage = getUserMessageBeforeStrict(state, payload.assistantMessageId);
            userMessage.id = payload.interactionId ?? userMessage.id;
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
        setMessagesAction: (state, { payload: { messages } }: PayloadAction<{ messages: Message[] }>) => {
            setNormalizedMessages(state, messages);
        },
        setVerboseAction: (state, { payload: { verbose } }: PayloadAction<{ verbose: boolean }>) => {
            state.verbose = verbose;
        },
        setGlobalErrorAction: (state, { payload: { error } }: PayloadAction<{ error: string }>) => {
            state.globalError = error;
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
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

            assistantMessage.feedback = payload.feedback;
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

            const visualization = assistantMessage.content
                .filter(isVisualizationContents)
                .flatMap((content) => content.createdVisualizations)
                .find((content) => content.id === payload.visualizationId);

            if (visualization) {
                visualization.saving = true;
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

            const visualization = assistantMessage.content
                .filter(isVisualizationContents)
                .flatMap((content) => content.createdVisualizations)
                .find((content) => content.id === payload.visualizationId);

            if (visualization) {
                visualization.saving = false;
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

            const visualization = assistantMessage.content
                .filter(isVisualizationContents)
                .flatMap((content) => content.createdVisualizations)
                .find((content) => content.id === payload.visualizationId);

            if (visualization) {
                visualization.saving = false;
                visualization.savedVisualizationId = payload.savedVisualizationId;
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

            const visualization = assistantMessage.content
                .filter(isVisualizationContents)
                .flatMap((content) => content.createdVisualizations)
                .find((content) => content.id === payload.visualizationId);

            if (visualization) {
                delete visualization.statusReportPending;
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

export const messagesSliceReducer: Reducer<MessagesSliceState> = messagesSlice.reducer;
export const {
    loadThreadAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
    evaluateMessageAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageCompleteAction,
    setMessagesAction,
    setVerboseAction,
    setGlobalErrorAction,
    cancelAsyncAction,
    setUserFeedback,
    saveVisualizationAction,
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
