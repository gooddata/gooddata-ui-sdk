// (C) 2024 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";
import { AssistantMessage, Contents, isAssistantMessage, makeErrorContents, Message } from "../../model.js";

type MessagesSliceState = {
    /**
     * A verbose mode defines how much information is shown in the chat.
     */
    verbose: boolean;
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
};

export const LS_VERBOSE_KEY = "gd-gen-ai-verbose";
export const messagesSliceName = "messages";

const initialState: MessagesSliceState = {
    // Start with loading state to avoid re-render from empty state on startup
    asyncProcess: "loading",
    messageOrder: [],
    messages: {},
    verbose: window.localStorage.getItem(LS_VERBOSE_KEY) === "true",
};

const setNormalizedMessages = (state: MessagesSliceState, messages: Message[]) => {
    state.messages = messages.reduce((acc, message) => {
        acc[message.localId] = message;
        return acc;
    }, {} as MessagesSliceState["messages"]);
    state.messageOrder = messages.map((message) => message.localId);
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
            { payload: { messages } }: PayloadAction<{ messages: Message[] }>,
        ) => {
            setNormalizedMessages(state, messages);
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
            delete state.asyncProcess;
            delete state.globalError;
        },
        /**
         * Add message to the stack
         */
        newMessageAction: (state, action: PayloadAction<Message>) => {
            state.messages[action.payload.localId] = action.payload;
            state.messageOrder.push(action.payload.localId);
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
                interactionId?: number;
            }>,
        ) => {
            const assistantMessage = getAssistantMessageStrict(state, payload.assistantMessageId);

            assistantMessage.id = payload.interactionId ?? assistantMessage.id;
            assistantMessage.content.push(...payload.contents);
            assistantMessage.cancelled = false;
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
    },
});

export const messagesSliceReducer = messagesSlice.reducer;
export const {
    loadThreadAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
    clearThreadAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
    newMessageAction,
    evaluateMessageAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    evaluateMessageCompleteAction,
    setMessagesAction,
    setVerboseAction,
    setGlobalErrorAction,
    cancelAsyncAction,
    setUserFeedback,
} = messagesSlice.actions;
