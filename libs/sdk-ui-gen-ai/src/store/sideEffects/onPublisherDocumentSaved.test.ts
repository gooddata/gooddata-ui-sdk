// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { messagesSliceReducer, publisherDocumentSavedAction } from "../messages/messagesSlice.js";

import { onPublisherDocumentSaved } from "./onPublisherDocumentSaved.js";

const action = (documentRef?: string) =>
    publisherDocumentSavedAction({
        conversationId: "conversation_1",
        itemId: "item_1",
        documentRef,
        savedDocumentId: "saved_report_1",
    });

const getState = () => ({
    messages: {
        ...messagesSliceReducer(undefined, { type: "test/init" }),
        currentConversation: {
            id: "conversation_1",
            localId: "local_conversation_1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
        },
    },
    chatWindow: chatWindowSliceReducer(undefined, { type: "test/init" }),
});

describe("onPublisherDocumentSaved", () => {
    it("records the saved report in the GenAI conversation", async () => {
        const resavePublisherDocument = vi.fn(() => Promise.resolve());
        const getConversationThread = vi.fn(() => ({ resavePublisherDocument }));
        const getChatConversations = vi.fn(() => ({ getConversationThread }));

        await runSaga(
            {
                context: {
                    backend: {
                        workspace: () => ({ genAI: () => ({ getChatConversations }) }),
                    },
                    workspace: "workspace_1",
                    isPreview: true,
                },
                getState,
            },
            onPublisherDocumentSaved,
            action("report_1"),
        ).toPromise();

        expect(getChatConversations).toHaveBeenCalledWith({ isPreview: true });
        expect(getConversationThread).toHaveBeenCalledWith("conversation_1");
        expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1");
    });

    it("does not call the backend when the report has no conversation reference", async () => {
        const workspace = vi.fn();

        await runSaga(
            {
                context: {
                    backend: { workspace },
                    workspace: "workspace_1",
                },
            },
            onPublisherDocumentSaved,
            action(undefined),
        ).toPromise();

        expect(workspace).not.toHaveBeenCalled();
    });

    it("contains backend errors", async () => {
        const failure = new Error("gone");
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

        await runSaga(
            {
                context: {
                    backend: {
                        workspace: () => ({
                            genAI: () => ({
                                getChatConversations: () => ({
                                    getConversationThread: () => ({
                                        resavePublisherDocument: () => Promise.reject(failure),
                                    }),
                                }),
                            }),
                        }),
                    },
                    workspace: "workspace_1",
                },
                getState,
            },
            onPublisherDocumentSaved,
            action("report_1"),
        ).toPromise();

        expect(error).toHaveBeenCalledWith(
            "Failed to notify GenAI about the saved publisher document",
            failure,
        );
    });
});
