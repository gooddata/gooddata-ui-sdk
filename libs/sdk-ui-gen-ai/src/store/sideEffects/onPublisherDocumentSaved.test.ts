// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import {
    type GenAIPublisherDocumentFormat,
    type IChatConversationMultipartPart,
} from "@gooddata/sdk-backend-spi";
import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { messagesSliceReducer, publisherDocumentSavedAction } from "../messages/messagesSlice.js";

import { onPublisherDocumentSaved } from "./onPublisherDocumentSaved.js";

const action = (documentRef?: string, format?: GenAIPublisherDocumentFormat) =>
    publisherDocumentSavedAction({
        conversationId: "conversation_1",
        itemId: "item_1",
        documentRef,
        savedDocumentId: "saved_report_1",
        ...(format === undefined ? {} : { format }),
    });

const messageWith = (parts: IChatConversationMultipartPart[]): IChatConversationLocalItem => ({
    id: "item_1",
    localId: "local_item_1",
    type: "item",
    role: "assistant",
    responseId: "response_1",
    createdAt: 1,
    content: { type: "multipart", parts },
});

const settingsWithPublisherV2 = (enablePublisherV2: boolean): IUserWorkspaceSettings => ({
    userId: "user_1",
    workspace: "workspace_1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enablePublisherV2,
});

const getState =
    (parts: IChatConversationMultipartPart[] = [], settings?: IUserWorkspaceSettings) =>
    () => ({
        messages: {
            ...messagesSliceReducer(undefined, { type: "test/init" }),
            conversationsData: {
                local_conversation_1: {
                    items: { local_item_1: messageWith(parts) },
                    order: ["local_item_1"],
                },
            },
            currentConversation: {
                id: "conversation_1",
                localId: "local_conversation_1",
                title: "Conversation",
                createdAt: new Date(1).toISOString(),
                updatedAt: new Date(1).toISOString(),
            },
        },
        chatWindow: { ...chatWindowSliceReducer(undefined, { type: "test/init" }), settings },
    });

async function resaved(
    parts: IChatConversationMultipartPart[],
    settings?: IUserWorkspaceSettings,
    format?: GenAIPublisherDocumentFormat,
) {
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
            getState: getState(parts, settings),
        },
        onPublisherDocumentSaved,
        action("report_1", format),
    ).toPromise();

    return { resavePublisherDocument, getConversationThread, getChatConversations };
}

describe("onPublisherDocumentSaved", () => {
    it("records the saved report in the GenAI conversation", async () => {
        const { resavePublisherDocument, getConversationThread, getChatConversations } = await resaved([
            { type: "publisherDocument", publisherDocument: null, ref: "report_1" },
        ]);

        expect(getChatConversations).toHaveBeenCalledWith({ isPreview: true });
        expect(getConversationThread).toHaveBeenCalledWith("conversation_1");
        expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1", {
            format: "aac-v1",
        });
    });

    it("records a saved v2 document in the format of its part", async () => {
        const { resavePublisherDocument } = await resaved([
            { type: "publisherDocument", publisherDocument: null, ref: "report_0" },
            { type: "publisherDocumentV2", publisherDocument: null, ref: "report_1" },
        ]);

        expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1", {
            format: "aac-v2",
        });
    });

    it.each([
        ["aac-v2 with Publisher v2 on", true, "aac-v2"],
        ["aac-v1 with Publisher v2 off", false, "aac-v1"],
    ])(
        "records a document whose part the chat no longer holds as %s",
        async (_name, enablePublisherV2, format) => {
            const { resavePublisherDocument } = await resaved([], settingsWithPublisherV2(enablePublisherV2));

            expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1", { format });
        },
    );

    it.each<[string, boolean, GenAIPublisherDocumentFormat]>([
        ["aac-v1 with Publisher v2 on", true, "aac-v1"],
        ["aac-v2 with Publisher v2 off", false, "aac-v2"],
    ])(
        "records a document in the format the saved event names, %s, while the chat does not hold its part",
        async (_name, enablePublisherV2, format) => {
            const { resavePublisherDocument } = await resaved(
                [],
                settingsWithPublisherV2(enablePublisherV2),
                format,
            );

            expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1", { format });
        },
    );

    it("records a document in the format the saved event names over the format of its part", async () => {
        const { resavePublisherDocument } = await resaved(
            [{ type: "publisherDocument", publisherDocument: null, ref: "report_1" }],
            undefined,
            "aac-v2",
        );

        expect(resavePublisherDocument).toHaveBeenCalledWith("report_1", "saved_report_1", {
            format: "aac-v2",
        });
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
                getState: getState(),
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
