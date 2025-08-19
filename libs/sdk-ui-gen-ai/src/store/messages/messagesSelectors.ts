// (C) 2024-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { messagesSliceName } from "./messagesSlice.js";
import { Message } from "../../model.js";
import { RootState } from "../types.js";

const messagesSliceSelector = (state: RootState) => state[messagesSliceName];

export const messagesSelector: (state: RootState) => Message[] = createSelector(
    messagesSliceSelector,
    (state) => state.messageOrder.map((id) => state.messages[id]),
);

export const loadedSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.loaded,
);

export const isVerboseSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.verbose,
);

export const lastMessageSelector: (state: RootState) => Message | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.messages[state.messageOrder[state.messageOrder.length - 1]],
);

export const hasMessagesSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.messageOrder.length > 0,
);

export const asyncProcessSelector: (state: RootState) => RootState[typeof messagesSliceName]["asyncProcess"] =
    createSelector(messagesSliceSelector, (state) => state.asyncProcess);

export const globalErrorSelector: (state: RootState) => string | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.globalError,
);

export const lastMessageIdSelector: (state: RootState) => string | undefined = createSelector(
    messagesSelector,
    (messages) => [...messages].reverse().find((message) => !!message.id)?.id,
);

export const threadIdSelector: (state: RootState) => string | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.threadId,
);
