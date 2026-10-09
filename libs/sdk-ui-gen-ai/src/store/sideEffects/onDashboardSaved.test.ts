// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { dashboardSavedAction, messagesSliceReducer } from "../messages/messagesSlice.js";

import { onDashboardSaved } from "./onDashboardSaved.js";

describe("onDashboardSaved", () => {
    it("resaves the dashboard when an insight resave fails", async () => {
        const failure = new Error("gone");
        const resaveVisualisation = vi.fn(() => Promise.reject(failure));
        const resaveDashboard = vi.fn(() => Promise.resolve());
        const getConversationThread = vi.fn(() => ({ resaveVisualisation, resaveDashboard }));
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

        await runSaga(
            {
                context: {
                    backend: {
                        workspace: () => ({
                            genAI: () => ({
                                getChatConversations: () => ({
                                    getConversationThread,
                                }),
                            }),
                        }),
                    },
                    workspace: "workspace_1",
                },
                getState: () => ({
                    messages: {
                        ...messagesSliceReducer(undefined, { type: "test/init" }),
                        currentConversation: {
                            id: "server_conversation_1",
                            localId: "local_conversation_1",
                            title: "Conversation",
                            createdAt: new Date(1).toISOString(),
                            updatedAt: new Date(1).toISOString(),
                        },
                    },
                    chatWindow: chatWindowSliceReducer(undefined, { type: "test/init" }),
                }),
            },
            onDashboardSaved,
            dashboardSavedAction({
                conversationId: "local_conversation_1",
                originalDashboardId: "dashboard_1",
                savedDashboardId: "saved_dashboard_1",
                savedInsights: [{ originalInsightId: "insight_1", savedInsightId: "saved_insight_1" }],
            }),
        ).toPromise();

        expect(getConversationThread).toHaveBeenCalledWith("server_conversation_1");
        expect(resaveVisualisation).toHaveBeenCalledWith("insight_1", "saved_insight_1");
        expect(resaveDashboard).toHaveBeenCalledWith("dashboard_1", "saved_dashboard_1");
        expect(error).toHaveBeenCalledWith("Failed to notify GenAI about the saved visualization", failure);
    });
});
