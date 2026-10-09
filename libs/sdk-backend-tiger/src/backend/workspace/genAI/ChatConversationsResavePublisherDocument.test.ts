// (C) 2026 GoodData Corporation

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type ChatConversationsService as ChatConversationsServiceClass } from "./ChatConversations.js";

// The endpoint module is mocked by the sibling test file; this one needs the real request it builds.
let ChatConversationsService: typeof ChatConversationsServiceClass;

beforeAll(async () => {
    vi.doUnmock("@gooddata/api-client-tiger/endpoints/genAI");
    vi.resetModules();
    ({ ChatConversationsService } = await import("./ChatConversations.js"));
});

afterAll(() => {
    vi.resetModules();
});

describe("ConversationThread.resavePublisherDocument", () => {
    const dateNormalizer: DateNormalizer = (value) => value ?? "";
    const request = vi.fn();
    const authCallWith = (basePath: string) =>
        vi.fn(async (callback) => callback({ axios: { request }, basePath })) as TigerAuthenticatedCallGuard;
    const threadOf = (conversationId: string, basePath = "") =>
        new ChatConversationsService(
            authCallWith(basePath),
            "workspace",
            dateNormalizer,
        ).getConversationThread(conversationId);

    beforeEach(() => {
        request.mockReset();
        request.mockResolvedValue({ status: 204 });
    });

    it("records the saved report under the draft's name in the conversation", async () => {
        await threadOf("conversation").resavePublisherDocument("report_1", "saved-1");

        expect(request).toHaveBeenCalledTimes(1);
        expect(request.mock.calls[0][0]).toMatchObject({
            method: "PATCH",
            url: "/api/v1/ai/workspaces/workspace/chat/conversations/conversation/reports/report_1",
        });
        expect(JSON.parse(request.mock.calls[0][0].data)).toEqual({ id: "saved-1" });
    });

    it("puts the client's base path in front of the path", async () => {
        await threadOf("conversation", "https://acme.test").resavePublisherDocument("report_1", "saved-1");

        expect(request.mock.calls[0][0].url).toBe(
            "https://acme.test/api/v1/ai/workspaces/workspace/chat/conversations/conversation/reports/report_1",
        );
    });

    it("keeps a name with unsafe characters in its own path segment", async () => {
        await threadOf("conversation").resavePublisherDocument("a/b?c#d", "saved-1");

        expect(request.mock.calls[0][0].url).toBe(
            "/api/v1/ai/workspaces/workspace/chat/conversations/conversation/reports/a%2Fb%3Fc%23d",
        );
    });

    it("passes on the failure of the call", async () => {
        request.mockRejectedValue(new Error("gone"));

        await expect(threadOf("conversation").resavePublisherDocument("report_1", "saved-1")).rejects.toThrow(
            "gone",
        );
    });

    it("refuses to record anything for a thread without a conversation", async () => {
        await expect(threadOf("").resavePublisherDocument("report_1", "saved-1")).rejects.toThrow(
            "Conversation ID is not set",
        );
        expect(request).not.toHaveBeenCalled();
    });
});
