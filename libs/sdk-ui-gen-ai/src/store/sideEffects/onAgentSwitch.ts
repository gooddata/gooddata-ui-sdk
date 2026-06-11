// (C) 2026 GoodData Corporation

import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend, type IChatConversation } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { agentSwitchingActiveSelector } from "../chatWindow/chatWindowSelectors.js";
import { conversationSelector } from "../messages/messagesSelectors.js";
import {
    finishAgentSwitchAction,
    revertAgentSwitchAction,
    setCurrentConversationAction,
    type setSelectedAgentAction,
} from "../messages/messagesSlice.js";

export function* onAgentSwitch({ payload }: ReturnType<typeof setSelectedAgentAction>) {
    const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
    if (!agentSwitchingActive) {
        return;
    }

    if (!payload.showChangeEvent || !payload.agentId) {
        return;
    }

    const conversation: IChatConversationLocal | undefined = yield select(conversationSelector);
    if (!conversation?.id) {
        return;
    }

    try {
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const isPreview: boolean | undefined = yield getContext("isPreview");

        const chatConversations = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
        const switchAgentCall = chatConversations.switchAgent.bind(chatConversations);
        const updatedConversation: IChatConversation = yield call(
            switchAgentCall,
            conversation.id,
            payload.agentId,
        );

        const currentConversation: IChatConversationLocal | undefined = yield select(conversationSelector);
        if (currentConversation?.localId !== conversation.localId) {
            return;
        }
        if (currentConversation.agentId !== payload.agentId) {
            // A newer explicit switch has already taken over — discard this stale response.
            return;
        }

        yield put(
            setCurrentConversationAction({
                conversation: {
                    ...updatedConversation,
                    localId: conversation.localId,
                },
            }),
        );
    } catch (e) {
        console.error("Failed to switch agent for conversation", e);
        const currentConversation: IChatConversationLocal | undefined = yield select(conversationSelector);
        if (
            currentConversation?.localId === conversation.localId &&
            currentConversation.agentId === payload.agentId
        ) {
            yield put(
                revertAgentSwitchAction({
                    previousAgentId: payload.previousAgentId,
                    failedAgentId: payload.agentId,
                    conversationLocalId: conversation.localId,
                }),
            );
        }
    } finally {
        yield put(finishAgentSwitchAction({ conversationLocalId: conversation.localId }));
    }
}
