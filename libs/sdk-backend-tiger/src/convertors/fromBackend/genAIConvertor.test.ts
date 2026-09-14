// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type AiConversationItemResponse } from "@gooddata/api-client-tiger";
import {
    type IChatConversationDashboardContent,
    type IChatConversationItem,
    type IChatConversationMultipartContent,
    type IChatConversationMultipartPart,
    type IChatConversationWhatIfContent,
    isChatConversationSearchContent,
} from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IdentifierRef } from "@gooddata/sdk-model";

import {
    convertChatConversationErrorFromBackend,
    convertChatConversationFromBackend,
    convertChatConversationItemFromBackend,
    convertChatSuggestionItemFromBackend,
} from "./genAIConvertor.js";

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

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
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
            certification: string;
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
                                ...(certification === undefined ? {} : certification),
                            },
                        ],
                    },
                ],
            },
        });

        const getFirstResult = (item: AiConversationItemResponse) => {
            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const content = (converted.content as { parts: IChatConversationMultipartPart[] }).parts[0];
            if (!isChatConversationSearchContent(content)) {
                throw new Error("Expected searchResults content");
            }
            return content.searchResults[0];
        };

        it("maps CERTIFIED status and certificationMessage", () => {
            const result = getFirstResult(
                makeSearchItem({ certification: "CERTIFIED", certificationMessage: "Approved by data team" }),
            );

            expect(result.certification).toEqual({
                status: "CERTIFIED",
                certificationMessage: "Approved by data team",
            });
        });

        it("drops certification when status is not CERTIFIED", () => {
            const result = getFirstResult(makeSearchItem({ certification: "DEPRECATED" }));

            expect(result.certification).toBeUndefined();
        });

        it("returns undefined certification when absent", () => {
            const result = getFirstResult(makeSearchItem());

            expect(result.certification).toBeUndefined();
        });

        it("maps certificationMessage as undefined when null", () => {
            const result = getFirstResult(
                makeSearchItem({ certification: "CERTIFIED", certificationMessage: null }),
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

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;

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

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;

            expect(converted.content).toEqual({
                type: "toolResult",
                callId: "call-2",
                result: invalidJson,
            });
        });
    });

    describe("unrecognized content/part types", () => {
        it("drops the whole item when its content type is unrecognized", () => {
            const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: { type: "somethingNew" } as unknown as AiConversationItemResponse["content"],
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer);

            expect(converted).toBeUndefined();
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });

        it("drops only the unrecognized part, keeping known parts in a multipart item", () => {
            const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const item = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        { type: "text", text: "known part" },
                        { type: "somethingNew" },
                        { type: "text", text: "another known part" },
                    ],
                },
            } as unknown as AiConversationItemResponse;

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;

            expect((converted.content as IChatConversationMultipartContent).parts).toEqual([
                { type: "text", text: "known part" },
                { type: "text", text: "another known part" },
            ]);
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });
    });

    describe("dashboard patch", () => {
        const DASHBOARD_ID = "existing_dashboard";

        // Shapes mirror what gen-ai puts on the wire: the base rides ahead of the patch as its
        // own `dashboard` part, carrying the real dashboard id and no references of its own.
        const section = (vis: string) => ({
            widgets: [{ visualization: vis, title: vis, columns: 6, rows: 22 }],
        });

        const baseDocument = (widgets: string[]) => ({
            type: "dashboard",
            id: DASHBOARD_ID,
            title: "Existing dashboard",
            version: "3",
            sections: widgets.map(section),
        });

        const basePart = (widgets: string[] = ["chart1"]) => ({
            type: "dashboard",
            dashboard: baseDocument(widgets),
            saved_dashboard_id: DASHBOARD_ID,
            references: null,
        });

        const patchPart = (vis: string) => ({
            type: "dashboardPatch",
            patch: {
                dashboard_id: DASHBOARD_ID,
                operations: [{ op: "add", path: "/sections/-", value: section(vis) }],
                references: null,
            },
        });

        const makeItem = (parts: object[], itemIndex = 0): AiConversationItemResponse =>
            ({
                conversationId: "conv-1",
                itemIndex,
                itemId: `item-${itemIndex}`,
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: { type: "multipart", parts },
            }) as unknown as AiConversationItemResponse;

        const dashboardParts = (item: IChatConversationItem) =>
            (item.content as IChatConversationMultipartContent).parts.filter(
                (part): part is IChatConversationDashboardContent => part.type === "dashboard",
            );

        /** Ids of the visualizations the dashboard's widgets point at, in layout order. */
        const widgetVisualizations = (part: IChatConversationDashboardContent) =>
            (part.dashboard?.layout?.sections ?? []).flatMap((section) =>
                section.items.map((item) => {
                    const widget = item.widget as IInsightWidget;
                    return (widget?.insight as IdentifierRef)?.identifier;
                }),
            );

        it("applies a patch against the base sent as a sibling part in the same message", () => {
            const converted = convertChatConversationItemFromBackend(
                makeItem([{ type: "text", text: "Added it." }, basePart(), patchPart("chart2")]),
                [],
                [],
                dateNormalizer,
            )!;

            const parts = dashboardParts(converted);

            // The base part is folded into the patch: a single card, showing the patched draft.
            expect(parts).toHaveLength(1);
            expect(widgetVisualizations(parts[0]!)).toEqual(["chart1", "chart2"]);
        });

        it("does not offer the unchanged base dashboard as a card of its own", () => {
            const converted = convertChatConversationItemFromBackend(
                makeItem([basePart(), patchPart("chart2")]),
                [],
                [],
                dateNormalizer,
            )!;

            const unchanged = dashboardParts(converted).filter(
                (part) => widgetVisualizations(part).length === 1,
            );

            expect(unchanged).toEqual([]);
        });

        it("keeps a standalone dashboard part when no patch accompanies it", () => {
            const converted = convertChatConversationItemFromBackend(
                makeItem([basePart()]),
                [],
                [],
                dateNormalizer,
            )!;

            const parts = dashboardParts(converted);

            expect(parts).toHaveLength(1);
            expect(widgetVisualizations(parts[0]!)).toEqual(["chart1"]);
            expect(parts[0]!.saved).toBe(DASHBOARD_ID);
        });

        it("resolves the base from history for a follow-up patch that carries none", () => {
            const history: IChatConversationItem[] = [];

            const first = convertChatConversationItemFromBackend(
                makeItem([basePart(), patchPart("chart2")], 0),
                [],
                history,
                dateNormalizer,
            )!;
            history.push(first);

            const second = convertChatConversationItemFromBackend(
                makeItem([patchPart("chart3")], 1),
                [],
                history,
                dateNormalizer,
            )!;

            const parts = dashboardParts(second);

            expect(parts).toHaveLength(1);
            // The operations are defined against the relayed document, so the second proposal
            // rebases on the same base rather than on the result of the first one.
            expect(widgetVisualizations(parts[0]!)).toEqual(["chart1", "chart3"]);
        });

        it("rebases on a base resent in the current message rather than the one in history", () => {
            const history: IChatConversationItem[] = [];

            const first = convertChatConversationItemFromBackend(
                makeItem([basePart(), patchPart("chart2")], 0),
                [],
                history,
                dateNormalizer,
            )!;
            history.push(first);

            // The user edited the dashboard in between, so gen-ai relays the changed document.
            const second = convertChatConversationItemFromBackend(
                makeItem([basePart(["chart1", "edited"]), patchPart("chart3")], 1),
                [],
                history,
                dateNormalizer,
            )!;

            const parts = dashboardParts(second);

            expect(parts).toHaveLength(1);
            expect(widgetVisualizations(parts[0]!)).toEqual(["chart1", "edited", "chart3"]);
        });

        it("renders no dashboard card when a patch has no base to apply to", () => {
            const converted = convertChatConversationItemFromBackend(
                makeItem([patchPart("chart2")]),
                [],
                [],
                dateNormalizer,
            )!;

            const parts = dashboardParts(converted);

            expect(parts).toHaveLength(1);
            expect(parts[0]!.dashboard).toBeNull();
        });
    });
});
