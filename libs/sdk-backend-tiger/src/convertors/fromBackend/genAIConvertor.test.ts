// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type AiConversationItemResponse, type AiDashboardOutput } from "@gooddata/api-client-tiger";
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
    convertChatConversationInteractionStepFromBackend,
    convertChatConversationItemDetailFromBackend,
    convertChatConversationItemFromBackend,
    convertChatConversationItemsFromBackend,
    convertChatSuggestionItemFromBackend,
} from "./genAIConvertor.js";
import { REPORT_COPILOT_SAMPLE_PART } from "./reportCopilotSample.fixture.js";

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

    describe("report part", () => {
        it("converts a report part next to the text around it", () => {
            const item = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-id",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [{ type: "text", text: "Here is the report." }, REPORT_COPILOT_SAMPLE_PART],
                },
            } as unknown as AiConversationItemResponse;

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;

            const parts = (converted.content as IChatConversationMultipartContent).parts;
            expect(parts.map((part) => part.type)).toEqual(["text", "report"]);
            expect(parts[1]).toMatchObject({ type: "report", report: { title: "Top Customers — H2 2025" } });
        });
    });

    describe("compose answer detail", () => {
        it.each(["dashboard", "report"] as const)("keeps %s as the output the turn produced", (output) => {
            expect(
                convertChatConversationItemDetailFromBackend({ category: "composeAnswer", output }),
            ).toEqual({
                category: "composeAnswer",
                modelId: undefined,
                suggestedActions: undefined,
                output,
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

        const historyItem = (
            widgets: string[],
            insights: Array<{ identifier: string; title: string }>,
        ): IChatConversationItem =>
            ({
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: {
                                ref: {
                                    identifier: DASHBOARD_ID,
                                    type: "analyticalDashboard",
                                },
                            },
                            base: baseDocument(widgets),
                            references: {
                                visualizations: insights.map(({ identifier, title }) => ({
                                    id: identifier,
                                    type: "bar_chart",
                                    title,
                                    query: {
                                        fields: {},
                                    },
                                })),
                            },
                            insights: insights.map(({ identifier, title }) => ({
                                insight: {
                                    identifier,
                                    title,
                                },
                            })),
                        },
                    ],
                },
            }) as unknown as IChatConversationItem;

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

        it("collates insights from all related cards in history and keeps the latest duplicate", () => {
            const history: IChatConversationItem[] = [
                historyItem(
                    ["chart1"],
                    [
                        { identifier: "chart1", title: "Chart 1 (old)" },
                        { identifier: "chart2", title: "Chart 2" },
                    ],
                ),
                historyItem(["chart1"], [{ identifier: "chart1", title: "Chart 1 (new)" }]),
            ];

            const converted = convertChatConversationItemFromBackend(
                makeItem([patchPart("chart3")], 2),
                [],
                history,
                dateNormalizer,
            )!;

            const [part] = dashboardParts(converted);

            expect(widgetVisualizations(part!)).toEqual(["chart1", "chart3"]);
            expect(
                part!.insights?.map((insight) => [insight.insight.identifier, insight.insight.title]),
            ).toEqual([
                ["chart1", "Chart 1 (new)"],
                ["chart2", "Chart 2"],
            ]);
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

    describe("dashboard with tabs and filter contexts", () => {
        it("preserves individual filter context for each tab when multiple tabs have distinct filters", () => {
            const multiTabDashboard: AiDashboardOutput = {
                type: "dashboard",
                id: "multi_tab_dashboard",
                title: "Multi Tab Dashboard",
                version: "2",
                tabs: [
                    {
                        id: "tab_1",
                        title: "Tab 1",
                        sections: [],
                        filters: {
                            date_1: {
                                type: "date_filter",
                                granularity: "YEAR",
                                from: -1,
                                to: 0,
                            },
                        },
                    },
                    {
                        id: "tab_2",
                        title: "Tab 2",
                        sections: [],
                        filters: {
                            date_2: {
                                type: "date_filter",
                                granularity: "MONTH",
                                from: -3,
                                to: -1,
                            },
                        },
                    },
                ],
            };

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: multiTabDashboard,
                            saved_dashboard_id: "multi_tab_dashboard",
                            references: undefined,
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            expect(part.dashboard?.tabs).toHaveLength(2);
            expect(part.dashboard?.tabs?.[0]?.filterContext?.filters).toEqual([
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        granularity: "GDC.time.year",
                        from: -1,
                        to: 0,
                    }),
                }),
            ]);
            expect(part.dashboard?.tabs?.[1]?.filterContext?.filters).toEqual([
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        granularity: "GDC.time.month",
                        from: -3,
                        to: -1,
                    }),
                }),
            ]);
        });

        it("preserves individual filter context for each tab in dashboardPatch", () => {
            const multiTabDashboard: AiDashboardOutput = {
                type: "dashboard",
                id: "multi_tab_dashboard",
                title: "Multi Tab Dashboard",
                version: "2",
                tabs: [
                    {
                        id: "tab_1",
                        title: "Tab 1",
                        sections: [],
                        filters: {
                            date_1: {
                                type: "date_filter",
                                granularity: "YEAR",
                                from: -1,
                                to: 0,
                            },
                        },
                    },
                    {
                        id: "tab_2",
                        title: "Tab 2",
                        sections: [],
                        filters: {
                            date_2: {
                                type: "date_filter",
                                granularity: "MONTH",
                                from: -3,
                                to: -1,
                            },
                        },
                    },
                ],
            };

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: multiTabDashboard,
                            saved_dashboard_id: "multi_tab_dashboard",
                            references: undefined,
                        },
                        {
                            type: "dashboardPatch",
                            patch: {
                                dashboard_id: "multi_tab_dashboard",
                                operations: [
                                    {
                                        op: "add",
                                        path: "/tabs/0/title",
                                        value: "Updated Tab 1",
                                    },
                                ],
                                references: undefined,
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            expect(part.dashboard?.tabs).toHaveLength(2);
            expect(part.dashboard?.tabs?.[0]?.title).toBe("Updated Tab 1");
            expect(part.dashboard?.tabs?.[0]?.filterContext?.filters).toEqual([
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        granularity: "GDC.time.year",
                        from: -1,
                        to: 0,
                    }),
                }),
            ]);
            expect(part.dashboard?.tabs?.[1]?.filterContext?.filters).toEqual([
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        granularity: "GDC.time.month",
                        from: -3,
                        to: -1,
                    }),
                }),
            ]);
        });

        it("correctly converts single-tab dashboard without tab filter context override issues", () => {
            const singleTabDashboard: AiDashboardOutput = {
                type: "dashboard",
                id: "single_tab_dashboard",
                title: "Single Tab Dashboard",
                version: "2",
                filters: {
                    date_1: {
                        type: "date_filter",
                        granularity: "YEAR",
                        from: -1,
                        to: 0,
                    },
                },
                sections: [],
            };

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: singleTabDashboard,
                            saved_dashboard_id: "single_tab_dashboard",
                            references: undefined,
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            expect(part.dashboard?.filterContext?.filters).toEqual([
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        granularity: "GDC.time.year",
                        from: -1,
                        to: 0,
                    }),
                }),
            ]);
        });
    });

    describe("dashboard with references and interactions", () => {
        it("preserves widget interactions and inherits titles from references in dashboard part", () => {
            const dashboardWithInteractions = {
                type: "dashboard",
                id: "dash_with_interactions",
                title: "Dashboard with Interactions",
                version: "2",
                sections: [
                    {
                        widgets: [
                            {
                                visualization: "chart_revenue",
                                interactions: [
                                    {
                                        click_on: "m1",
                                        open_visualization: "chart_detail",
                                    },
                                    {
                                        click_on: "a1",
                                        open_dashboard: "dash_target",
                                        open_dashboard_tab: "tab_2",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as unknown as AiDashboardOutput;

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: dashboardWithInteractions,
                            saved_dashboard_id: "dash_with_interactions",
                            references: {
                                visualizations: [
                                    {
                                        type: "bar_chart",
                                        id: "chart_revenue",
                                        title: "Revenue by Region",
                                        query: {
                                            fields: {
                                                m1: { using: "metric/revenue" },
                                                a1: { using: "attribute/region" },
                                            },
                                        },
                                    },
                                    {
                                        type: "line_chart",
                                        id: "chart_detail",
                                        title: "Detail Chart",
                                        query: {
                                            fields: {
                                                m1: { using: "metric/revenue" },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            const widget = part.dashboard?.layout?.sections[0]?.items[0]?.widget as IInsightWidget;
            expect(widget).toBeDefined();
            expect(widget.title).toBe("Revenue by Region");
            expect(widget.drills).toEqual([
                expect.objectContaining({
                    type: "drillToInsight",
                    transition: "pop-up",
                    target: { identifier: "chart_detail", type: "insight" },
                    origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
                }),
                expect.objectContaining({
                    type: "drillToDashboard",
                    transition: "in-place",
                    target: { identifier: "dash_target", type: "analyticalDashboard" },
                    targetTabLocalIdentifier: "tab_2",
                    origin: { type: "drillFromAttribute", attribute: { localIdentifier: "a1" } },
                }),
            ]);
            expect(part.insights).toHaveLength(2);
            expect(part.insights?.map((i) => i.insight.title)).toEqual(["Revenue by Region", "Detail Chart"]);
        });

        it("preserves widget interactions and inherits titles from new_visualizations in dashboard part", () => {
            const dashboardWithInteractions = {
                type: "dashboard",
                id: "dash_with_new_vis",
                title: "Dashboard with New Vis",
                version: "2",
                sections: [
                    {
                        widgets: [
                            {
                                visualization: "new_chart_1",
                                interactions: [
                                    {
                                        click_on: "m1",
                                        open_visualization: "new_chart_2",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as unknown as AiDashboardOutput;

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: dashboardWithInteractions,
                            saved_dashboard_id: null,
                            references: {
                                new_visualizations: [
                                    {
                                        type: "bar_chart",
                                        id: "new_chart_1",
                                        title: "New Draft Chart 1",
                                        query: {
                                            fields: {
                                                m1: { using: "metric/revenue" },
                                            },
                                        },
                                    },
                                    {
                                        type: "column_chart",
                                        id: "new_chart_2",
                                        title: "New Draft Chart 2",
                                        query: {
                                            fields: {
                                                m1: { using: "metric/revenue" },
                                            },
                                        },
                                    },
                                ],
                                visualizations: [],
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            const widget = part.dashboard?.layout?.sections[0]?.items[0]?.widget as IInsightWidget;
            expect(widget).toBeDefined();
            expect(widget.title).toBe("New Draft Chart 1");
            expect(widget.drills).toEqual([
                expect.objectContaining({
                    type: "drillToInsight",
                    transition: "pop-up",
                    target: { identifier: "new_chart_2", type: "insight" },
                    origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
                }),
            ]);
            expect(part.insights).toHaveLength(2);
            expect(part.insights?.every((i) => i.insight.isDraft)).toBe(true);
        });

        it("preserves widget interactions when applying a dashboardPatch with references", () => {
            const baseDashboard: AiDashboardOutput = {
                type: "dashboard",
                id: "dash_patch_interactions",
                title: "Base Dashboard",
                version: "2",
                sections: [],
            };

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: baseDashboard,
                            saved_dashboard_id: "dash_patch_interactions",
                            references: undefined,
                        },
                        {
                            type: "dashboardPatch",
                            patch: {
                                dashboard_id: "dash_patch_interactions",
                                operations: [
                                    {
                                        op: "add",
                                        path: "/sections/0",
                                        value: {
                                            widgets: [
                                                {
                                                    visualization: "chart_patched",
                                                    interactions: [
                                                        {
                                                            click_on: "m1",
                                                            open_visualization: "chart_target",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                                references: {
                                    visualizations: [
                                        {
                                            type: "bar_chart",
                                            id: "chart_patched",
                                            title: "Patched Chart",
                                            query: {
                                                fields: {
                                                    m1: { using: "metric/revenue" },
                                                },
                                            },
                                        },
                                        {
                                            type: "bar_chart",
                                            id: "chart_target",
                                            title: "Target Chart",
                                            query: {
                                                fields: {
                                                    m1: { using: "metric/revenue" },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            const widget = part.dashboard?.layout?.sections[0]?.items[0]?.widget as IInsightWidget;
            expect(widget).toBeDefined();
            expect(widget.title).toBe("Patched Chart");
            expect(widget.drills).toEqual([
                expect.objectContaining({
                    type: "drillToInsight",
                    transition: "pop-up",
                    target: { identifier: "chart_target", type: "insight" },
                    origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
                }),
            ]);
        });
    });

    describe("convertChatConversationItemDetailFromBackend", () => {
        it("converts applyMemory detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "applyMemory",
                durationMs: 120,
                items: [
                    { title: "Pref 1", strategy: "ALWAYS", score: 0.95 },
                    { title: "Pref 2", strategy: "AUTO" as any, score: 0.8 },
                ],
            });

            expect(result).toEqual({
                category: "applyMemory",
                durationMs: 120,
                items: [
                    { title: "Pref 1", strategy: "always", score: 0.95 },
                    { title: "Pref 2", strategy: "auto", score: 0.8 },
                ],
            });
        });

        it("converts catalogSearch detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "catalogSearch",
                query: ["revenue", "region"],
                requestedTypes: ["metric", "attribute"],
                found: [{ objectType: "metric", titles: ["Revenue", "Profit"] }],
                used: [{ objectType: "metric", title: "Revenue", score: 0.95 }],
            });

            expect(result).toEqual({
                category: "catalogSearch",
                query: ["revenue", "region"],
                requestedTypes: ["metric", "attribute"],
                found: [{ objectType: "metric", titles: ["Revenue", "Profit"] }],
                used: [{ objectType: "metric", title: "Revenue", score: 0.95 }],
            });
        });

        it("converts composeAnswer detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "composeAnswer",
                modelId: "gpt-4o",
                suggestedActions: 2,
                output: "text",
            });

            expect(result).toEqual({
                category: "composeAnswer",
                modelId: "gpt-4o",
                suggestedActions: 2,
                output: "text",
            });
        });

        it("converts knowledgeSearch detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "knowledgeSearch",
                query: "how to calculate MRR",
                documents: [{ title: "MRR Doc", score: 0.99 }],
                bestMatch: "MRR Doc",
            });

            expect(result).toEqual({
                category: "knowledgeSearch",
                query: "how to calculate MRR",
                documents: [{ title: "MRR Doc", score: 0.99 }],
                bestMatch: "MRR Doc",
            });
        });

        it("converts metricQuery detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "metricQuery",
                ref: "metric/revenue",
                metrics: ["revenue"],
                groupedBy: ["region"],
                filteredBy: ["year=2024"],
                visualization: "bar_chart",
                resultRows: 10,
                resultColumns: 2,
            });

            expect(result).toEqual({
                category: "metricQuery",
                ref: "metric/revenue",
                metrics: ["revenue"],
                groupedBy: ["region"],
                filteredBy: ["year=2024"],
                visualization: "bar_chart",
                resultRows: 10,
                resultColumns: 2,
            });
        });

        it("converts skillRouting detail", () => {
            const result = convertChatConversationItemDetailFromBackend({
                category: "skillRouting",
                available: ["dashboard", "kda"],
                activated: ["dashboard"],
            });

            expect(result).toEqual({
                category: "skillRouting",
                available: ["dashboard", "kda"],
                activated: ["dashboard"],
            });
        });

        it("returns undefined for unknown or empty category", () => {
            expect(convertChatConversationItemDetailFromBackend(null)).toBeUndefined();
            expect(convertChatConversationItemDetailFromBackend(undefined)).toBeUndefined();
            expect(
                convertChatConversationItemDetailFromBackend({ category: "unknownCategory" as any }),
            ).toBeUndefined();
        });
    });

    describe("convertChatConversationInteractionStepFromBackend", () => {
        it("converts interaction step with tokens and traceId", () => {
            const step = convertChatConversationInteractionStepFromBackend(
                {
                    stepId: "step-1",
                    conversationId: "conv-1",
                    responseId: "resp-1",
                    stepIndex: 1,
                    durationMs: 340,
                    tokens: {
                        input: 100,
                        output: 50,
                        total: 150,
                    },
                    createdAt: "2024-01-01T12:00:00Z",
                },
                "trace-step-123",
            );

            expect(step).toEqual({
                type: "interaction_step",
                stepId: "step-1",
                conversationId: "conv-1",
                responseId: "resp-1",
                stepIndex: 1,
                durationMs: 340,
                tokens: {
                    input: 100,
                    output: 50,
                    total: 150,
                },
                createdAt: new Date("2024-01-01T12:00:00Z").getTime(),
                traceId: "trace-step-123",
            });
        });
    });

    describe("convertChatConversationItemFromBackend content types and metadata", () => {
        it("converts reasoning content", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "reasoning",
                    summary: "Reasoning summary text",
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            expect(converted.content).toEqual({
                type: "reasoning",
                summary: "Reasoning summary text",
            });
        });

        it("converts toolCall content", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "toolCall",
                    id: "tool-id-1",
                    callId: "call-id-1",
                    name: "executeMaql",
                    arguments: { maql: "SELECT 1" },
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            expect(converted.content).toEqual({
                type: "toolCall",
                id: "tool-id-1",
                callId: "call-id-1",
                name: "executeMaql",
                arguments: { maql: "SELECT 1" },
            });
        });

        it("converts clarifyingQuestions multipart part", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "clarifyingQuestions",
                            questions: [
                                {
                                    text: "Which metric do you mean?",
                                    control: { options: [{ text: "Net Sales" }, { text: "Gross Profit" }] },
                                },
                            ],
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            expect((converted.content as IChatConversationMultipartContent).parts).toEqual([
                {
                    type: "clarifyingQuestions",
                    questions: [
                        {
                            text: "Which metric do you mean?",
                            control: { options: [{ text: "Net Sales" }, { text: "Gross Profit" }] },
                        },
                    ],
                },
            ]);
        });

        it("converts alertProposal multipart part", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "alertProposal",
                            alertProposal: {
                                title: "High Revenue Alert",
                                description: "Triggered when revenue exceeds threshold",
                                alert: {
                                    execution: {
                                        execution: {
                                            offset: [0, 0],
                                            size: [100, 100],
                                            result: "res-1",
                                        },
                                    },
                                    threshold: 100000,
                                    comparison: {
                                        operator: "GREATER_THAN",
                                        values: [100000],
                                    },
                                } as any,
                                schedule: {
                                    cron: "0 9 * * 1",
                                    timezone: "UTC",
                                },
                                notificationChannel: {
                                    id: "channel-1",
                                    name: "Slack Alerts",
                                },
                                automationId: "auto-1",
                                dashboard: {
                                    id: "dash-1",
                                    title: "Sales Dashboard",
                                },
                                recipients: [
                                    {
                                        id: "user-1",
                                        label: "Alice",
                                        email: "alice@example.com",
                                    },
                                ],
                                cta: "View Dashboard",
                                forLabel: "Sales",
                                forMode: "live",
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent).parts;
            expect(part.type).toBe("alertProposal");
            if (part.type === "alertProposal") {
                expect(part.alertProposal?.title).toBe("High Revenue Alert");
                expect(part.alertProposal?.schedule).toEqual({ cron: "0 9 * * 1", timezone: "UTC" });
                expect(part.alertProposal?.notificationChannel).toBe("channel-1");
                expect(part.alertProposal?.notificationChannelTitle).toBe("Slack Alerts");
                expect(part.alertProposal?.id).toBe("auto-1");
                expect(part.alertProposal?.dashboard).toEqual({ id: "dash-1", title: "Sales Dashboard" });
                expect(part.alertProposal?.recipients).toEqual([
                    { type: "user", id: "user-1", name: "Alice", email: "alice@example.com" },
                ]);
                expect(part.alertProposal?.cta).toBe("View Dashboard");
                expect(part.alertProposal?.forLabel).toBe("Sales");
                expect(part.alertProposal?.forMode).toBe("live");
            }
        });

        it("converts kda multipart part", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "kda",
                            kda: {
                                dateAttributeId: "dt.year",
                                measure: {
                                    id: "m_revenue",
                                    type: "metric",
                                    aggregation: "SUM",
                                },
                                analyzedPeriod: { from: "2024-01-01", to: "2024-12-31" } as any,
                                referencePeriod: { from: "2023-01-01", to: "2023-12-31" } as any,
                                filters: [],
                            },
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent).parts;
            expect(part.type).toBe("kda");
            if (part.type === "kda") {
                expect(part.kda).toBeDefined();
                expect(part.kda?.measure).toBeDefined();
                expect(part.kda?.dateAttribute).toBeDefined();
            }
        });

        it("converts item metadata: agentId, oldAgentId, reasoningEffort, stepId, replyTo, and matches feedback", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                responseId: "resp-123",
                replyTo: "item-0",
                stepId: "step-1",
                newAgentId: "agent-new",
                oldAgentId: "agent-old",
                reasoningEffort: "HIGH",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "text",
                    text: "Hello",
                },
            };

            const responses = [
                {
                    responseId: "resp-123",
                    createdAt: "2024-01-01T00:01:00Z",
                    updatedAt: "2024-01-01T00:02:00Z",
                    feedback: {
                        type: "POSITIVE" as const,
                        text: "Great answer!",
                    },
                },
            ];

            const converted = convertChatConversationItemFromBackend(item, responses, [], dateNormalizer)!;
            expect(converted.agentId).toBe("agent-new");
            expect(converted.oldAgentId).toBe("agent-old");
            expect(converted.reasoningEffort).toBe("HIGH");
            expect(converted.stepId).toBe("step-1");
            expect(converted.replyTo).toBe("item-0");
            expect(converted.feedback).toEqual({
                type: "feedback",
                feedback: "POSITIVE",
                text: "Great answer!",
                createdAt: new Date("2024-01-01T00:01:00Z").getTime(),
                updatedAt: new Date("2024-01-01T00:02:00Z").getTime(),
            });
        });

        it("converts searchRelationships", () => {
            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "searchResults",
                            keywords: ["sales"],
                            objects: [],
                            relationships: [
                                {
                                    sourceWorkspaceId: "ws-1",
                                    sourceId: "src-1",
                                    sourceType: "dashboard",
                                    sourceTitle: "Source Dash",
                                    targetWorkspaceId: "ws-2",
                                    targetId: "tgt-1",
                                    targetType: "visualization",
                                    targetTitle: "Target Vis",
                                },
                            ],
                        },
                    ],
                },
            };

            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            const [part] = (converted.content as IChatConversationMultipartContent).parts;
            if (isChatConversationSearchContent(part)) {
                expect(part.relationships).toEqual([
                    {
                        sourceWorkspaceId: "ws-1",
                        sourceObjectId: "src-1",
                        sourceObjectType: "dashboard",
                        sourceObjectTitle: "Source Dash",
                        targetWorkspaceId: "ws-2",
                        targetObjectId: "tgt-1",
                        targetObjectType: "visualization",
                        targetObjectTitle: "Target Vis",
                    },
                ]);
            }
        });

        it("convertChatConversationItemsFromBackend converts and accumulates items in history", () => {
            const items: AiConversationItemResponse[] = [
                {
                    conversationId: "conv-1",
                    itemIndex: 0,
                    itemId: "item-0",
                    role: "user",
                    createdAt: "2024-01-01T00:00:00Z",
                    content: { type: "text", text: "User prompt" },
                },
                {
                    conversationId: "conv-1",
                    itemIndex: 1,
                    itemId: "item-1",
                    role: "assistant",
                    createdAt: "2024-01-01T00:01:00Z",
                    content: { type: "text", text: "Assistant reply" },
                },
            ];

            const converted = convertChatConversationItemsFromBackend(items, [], dateNormalizer);
            expect(converted).toHaveLength(2);
            expect(converted[0].id).toBe("item-0");
            expect(converted[1].id).toBe("item-1");
        });
    });

    describe("dashboardPatch error handling and multi-turn reference collation", () => {
        it("captures patch error when JSON patch operation is invalid", () => {
            const baseDashboard: AiDashboardOutput = {
                type: "dashboard",
                id: "dash_error_test",
                title: "Base Dashboard",
                version: "2",
                sections: [],
            };

            const item: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: baseDashboard,
                            saved_dashboard_id: "dash_error_test",
                            references: undefined,
                        },
                        {
                            type: "dashboardPatch",
                            patch: {
                                dashboard_id: "dash_error_test",
                                operations: [
                                    {
                                        op: "test",
                                        path: "/non_existing_path",
                                        value: "invalid",
                                    },
                                ],
                                references: undefined,
                            },
                        },
                    ],
                },
            };

            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const converted = convertChatConversationItemFromBackend(item, [], [], dateNormalizer)!;
            consoleErrorSpy.mockRestore();

            const [part] = (converted.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            expect(part.dashboard).toBeNull();
            expect(part.insights).toBeNull();
            expect(part.patchError).toBeDefined();
        });

        it("collates references across multiple sequential patches in a multi-turn conversation", () => {
            const baseDashboard = {
                type: "dashboard",
                id: "dash_multi_turn",
                title: "Base Dashboard",
                version: "2",
                sections: [
                    {
                        widgets: [{ visualization: "chart_0", title: "Chart 0" }],
                    },
                ],
            } as unknown as AiDashboardOutput;

            const history: IChatConversationItem[] = [];

            // Turn 1: base + patch 1 adding chart 1
            const item1: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 0,
                itemId: "item-0",
                role: "assistant",
                createdAt: "2024-01-01T00:00:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboard",
                            dashboard: baseDashboard,
                            saved_dashboard_id: "dash_multi_turn",
                            references: undefined,
                        },
                        {
                            type: "dashboardPatch",
                            patch: {
                                dashboard_id: "dash_multi_turn",
                                operations: [
                                    {
                                        op: "add",
                                        path: "/sections/0/widgets/1",
                                        value: { visualization: "chart_1", title: "Chart 1" },
                                    },
                                ],
                                references: {
                                    visualizations: [
                                        {
                                            type: "bar_chart",
                                            id: "chart_1",
                                            title: "Chart 1",
                                            query: { fields: {} },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            };

            const converted1 = convertChatConversationItemFromBackend(item1, [], history, dateNormalizer)!;
            history.push(converted1);

            // Turn 2: patch 2 adding chart 2, relying on history
            const item2: AiConversationItemResponse = {
                conversationId: "conv-1",
                itemIndex: 1,
                itemId: "item-1",
                role: "assistant",
                createdAt: "2024-01-01T00:01:00Z",
                content: {
                    type: "multipart",
                    parts: [
                        {
                            type: "dashboardPatch",
                            patch: {
                                dashboard_id: "dash_multi_turn",
                                operations: [
                                    {
                                        op: "add",
                                        path: "/sections/0/widgets/1",
                                        value: { visualization: "chart_2", title: "Chart 2" },
                                    },
                                ],
                                references: {
                                    visualizations: [
                                        {
                                            type: "bar_chart",
                                            id: "chart_2",
                                            title: "Chart 2",
                                            query: { fields: {} },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            };

            const converted2 = convertChatConversationItemFromBackend(item2, [], history, dateNormalizer)!;
            const [part2] = (converted2.content as IChatConversationMultipartContent)
                .parts as IChatConversationDashboardContent[];

            expect(part2.insights).toHaveLength(2);
            expect(part2.insights?.map((i) => i.insight.identifier)).toEqual(["chart_1", "chart_2"]);
        });
    });
});
