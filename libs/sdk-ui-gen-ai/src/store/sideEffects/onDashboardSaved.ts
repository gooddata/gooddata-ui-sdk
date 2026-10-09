// (C) 2026 GoodData Corporation

import { call, getContext, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { conversationByIdOrLocalIdSelector } from "../messages/messagesSelectors.js";
import { type dashboardSavedAction } from "../messages/messagesSlice.js";

export function* onDashboardSaved({ payload }: ReturnType<typeof dashboardSavedAction>) {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    try {
        const conversation: IChatConversationLocal | undefined = yield select(
            conversationByIdOrLocalIdSelector,
            payload.conversationId,
        );
        if (!conversation) {
            return;
        }

        const thread = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations({ isPreview })
            .getConversationThread(conversation.id);

        for (const { originalInsightId, savedInsightId } of payload.savedInsights) {
            try {
                yield call(thread.resaveVisualisation.bind(thread), originalInsightId, savedInsightId);
            } catch (error) {
                console.error("Failed to notify GenAI about the saved visualization", error);
            }
        }
        yield call(
            thread.resaveDashboard.bind(thread),
            payload.originalDashboardId,
            payload.savedDashboardId,
        );
    } catch (error) {
        console.error("Failed to notify GenAI about the saved dashboard", error);
    }
}
