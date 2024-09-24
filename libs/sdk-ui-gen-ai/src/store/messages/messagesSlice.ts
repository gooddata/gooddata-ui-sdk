// (C) 2024 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAssistantCancelledMessage, isUserTextMessage, Message } from "../../model.js";

type MessagesSliceState = {
    messageOrder: string[];
    messages: Record<string, Message>;
    verbose: boolean;
};

export const LS_VERBOSE_KEY = "gd-gen-ai-verbose";
export const messagesSliceName = "messages";

const initialState: MessagesSliceState = {
    messageOrder: [],
    messages: {},
    verbose: window.localStorage.getItem(LS_VERBOSE_KEY) === "true",
};

const messagesSlice = createSlice({
    name: messagesSliceName,
    initialState,
    reducers: {
        newMessageAction: (state, action: PayloadAction<Message>) => {
            if (isAssistantCancelledMessage(action.payload)) {
                const lastMessageId = state.messageOrder[state.messageOrder.length - 1];
                const lastMessage = state.messages[lastMessageId];

                if (!lastMessageId || !isUserTextMessage(lastMessage)) {
                    return;
                }

                // Mark the last user message as cancelled
                lastMessage.content.cancelled = true;
            }

            state.messages[action.payload.id] = action.payload;
            state.messageOrder.push(action.payload.id);
        },
        clearMessagesAction: (state) => {
            state.messageOrder = [];
            state.messages = {};
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload.reduce((acc, message) => {
                acc[message.id] = message;
                return acc;
            }, {} as MessagesSliceState["messages"]);
            state.messageOrder = action.payload.map((message) => message.id);
        },
        toggleVerboseAction: (state) => {
            state.verbose = !state.verbose;
        },
    },
});

export const messagesSliceReducer = messagesSlice.reducer;
export const { newMessageAction, clearMessagesAction, setMessages, toggleVerboseAction } =
    messagesSlice.actions;
