// (C) 2024 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    AssistantMessage,
    Contents,
    isAssistantMessage,
    isUserMessage,
    makeErrorContents,
    Message,
    UserMessage,
} from "../../model.js";

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

const resolveInteraction = (
    state: MessagesSliceState,
    userMessageId: string,
    assistantMessageId: string,
): [UserMessage | void, AssistantMessage | void] => {
    const assistantMessage = state.messages[assistantMessageId];
    const userMessage = state.messages[userMessageId];

    if (
        !assistantMessage ||
        !isAssistantMessage(assistantMessage) ||
        !userMessage ||
        !isUserMessage(userMessage)
    ) {
        return [undefined, undefined];
    }

    return [userMessage, assistantMessage];
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
         * The evaluation failed, need to update the assistant message and user message.
         */
        evaluateMessageErrorAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                error: string;
                assistantMessageId: string;
                userMessageId: string;
            }>,
        ) => {
            delete state.asyncProcess;
            const [userMessage, assistantMessage] = resolveInteraction(
                state,
                payload.userMessageId,
                payload.assistantMessageId,
            );

            if (!assistantMessage || !userMessage) {
                // This should not happen
                state.globalError = `Unexpected error during message evaluation. ${payload.error}`;
                return;
            }

            assistantMessage.complete = true;
            assistantMessage.content.push(makeErrorContents(payload.error));
        },
        evaluateMessagePollingAction: (
            state,
            {
                payload,
            }: PayloadAction<{
                contents: Contents[];
                complete: boolean;
                localId: string;
                interactionId: number;
            }>,
        ) => {
            const assistantMessage = state.messages[payload.localId];

            if (!assistantMessage || !isAssistantMessage(assistantMessage)) {
                // This should not happen
                state.globalError = `Unexpected error during message evaluation.`;
                return;
            }

            assistantMessage.id = payload.interactionId;
            assistantMessage.content = payload.contents;
            assistantMessage.complete = payload.complete;
            assistantMessage.cancelled = false;

            if (payload.complete) {
                delete state.asyncProcess;
            }
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
    evaluateMessagePollingAction,
    setMessagesAction,
    setVerboseAction,
    setGlobalErrorAction,
    cancelAsyncAction,
} = messagesSlice.actions;
