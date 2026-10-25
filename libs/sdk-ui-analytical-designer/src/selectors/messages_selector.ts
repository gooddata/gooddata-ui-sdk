// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IMessage } from "../models/message.js";
import { getMessagesState } from "../store/messages/messages_selectors.js";

export const displayedMessagesSelector = createSelector(
    getMessagesState,
    (messagesState): { messages: IMessage[] } => ({
        messages: messagesState.displayed,
    }),
);
