// (C) 2026 GoodData Corporation

import { type AxiosProgressEvent, type AxiosPromise } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GenAiApi_PostMessages } from "@gooddata/api-client-tiger/endpoints/genAI";
import { idRef } from "@gooddata/sdk-model";

import type { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { ChatConversationThreadQuery } from "./ChatConversations.js";

vi.mock("@gooddata/api-client-tiger/endpoints/genAI", () => ({
    GenAiApi_DeleteConversation: vi.fn(),
    GenAiApi_GetConversation: vi.fn(),
    GenAiApi_GetConversationItems: vi.fn(),
    GenAiApi_GetConversationResponses: vi.fn(),
    GenAiApi_GetConversations: vi.fn(),
    GenAiApi_PostConversationFeedback: vi.fn(),
    GenAiApi_PatchVisualization: vi.fn(),
    GenAiApi_PostConversations: vi.fn(),
    GenAiApi_PostMessages: vi.fn(),
}));

describe("ChatConversationThreadQuery.stream", () => {
    const dateNormalizer: DateNormalizer = (value) => value ?? "";
    const authCall = vi.fn(async (callback) =>
        callback({
            axios: {},
            basePath: "",
        }),
    ) as TigerAuthenticatedCallGuard;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should include x-gdc-trace-id from response headers in stream errors", async () => {
        vi.mocked(GenAiApi_PostMessages).mockImplementation((_, __, ___, options) => {
            options?.onDownloadProgress?.({
                event: {
                    target: {
                        responseText: `event: error\ndata: {"statusCode":500,"detail":"Request failed"}\n\n`,
                        getResponseHeader: (name: string) => (name === "x-gdc-trace-id" ? "trace-123" : null),
                    },
                },
            } as unknown as AxiosProgressEvent);

            return Promise.resolve({
                headers: {},
                data: {},
            } as unknown as AxiosPromise);
        });

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            userQuestion: "Hello",
        });

        const reader = query.stream().getReader();

        const firstEvent = await reader.read();
        expect(firstEvent.done).toBe(false);
        expect(firstEvent.value).toEqual({
            type: "error",
            code: 500,
            message: "Request failed",
            traceId: "trace-123",
        });

        const end = await reader.read();
        expect(end.done).toBe(true);
    });
});

describe("ChatConversationThreadQuery userContext conversion", () => {
    const dateNormalizer: DateNormalizer = (value) => value ?? "";
    const authCall = vi.fn(async (callback) =>
        callback({
            axios: {},
            basePath: "",
        }),
    ) as TigerAuthenticatedCallGuard;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(GenAiApi_PostMessages).mockResolvedValue({
            data: { items: [] },
        } as unknown as Awaited<AxiosPromise>);
    });

    it("should send richText widget content in the dashboard view context", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [
                            {
                                title: "Notes",
                                widgetRef: idRef("rt-1", "analyticalDashboard"),
                                widgetType: "richText",
                                content: "## Heading\nSome notes.",
                            },
                        ],
                    },
                },
            },
        });

        await query.query();

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const widgets = request.aiSendMessageRequest.userContext?.view?.dashboard?.widgets;
        expect(widgets).toEqual([
            {
                title: "Notes",
                widgetId: "rt-1",
                widgetType: "richText",
                content: "## Heading\nSome notes.",
            },
        ]);
    });

    it("should preserve empty-string richText content rather than dropping it", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [
                            {
                                title: "Empty",
                                widgetRef: idRef("rt-2", "analyticalDashboard"),
                                widgetType: "richText",
                                content: "",
                            },
                        ],
                    },
                },
            },
        });

        await query.query();

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const widget = request.aiSendMessageRequest.userContext?.view?.dashboard?.widgets?.[0];
        expect(widget).toHaveProperty("content", "");
    });
});
