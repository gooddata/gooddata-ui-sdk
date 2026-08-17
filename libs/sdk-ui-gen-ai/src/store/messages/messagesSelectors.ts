// (C) 2024-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type GenAIChatEffort } from "@gooddata/sdk-model";

import { DEFAULT_EFFORT } from "../../components/utils/effortSelection.js";
import { type IChatConversationLocal, type IChatConversationLocalItem, type Message } from "../../model.js";
import { type IChatConversationResponseTrace } from "../../types.js";
import { type RootState } from "../types.js";

import { messagesSliceName } from "./messagesSlice.js";

const messagesSliceSelector = (state: RootState) => state[messagesSliceName];

export const messagesSelector: (state: RootState) => Message[] = createSelector(
    messagesSliceSelector,
    (state) => state.messageOrder.map((id) => state.messages[id]),
);

export const loadedSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.loaded && state.conversationsLoaded,
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
    (state) => {
        if (state.messageOrder.length > 0) {
            return true;
        }
        const data = state.conversationsData[state.currentConversation?.localId ?? ""];
        return (data?.order ?? []).length > 0;
    },
);

export const asyncProcessSelector: (
    state: RootState,
) => "loading" | "restoring" | "clearing" | "evaluating" | undefined = createSelector(
    messagesSliceSelector,
    (state) => {
        if (state.currentConversation) {
            const data = state.conversationsData[state.currentConversation.localId];
            return data?.asyncProcess;
        }
        return state.messageAsyncProcess;
    },
);

export const pendingAgentSwitchSelector = (
    state: RootState,
    conversationLocalId: string,
): { agentId: string; previousAgentId: string | undefined } | undefined =>
    state[messagesSliceName].conversationsData[conversationLocalId]?.pendingAgentSwitch;

export const globalErrorSelector: (state: RootState) => Record<string, unknown> | null = createSelector(
    messagesSliceSelector,
    (state) => state.globalError ?? null,
);

export const threadIdSelector: (state: RootState) => string | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.threadId,
);

export const conversationMessagesSelector: (state: RootState) => IChatConversationLocalItem[] =
    createSelector(messagesSliceSelector, (state) => {
        const data = state.conversationsData[state.currentConversation?.localId ?? ""];
        return data?.order.map((id) => data.items[id]) ?? [];
    });

export const conversationMessagesByIdSelector: (
    state: RootState,
    conversationId?: string,
) => IChatConversationLocalItem[] = createSelector(
    [messagesSliceSelector, (_state: RootState, conversationId?: string) => conversationId],
    (state, conversationId) => {
        const data = state.conversationsData[conversationId ?? ""];
        if (!data) {
            return [];
        }

        return data.order.map((id) => data.items[id]);
    },
);

const EMPTY_TRACE: IChatConversationResponseTrace = {
    steps: [],
    detailsByStepId: {},
    responseDetails: [],
};

/**
 * The "Interaction Intelligence" trace of one response of the current conversation. Empty until the
 * turn's steps have streamed in.
 */
export const interactionTraceByResponseIdSelector: (
    state: RootState,
    responseId: string,
) => IChatConversationResponseTrace = createSelector(
    [messagesSliceSelector, (_state: RootState, responseId: string) => responseId],
    (state, responseId) => {
        const data = state.conversationsData[state.currentConversation?.localId ?? ""];
        return data?.interactionTrace?.[responseId] ?? EMPTY_TRACE;
    },
);

export const conversationSelector: (state: RootState) => IChatConversationLocal | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.currentConversation,
);

export const selectedAgentIdSelector: (state: RootState) => string | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.selectedAgentId,
);

export const selectedEffortSelector: (state: RootState) => GenAIChatEffort = createSelector(
    messagesSliceSelector,
    (state) => {
        if (!state.currentConversation) {
            return state.selectedEffort;
        }
        return state.conversationsData[state.currentConversation.localId]?.reasoningEffort ?? DEFAULT_EFFORT;
    },
);

export const conversationEffortSelector = (state: RootState, conversationLocalId?: string): GenAIChatEffort =>
    state[messagesSliceName].conversationsData[conversationLocalId ?? ""]?.reasoningEffort ?? DEFAULT_EFFORT;

export const agentsSelector = createSelector(messagesSliceSelector, (state) => state.agents);

export const agentsAvailableSelector: (state: RootState) => boolean | undefined = createSelector(
    agentsSelector,
    (agents) => (agents ? agents.length > 0 : undefined),
);

export const conversationByIdSelector: (
    state: RootState,
    conversationId: string,
) => IChatConversationLocal | undefined = createSelector(
    [messagesSliceSelector, (_state: RootState, conversationId: string) => conversationId],
    (state, conversationId) =>
        state.conversations?.find((conversation) => conversation.localId === conversationId),
);

export const conversationsSelector: (state: RootState) => IChatConversationLocal[] | undefined =
    createSelector(messagesSliceSelector, (state) => state.conversations);

export const conversationsLoadedSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.conversationsLoaded,
);
