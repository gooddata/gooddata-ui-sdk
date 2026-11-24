// (C) 2026 GoodData Corporation

import { call, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend, type IChatConversation } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal, type IChatConversationLocalItem } from "../../model.js";
import { generateTitleFromQuestion } from "../../utils.js";
import { agentSwitchingActiveSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    conversationByIdSelector,
    pendingAgentSwitchSelector,
    selectedAgentIdSelector,
} from "../messages/messagesSelectors.js";
import {
    applyPendingAgentSwitchAction,
    evaluateMessageErrorAction,
    revertAgentSwitchAction,
    upsertConversationAction,
} from "../messages/messagesSlice.js";

import { extractErrorContent } from "./utils.js";

type UserMessageConversationContext = {
    backend: IAnalyticalBackend;
    workspace: string;
    isPreview: boolean | undefined;
};

export function* ensureUserMessageConversation(
    { backend, workspace, isPreview }: UserMessageConversationContext,
    conversationState: IChatConversationLocal,
    message: IChatConversationLocalItem,
) {
    if (conversationState.id) {
        return conversationState;
    }

    const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
    // agentSwitchingActiveSelector is false in preview mode, so preview conversations are
    // never created with an explicit agent and stay pinned to the preview agent being built.
    const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
    const selectedAgentId: string | undefined = agentSwitchingActive
        ? yield select(selectedAgentIdSelector)
        : undefined;
    const created: IChatConversation = yield call(
        { context: api, fn: api.create },
        selectedAgentId
            ? {
                  agentId: selectedAgentId,
              }
            : undefined,
    );
    const updated: IChatConversation = yield call(api.update.bind(api), created.id, {
        title: message.content.type === "text" ? generateTitleFromQuestion(message.content.text) : undefined,
    });

    return {
        ...updated,
        agentId: updated.agentId ?? created.agentId ?? selectedAgentId,
        localId: conversationState.localId,
    };
}

export function* flushPendingAgentSwitch(
    { backend, workspace, isPreview }: UserMessageConversationContext,
    conversation: IChatConversationLocal,
    userMessageId: string,
    assistantMessageId: string,
) {
    // Guard with the feature flag: when agent switching is off the pending
    // switch should never be set, but skip defensively to preserve the
    // original no-switching behaviour in that case.
    const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
    const pendingSwitch: ReturnType<typeof pendingAgentSwitchSelector> = agentSwitchingActive
        ? yield select(pendingAgentSwitchSelector, conversation.localId)
        : undefined;
    if (pendingSwitch) {
        try {
            yield put(
                applyPendingAgentSwitchAction({
                    conversationLocalId: conversation.localId,
                    beforeItemLocalId: userMessageId,
                }),
            );
            const chatConversations = backend
                .workspace(workspace)
                .genAI()
                .getChatConversations({ isPreview });
            const updatedConversation: IChatConversation = yield call(
                chatConversations.switchAgent.bind(chatConversations),
                conversation.id,
                pendingSwitch.agentId,
            );
            // Apply only the switch fields; other metadata may have changed while the request was pending.
            const latestConversation: IChatConversationLocal | undefined = yield select(
                conversationByIdSelector,
                conversation.localId,
            );
            yield put(
                upsertConversationAction({
                    conversation: {
                        ...(latestConversation ?? conversation),
                        id: updatedConversation.id,
                        agentId: updatedConversation.agentId,
                    },
                }),
            );
        } catch (e) {
            console.error("Failed to switch agent before sending message", e);
            yield put(
                revertAgentSwitchAction({
                    previousAgentId: pendingSwitch.previousAgentId,
                    failedAgentId: pendingSwitch.agentId,
                    conversationLocalId: conversation.localId,
                }),
            );
            yield put(
                evaluateMessageErrorAction({
                    assistantMessageId,
                    error: extractErrorContent(e),
                    conversationId: conversation.localId,
                }),
            );
            return false;
        }
    }

    return true;
}
