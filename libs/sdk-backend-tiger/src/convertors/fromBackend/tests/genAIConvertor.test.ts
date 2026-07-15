// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type AiConversationItemResponse } from "@gooddata/api-client-tiger";
import {
    type IChatConversationMultipartContent,
    type IChatConversationMultipartPart,
    type IChatConversationWhatIfContent,
    isChatConversationSearchContent,
} from "@gooddata/sdk-backend-spi";

import {
    convertChatConversationErrorFromBackend,
    convertChatConversationFromBackend,
    convertChatConversationItemFromBackend,
    convertChatSuggestionItemFromBackend,
} from "../genAIConvertor.js";

describe("genAIConvertor", () => {
    const dateNormalizer = vi.fn((val) => val);

    describe("convertChatConversationFromBackend", () => {
        it("should propagate pinned status", () => {
            const converted = convertChatConversationFromBackend({
                conversationId: "conv-1",
                workspaceId: "ws-1",
                organizationId: "org-1",
                userId: "user-1",
                createdAt: "2024-01-01T00:00:00Z",
                lastActivityAt: "2024-01-02T00:00:00Z",
                title: "My conversation",
                pinned: true,
                isPreview: false,
            });

            expect(converted).toEqual({
                id: "conv-1",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                title: "My conversation",
                pinned: true,
            });
        });
    });

    describe("convertWhatIf", () => {
        it("should correctly convert AiWhatIfScenario to IChatWhatIfDefinition", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "whatIf",
                            whatIf: {
                                includeBaseline: true,
                                scenarios: [
                                    {
                                        label: "Scenario 1",
                                        adjustments: [
                                            {
                                                metricId: "metric-1",
                                                metricType: "metric",
                                                scenarioMaql: "SELECT {metric-1} * 1.1",
                                            },
                                            {
                                                metricId: "metric-2",
                                                metricType: "fact", // Should be converted to fact (actually kept as is if not metric, but in code it says (a.metricType === 'metric' ? 'measure' : a.metricType))
                                                scenarioMaql: "SELECT {metric-2} * 1.2",
                                            },
                                        ],
                                    },
                                ],
                                visualizationRef: "",
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], dateNormalizer);
            const whatIfPart = (converted.content as IChatConversationMultipartContent)
                .parts[0] as IChatConversationWhatIfContent;

            expect(whatIfPart.type).toBe("whatIf");
            expect(whatIfPart.whatIf).toEqual({
                includeBaseline: true,
                scenarios: [
                    {
                        label: "Scenario 1",
                        adjustments: [
                            {
                                scenarioMaql: "SELECT {metric-1} * 1.1",
                                ref: {
                                    identifier: "metric-1",
                                    type: "measure",
                                },
                            },
                            {
                                scenarioMaql: "SELECT {metric-2} * 1.2",
                                ref: {
                                    identifier: "metric-2",
                                    type: "fact",
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe("convertSearchResults (via convertChatConversationItemFromBackend)", () => {
        const makeSearchItem = (certification?: {
            status: string;
            certificationMessage?: string | null;
        }): AiConversationItemResponse => ({
            conversationId: "conv-1",
            itemIndex: 0,
            itemId: "item-id",
            role: "assistant",
            createdAt: "2024-01-01T00:00:00Z",
            content: {
                type: "multipart",
                parts: [
                    {
                        type: "searchResults",
                        keywords: [],
                        relationships: [],
                        objects: [
                            {
                                id: "obj-1",
                                type: "dashboard",
                                workspaceId: "ws-1",
                                title: "My Dashboard",
                                score: 0.9,
                                ...(certification === undefined ? {} : { certification }),
                            },
                        ],
                    },
                ],
            },
        });

        const getFirstResult = (item: AiConversationItemResponse) => {
            const converted = convertChatConversationItemFromBackend(item, [], dateNormalizer);
            const content = (converted.content as { parts: IChatConversationMultipartPart[] }).parts[0];
            if (!isChatConversationSearchContent(content)) {
                throw new Error("Expected searchResults content");
            }
            return content.searchResults[0];
        };

        it("maps CERTIFIED status and certificationMessage", () => {
            const result = getFirstResult(
                makeSearchItem({ status: "CERTIFIED", certificationMessage: "Approved by data team" }),
            );

            expect(result.certification).toEqual({
                status: "CERTIFIED",
                certificationMessage: "Approved by data team",
            });
        });

        it("drops certification when status is not CERTIFIED", () => {
            const result = getFirstResult(makeSearchItem({ status: "DEPRECATED" }));

            expect(result.certification).toBeUndefined();
        });

        it("returns undefined certification when absent", () => {
            const result = getFirstResult(makeSearchItem());

            expect(result.certification).toBeUndefined();
        });

        it("maps certificationMessage as undefined when null", () => {
            const result = getFirstResult(
                makeSearchItem({ status: "CERTIFIED", certificationMessage: null }),
            );

            expect(result.certification).toEqual({
                status: "CERTIFIED",
                certificationMessage: undefined,
            });
        });
    });

    describe("convertChatConversationErrorFromBackend", () => {
        it("should include trace id when provided", () => {
            const converted = convertChatConversationErrorFromBackend(
                {
                    statusCode: 500,
                    detail: "Request failed",
                },
                "trace-123",
            );

            expect(converted).toEqual({
                type: "error",
                code: 500,
                message: "Request failed",
                traceId: "trace-123",
            });
        });

        it("should use fallback values when status and detail are missing", () => {
            const converted = convertChatConversationErrorFromBackend({});

            expect(converted).toEqual({
                type: "error",
                code: 500,
                message: "Unknown error",
                reason: undefined,
                traceId: undefined,
            });
        });
    });

    describe("convertChatSuggestionItemFromBackend", () => {
        it("should convert follow-up and actions", () => {
            const converted = convertChatSuggestionItemFromBackend({
                followUpQuestion: "What do you want to analyze next?",
                actions: [
                    {
                        label: "Revenue by region",
                        query: "Show revenue by region",
                    },
                ],
            });

            expect(converted).toEqual({
                followUpQuestion: "What do you want to analyze next?",
                actions: [
                    {
                        label: "Revenue by region",
                        query: "Show revenue by region",
                    },
                ],
            });
        });

        it("should gracefully handle undefined suggestions", () => {
            const converted = convertChatSuggestionItemFromBackend(undefined);

            expect(converted).toEqual({
                followUpQuestion: undefined,
                actions: undefined,
            });
        });
    });

    describe("convertChatConversationItemFromBackend toolResult parsing", () => {
        it("should parse tool result when it contains valid JSON string", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "tool",
                responseId: "resp-1",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "toolResult",
                    callId: "call-1",
                    result: '{"foo":"bar","count":2}',
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], dateNormalizer);

            expect(converted.content).toEqual({
                type: "toolResult",
                callId: "call-1",
                result: {
                    foo: "bar",
                    count: 2,
                },
            });
        });

        it("should keep tool result as string when JSON parsing fails", () => {
            const invalidJson = "{not-valid-json}";
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 1,
                itemId: "item-id-2",
                role: "tool",
                responseId: "resp-2",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "toolResult",
                    callId: "call-2",
                    result: invalidJson,
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], dateNormalizer);

            expect(converted.content).toEqual({
                type: "toolResult",
                callId: "call-2",
                result: invalidJson,
            });
        });
    });
});
