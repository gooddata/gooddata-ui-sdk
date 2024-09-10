// (C) 2024 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../types.js";
import { messagesSliceName } from "./messagesSlice.js";
import { Message, VisibleMessage } from "../../model.js";

const messagesSliceSelector = (state: RootState) => state[messagesSliceName];

const messagesOrderSelector = createSelector(messagesSliceSelector, (state) => state.messageOrder);

const messagesSelector = createSelector(messagesSliceSelector, (state) => state.messages);

export const allMessagesSelector: (state: RootState) => Message[] = createSelector(
    messagesOrderSelector,
    messagesSelector,
    (order, messages) => order.map((id) => messages[id]),
);

export const isVerboseSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.verbose,
);

export const visibleMessagesSelector: (state: RootState) => VisibleMessage[] = createSelector(
    allMessagesSelector,
    isVerboseSelector,
    (messages, verbose) => {
        if (verbose) {
            return messages;
        }

        return messages.filter((message) => message.role !== "system");
    },
);

export const lastMessageSelector: (state: RootState) => Message | undefined = createSelector(
    messagesOrderSelector,
    messagesSelector,
    (order, messages) => messages[order.length - 1],
);
