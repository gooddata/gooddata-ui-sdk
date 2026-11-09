// (C) 2026 GoodData Corporation

import { type AxiosProgressEvent, type AxiosPromise } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    GenAiApi_PostConversations,
    GenAiApi_PostMessages,
    GenAiApi_SwitchAgent,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import {
    type GenAIPublisherDocumentFormat,
    type IChatConversationThreadQuery,
} from "@gooddata/sdk-backend-spi";
import {
    publisherDocumentDefinitionToYaml,
    publisherDocumentDefinitionToYamlV2,
} from "@gooddata/sdk-code-convertors";
import {
    type FilterContextItem,
    type IDashboardDefinition,
    type IDashboardFilterGroupsConfig,
    type IFilterContext,
    type IFilterContextDefinition,
    type IGenAIDashboardLiveFilters,
    type IGenAIUserContext,
    type IPublisherDocumentDefinition,
    type ITempFilterContext,
    type PublisherSlot,
    idRef,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import type { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { absolutePeriodDocumentV2 } from "../../../convertors/fromBackend/publisherV2.fixture.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import {
    type ChatConversationThreadQuery as ChatConversationThreadQueryClass,
    type ChatConversationsService as ChatConversationsServiceClass,
} from "./ChatConversations.js";

vi.mock("@gooddata/api-client-tiger/endpoints/genAI", () => ({
    GenAiApi_DeleteConversation: vi.fn(),
    GenAiApi_GetConversation: vi.fn(),
    GenAiApi_GetConversationItems: vi.fn(),
    GenAiApi_GetConversationResponses: vi.fn(),
    GenAiApi_GetConversations: vi.fn(),
    GenAiApi_PatchConversation: vi.fn(),
    GenAiApi_PostConversationFeedback: vi.fn(),
    GenAiApi_PatchReport: vi.fn(),
    GenAiApi_PatchVisualization: vi.fn(),
    GenAiApi_PostConversations: vi.fn(),
    GenAiApi_PostGenerateConversationTitle: vi.fn(),
    GenAiApi_PostMessages: vi.fn(),
    GenAiApi_SwitchAgent: vi.fn(),
}));

// The units under test are imported dynamically from a fresh module registry so that they pick up
// the endpoint mock above even when another (non-isolated) test file already imported them without
// the mock.
let ChatConversationThreadQuery: typeof ChatConversationThreadQueryClass;
let ChatConversationsService: typeof ChatConversationsServiceClass;

beforeAll(async () => {
    vi.resetModules();
    ({ ChatConversationThreadQuery, ChatConversationsService } = await import("./ChatConversations.js"));
});

describe("ChatConversationsService.create", () => {
    const dateNormalizer: DateNormalizer = (value) => value ?? "";
    const authCall = vi.fn(async (callback) =>
        callback({
            axios: {},
            basePath: "",
        }),
    ) as TigerAuthenticatedCallGuard;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(GenAiApi_PostConversations).mockResolvedValue({
            data: {
                conversationId: "conversation",
                createdAt: "2026-01-01T00:00:00Z",
                lastActivityAt: "2026-01-01T00:00:00Z",
                pinned: false,
                agentId: "agent-1",
            },
        } as unknown as Awaited<AxiosPromise>);
    });

    it("should send agent id when creating a conversation for a selected agent", async () => {
        const service = new ChatConversationsService(authCall, "workspace", dateNormalizer);

        const conversation = await service.create({ agentId: "agent-1" });

        expect(vi.mocked(GenAiApi_PostConversations).mock.calls[0][2]).toEqual({
            workspaceId: "workspace",
            aiCreateConversationRequest: {
                agentId: "agent-1",
            },
        });
        expect(conversation.agentId).toBe("agent-1");
    });

    it("should switch the agent for an existing conversation", async () => {
        vi.mocked(GenAiApi_SwitchAgent).mockResolvedValue({
            data: {
                conversationId: "conversation",
                createdAt: "2026-01-01T00:00:00Z",
                lastActivityAt: "2026-01-01T00:00:00Z",
                pinned: false,
                agentId: "agent-2",
            },
        } as unknown as Awaited<AxiosPromise>);
        const service = new ChatConversationsService(authCall, "workspace", dateNormalizer);

        const conversation = await service.switchAgent("conversation", "agent-2");

        expect(vi.mocked(GenAiApi_SwitchAgent).mock.calls[0][2]).toEqual({
            workspaceId: "workspace",
            conversationId: "conversation",
            aiSwitchAgentRequest: {
                agentId: "agent-2",
            },
        });
        expect(conversation.agentId).toBe("agent-2");
    });
});

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

    it("should send clarifying answers as structured message content", async () => {
        vi.mocked(GenAiApi_PostMessages).mockResolvedValue({
            headers: {},
            data: {},
        } as unknown as Awaited<AxiosPromise>);
        const clarifyingAnswers = {
            type: "clarifyingAnswers" as const,
            questionsItemId: "questions-item-id",
            answers: [
                {
                    questionIndex: 1,
                    questionText: "Which region?",
                    answer: {
                        type: "singleChoice" as const,
                        optionIndex: 0,
                        optionText: "East",
                    },
                },
            ],
        };
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: clarifyingAnswers,
        });

        const reader = query.stream([]).getReader();
        await reader.read();

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        expect(request.aiSendMessageRequest.item).toEqual({
            role: "user",
            content: clarifyingAnswers,
        });
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
            documentFormat: "aac-v1",
            userQuestion: "Hello",
        });

        const reader = query.stream([]).getReader();

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

    it("should error the stream without an unhandled rejection when the request fails", async () => {
        const requestError = new Error("Network Error");
        vi.mocked(GenAiApi_PostMessages).mockRejectedValue(requestError);
        const unhandledRejections: unknown[] = [];
        const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);
        process.on("unhandledRejection", onUnhandledRejection);

        try {
            const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
                workspaceId: "workspace",
                conversationId: "conversation",
                documentFormat: "aac-v1",
                userQuestion: "Hello",
            });

            const reader = query.stream([]).getReader();

            await expect(reader.read()).rejects.toBe(requestError);
            // Unhandled rejections are reported only after the microtask queue drains.
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(unhandledRejections).toEqual([]);
        } finally {
            process.off("unhandledRejection", onUnhandledRejection);
        }
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

    const createPersistedFilterContext = (identifier: string): IFilterContext => {
        return {
            ref: idRef(identifier, "filterContext"),
            identifier,
            uri: `/gdc/md/workspace/obj/${identifier}`,
            title: `${identifier} title`,
            description: `${identifier} description`,
            filters: [
                newRelativeDashboardDateFilter(
                    "GDC.time.month",
                    -1,
                    0,
                    idRef(`${identifier}.dataset`, "dataSet"),
                ),
            ],
        };
    };

    const createTempFilterContext = (identifier: string): ITempFilterContext => {
        return {
            created: "2026-01-01 00:00:00",
            ref: idRef(identifier, "filterContext"),
            uri: `/gdc/internal/temp/filterContexts/${identifier}`,
            filters: [
                newRelativeDashboardDateFilter(
                    "GDC.time.month",
                    -1,
                    0,
                    idRef(`${identifier}.dataset`, "dataSet"),
                ),
            ],
        };
    };

    const createFilterContextDefinition = (identifier = "definition"): IFilterContextDefinition => {
        return {
            title: "Filter context definition",
            description: "Filter context description",
            filters: [
                newRelativeDashboardDateFilter(
                    "GDC.time.month",
                    -1,
                    0,
                    idRef(`${identifier}.dataset`, "dataSet"),
                ),
            ],
        };
    };

    const emptyLayout: IDashboardDefinition["layout"] = {
        type: "IDashboardLayout",
        sections: [{ type: "IDashboardLayoutSection", items: [] }],
    };

    const createDashboardDefinition = (
        rootFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
        tabFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
        withTabs = true,
    ): IDashboardDefinition => {
        return {
            type: "IDashboard",
            identifier: "dashboard-1",
            title: "Dashboard",
            description: "Dashboard description",
            tags: [],
            shareStatus: "shared",
            layout: emptyLayout,
            ...(rootFilterContext ? { filterContext: rootFilterContext } : {}),
            ...(withTabs
                ? {
                      tabs: [
                          {
                              localIdentifier: "tab-1",
                              title: "Tab 1",
                              layout: emptyLayout,
                              ...(tabFilterContext ? { filterContext: tabFilterContext } : {}),
                          },
                      ],
                  }
                : {}),
        } as unknown as IDashboardDefinition;
    };

    it("should send richText widget content in the dashboard view context", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
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

        query.stream([]);

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

    it("should send the active id and all child ids for a visualization switcher", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [
                            {
                                title: "Sales",
                                widgetRef: idRef("switcher-1", "analyticalDashboard"),
                                widgetType: "visualizationSwitcher",
                                insightRef: idRef("vis-active", "insight"),
                                visualizations: [
                                    {
                                        title: "Active",
                                        widgetRef: idRef("switcher-1", "analyticalDashboard"),
                                        widgetType: "insight",
                                        insightRef: idRef("vis-active", "insight"),
                                        resultId: "result-active",
                                    },
                                    {
                                        title: "Others",
                                        widgetRef: idRef("switcher-1", "analyticalDashboard"),
                                        widgetType: "insight",
                                        insightRef: idRef("vis-other", "insight"),
                                        resultId: "result-active",
                                    },
                                ],
                                resultId: "result-active",
                            },
                        ],
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const widget = request.aiSendMessageRequest.userContext?.view?.dashboard?.widgets?.[0];
        expect(widget).toMatchObject({
            widgetType: "visualizationSwitcher",
            activeVisualizationId: "vis-active",
            visualizationIds: ["vis-active", "vis-other"],
            resultId: "result-active",
        });
    });

    it("should preserve empty-string richText content rather than dropping it", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
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

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const widget = request.aiSendMessageRequest.userContext?.view?.dashboard?.widgets?.[0];
        expect(widget).toHaveProperty("content", "");
    });

    it("should send the active tab id when the dashboard has tabs", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        activeTabId: "tab-2",
                        widgets: [],
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const dashboard = request.aiSendMessageRequest.userContext?.view?.dashboard;
        expect(dashboard).toHaveProperty("activeTabId", "tab-2");
    });

    it("should omit the active tab id when the dashboard has no tabs", async () => {
        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const dashboard = request.aiSendMessageRequest.userContext?.view?.dashboard;
        expect(dashboard).not.toHaveProperty("activeTabId");
    });

    it("should include persisted root filter context in dashboard definition payload", async () => {
        const rootFilterContext = createPersistedFilterContext("root-filter-context");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, undefined, false),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            filters?: Record<string, unknown>;
        };

        expect(Object.keys(parsedDefinition.filters ?? {})).toHaveLength(1);
        expect(Object.keys(parsedDefinition.filters ?? {})[0]).toContain(
            "root-filter-context.dataset_0_dateFilter",
        );
    });

    it("should include persisted tab filter context in dashboard definition payload", async () => {
        const rootFilterContext = createPersistedFilterContext("root-filter-context");
        const tabFilterContext = createPersistedFilterContext("tab-filter-context");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, tabFilterContext),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            tabs?: Array<{
                filters?: Record<string, unknown>;
            }>;
        };

        expect(Object.keys(parsedDefinition.tabs?.[0]?.filters ?? {})).toHaveLength(1);
        expect(Object.keys(parsedDefinition.tabs?.[0]?.filters ?? {})[0]).toContain(
            "tab-filter-context.dataset_0_dateFilter",
        );
    });

    it("should skip temporary tab filter contexts in dashboard definition payload", async () => {
        const rootFilterContext = createPersistedFilterContext("root-filter-context");
        const tabFilterContext = createTempFilterContext("temp-tab-filter-context");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, tabFilterContext),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            tabs?: Array<{
                filters?: {
                    items?: unknown[];
                };
            }>;
        };

        expect(parsedDefinition.tabs?.[0]?.filters).toBeUndefined();
    });

    it("should include root filter context definition without ref in dashboard definition payload", async () => {
        const rootFilterContext = createFilterContextDefinition("root-def");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, undefined, false),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            filters?: Record<string, unknown>;
        };

        expect(Object.keys(parsedDefinition.filters ?? {})).toHaveLength(1);
        expect(Object.keys(parsedDefinition.filters ?? {})[0]).toContain("root-def.dataset_0_dateFilter");
    });

    it("should include tab filter context definition without ref in dashboard definition payload", async () => {
        const rootFilterContext = createPersistedFilterContext("root-filter-context");
        const tabFilterContext = createFilterContextDefinition("tab-def");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, tabFilterContext),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            tabs?: Array<{
                filters?: Record<string, unknown>;
            }>;
        };

        expect(Object.keys(parsedDefinition.tabs?.[0]?.filters ?? {})).toHaveLength(1);
        expect(Object.keys(parsedDefinition.tabs?.[0]?.filters ?? {})[0]).toContain(
            "tab-def.dataset_0_dateFilter",
        );
    });

    it("should skip temporary root filter contexts in dashboard definition payload", async () => {
        const rootFilterContext = createTempFilterContext("temp-root-filter-context");

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition: createDashboardDefinition(rootFilterContext, undefined, false),
                    },
                },
            },
        });

        query.stream([]);

        const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
        const parsedDefinition = request.aiSendMessageRequest.userContext?.view?.dashboard?.definition as {
            filters?: Record<string, unknown>;
        };

        expect(parsedDefinition.filters).toBeUndefined();
    });

    it("should not mutate original dashboard definition or its filter contexts", async () => {
        const rootFilterContext = createFilterContextDefinition("root-def");
        const tabFilterContext = createFilterContextDefinition("tab-def");
        const definition = createDashboardDefinition(rootFilterContext, tabFilterContext);
        const originalDefinitionSnapshot = JSON.parse(JSON.stringify(definition));

        const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
            workspaceId: "workspace",
            conversationId: "conversation",
            documentFormat: "aac-v1",
            userQuestion: "Summarize",
            userContext: {
                view: {
                    dashboard: {
                        ref: idRef("dashboard-1", "analyticalDashboard"),
                        widgets: [],
                        definition,
                    },
                },
            },
        });

        query.stream([]);

        expect(definition).toEqual(originalDefinitionSnapshot);
        expect((definition.filterContext as any)?.ref).toBeUndefined();
        expect((definition.tabs?.[0].filterContext as any)?.ref).toBeUndefined();
    });

    describe("view filters", () => {
        const regionFilter = (values: string[], localIdentifier = "region_filter"): FilterContextItem => ({
            attributeFilter: {
                displayForm: idRef("label.region", "displayForm"),
                negativeSelection: values.length === 0,
                attributeElements: { values },
                localIdentifier,
            },
        });

        const countryFilter = (values: string[]): FilterContextItem => ({
            attributeFilter: {
                displayForm: idRef("label.country", "displayForm"),
                negativeSelection: values.length === 0,
                attributeElements: { values },
                localIdentifier: "country_filter",
            },
        });

        const flatDashboard = (filters: FilterContextItem[]) =>
            createDashboardDefinition({ ...createFilterContextDefinition(), filters }, undefined, false);

        const singleTabDashboard = (
            filters: FilterContextItem[],
            tabTitle: string,
            filterGroupsConfig?: IDashboardFilterGroupsConfig,
        ): IDashboardDefinition =>
            ({
                ...createDashboardDefinition(undefined, undefined, false),
                tabs: [
                    {
                        localIdentifier: "tab-1",
                        title: tabTitle,
                        layout: emptyLayout,
                        filterContext: { ...createFilterContextDefinition(), filters },
                        ...(filterGroupsConfig ? { filterGroupsConfig } : {}),
                    },
                ],
            }) as IDashboardDefinition;

        // The client sends the filters on screen; a whole live definition keeps each case readable.
        const liveFiltersOf = (live: IDashboardDefinition): IGenAIDashboardLiveFilters => ({
            filters: live.filterContext?.filters,
            tabs: Object.fromEntries(
                (live.tabs ?? []).flatMap((tab) =>
                    tab.filterContext ? [[tab.localIdentifier, tab.filterContext.filters]] : [],
                ),
            ),
        });

        const sendDashboard = (definition: IDashboardDefinition, onScreen?: IDashboardDefinition) => {
            const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
                workspaceId: "workspace",
                conversationId: "conversation",
                documentFormat: "aac-v1",
                userQuestion: "Remove the widget",
                userContext: {
                    view: {
                        dashboard: {
                            ref: idRef("dashboard-1", "analyticalDashboard"),
                            widgets: [],
                            definition,
                            ...(onScreen ? { liveFilters: liveFiltersOf(onScreen) } : {}),
                        },
                    },
                },
            });
            query.stream([]);
            const request = vi.mocked(GenAiApi_PostMessages).mock.calls[0][2];
            return request.aiSendMessageRequest.userContext?.view?.dashboard as unknown as Record<
                string,
                unknown
            >;
        };

        it("sends no viewFilters when the screen shows the saved filters", () => {
            const sent = sendDashboard(flatDashboard([regionFilter([])]), flatDashboard([regionFilter([])]));

            expect(sent).not.toHaveProperty("viewFilters");
            expect(sent).not.toHaveProperty("liveFilters");
        });

        it("sends no viewFilters without a live definition", () => {
            const sent = sendDashboard(flatDashboard([regionFilter([])]));

            expect(sent).not.toHaveProperty("viewFilters");
        });

        it("sends one entry, keyed like the saved document, for a changed attribute filter", () => {
            const sent = sendDashboard(
                flatDashboard([regionFilter([]), countryFilter([])]),
                flatDashboard([regionFilter(["Europe"]), countryFilter([])]),
            );

            expect(sent["viewFilters"]).toEqual([
                {
                    key: "region_filter",
                    filter: expect.objectContaining({
                        type: "attribute_filter",
                        state: { include: ["Europe"] },
                    }),
                },
            ]);
            // The saved "All" is what the assistant edits; AaC writes it without a state.
            expect(
                (sent["definition"] as { filters: Record<string, object> }).filters["region_filter"],
            ).toEqual({
                type: "attribute_filter",
                using: "label/label.region",
            });
        });

        it("sends a cross-filter the saved document does not have", () => {
            const sent = sendDashboard(
                flatDashboard([regionFilter([])]),
                flatDashboard([regionFilter([]), regionFilter(["California"], "state_2_attributeFilter")]),
            );

            expect(sent["viewFilters"]).toEqual([
                {
                    key: "state_2_attributeFilter",
                    filter: expect.objectContaining({ state: { include: ["California"] } }),
                },
            ]);
        });

        it("compares grouped filters by their member key", () => {
            const groups: IDashboardFilterGroupsConfig = {
                groups: [
                    {
                        title: "Geography",
                        filters: [
                            { filterLocalIdentifier: "region_filter" },
                            { filterLocalIdentifier: "country_filter" },
                        ],
                    },
                ],
            };
            const sent = sendDashboard(
                singleTabDashboard([regionFilter([]), countryFilter([])], "", groups),
                singleTabDashboard([regionFilter(["Europe"]), countryFilter([])], "", groups),
            );

            expect(sent["viewFilters"]).toEqual([
                { key: "region_filter", filter: expect.objectContaining({ state: { include: ["Europe"] } }) },
            ]);
        });

        it("matches tabs by id, not by position", () => {
            const twoTabs = (secondTabFilters: FilterContextItem[]): IDashboardDefinition =>
                ({
                    ...createDashboardDefinition(undefined, undefined, false),
                    tabs: [
                        {
                            localIdentifier: "tab-1",
                            title: "Tab 1",
                            layout: emptyLayout,
                            filterContext: {
                                ...createFilterContextDefinition(),
                                filters: [regionFilter([])],
                            },
                        },
                        {
                            localIdentifier: "tab-2",
                            title: "Tab 2",
                            layout: emptyLayout,
                            filterContext: { ...createFilterContextDefinition(), filters: secondTabFilters },
                        },
                    ],
                }) as IDashboardDefinition;

            const sent = sendDashboard(twoTabs([countryFilter([])]), twoTabs([countryFilter(["Canada"])]));

            expect(sent["viewFilters"]).toEqual([
                {
                    tabId: "tab-2",
                    key: "country_filter",
                    filter: expect.objectContaining({ state: { include: ["Canada"] } }),
                },
            ]);
        });

        it("compares each tab with its own saved tab", () => {
            const twoTabs = (firstTabValues: string[], secondTabValues: string[]): IDashboardDefinition =>
                ({
                    ...createDashboardDefinition(undefined, undefined, false),
                    tabs: [
                        {
                            localIdentifier: "tab-1",
                            title: "Tab 1",
                            layout: emptyLayout,
                            filterContext: {
                                ...createFilterContextDefinition(),
                                filters: [regionFilter(firstTabValues)],
                            },
                        },
                        {
                            localIdentifier: "tab-2",
                            title: "Tab 2",
                            layout: emptyLayout,
                            filterContext: {
                                ...createFilterContextDefinition(),
                                filters: [regionFilter(secondTabValues)],
                            },
                        },
                    ],
                }) as IDashboardDefinition;

            const sent = sendDashboard(twoTabs(["Europe"], []), twoTabs(["Europe"], []));

            expect(sent).not.toHaveProperty("viewFilters");
        });

        describe("common date filter", () => {
            const lastMonth: FilterContextItem = {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.month",
                    from: -1,
                    to: -1,
                    localIdentifier: "0_dateFilter",
                },
            };
            const withDateConfig = (definition: IDashboardDefinition): IDashboardDefinition => ({
                ...definition,
                dateFilterConfig: { filterName: "Date range", mode: "active" },
            });

            // All time removes the common date filter from the screen's filter context.
            it.each([
                ["without a date filter config", (d: IDashboardDefinition) => d],
                ["with a date filter config", withDateConfig],
            ])(
                "sends All time under the saved key when the screen drops the saved date %s",
                (_, configure) => {
                    const sent = sendDashboard(
                        configure(flatDashboard([lastMonth, regionFilter([])])),
                        configure(flatDashboard([regionFilter([])])),
                    );

                    expect(sent["viewFilters"]).toEqual([
                        { key: "0_dateFilter", filter: expect.objectContaining({ type: "date_filter" }) },
                    ]);
                    const [{ filter }] = sent["viewFilters"] as Array<{ filter: Record<string, unknown> }>;
                    expect(filter).not.toHaveProperty("from");
                    expect(filter).not.toHaveProperty("to");
                },
            );

            it("sends nothing when the screen keeps the saved date", () => {
                const dashboard = withDateConfig(flatDashboard([lastMonth, regionFilter([])]));

                expect(sendDashboard(dashboard, dashboard)).not.toHaveProperty("viewFilters");
            });

            it("sends nothing when neither the saved dashboard nor the screen has a common date", () => {
                const dashboard = withDateConfig(flatDashboard([regionFilter([])]));

                expect(sendDashboard(dashboard, dashboard)).not.toHaveProperty("viewFilters");
            });
        });

        it("names the tab of a changed filter in a document with tabs", () => {
            const sent = sendDashboard(
                singleTabDashboard([regionFilter([])], "Tab 1"),
                singleTabDashboard([regionFilter(["Europe"])], "Tab 1"),
            );

            expect(sent["viewFilters"]).toEqual([
                {
                    tabId: "tab-1",
                    key: "region_filter",
                    filter: expect.objectContaining({ state: { include: ["Europe"] } }),
                },
            ]);
        });
    });

    describe("document view", () => {
        const publisherDocument: IPublisherDocumentDefinition = {
            type: "report",
            title: "Q1",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            content: {
                version: "1",
                pages: [
                    {
                        localIdentifier: "p1",
                        layout: { type: "slotRef", slotId: "h" },
                        slots: [
                            {
                                type: "heading",
                                localIdentifier: "h",
                                source: { type: "static", content: "Hi" },
                            },
                        ],
                    },
                ],
            },
        };

        async function sentUserContext(userContext: IGenAIUserContext) {
            const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
                workspaceId: "workspace",
                conversationId: "conversation",
                documentFormat: "aac-v1",
                userQuestion: "Summarize",
                userContext,
            });

            query.stream([]);

            return vi.mocked(GenAiApi_PostMessages).mock.calls[0][2].aiSendMessageRequest.userContext;
        }

        it("should send the document as AaC, identified by its ref", async () => {
            const userContext = await sentUserContext({
                view: {
                    publisherDocument: {
                        ref: idRef("q1", "report"),
                        title: "Q1",
                        definition: publisherDocument,
                    },
                },
            });

            expect(userContext?.view?.report).toEqual({
                id: "q1",
                title: "Q1",
                definition: publisherDocumentDefinitionToYaml({
                    ...publisherDocument,
                    ref: idRef("q1", "report"),
                }).json,
            });
            expect(userContext?.view?.report?.definition).toMatchObject({
                id: "q1",
                type: "report",
                title: "Q1",
                period: { start: "2026-01-01", end: "2026-03-31" },
            });
        });

        it("should send a document that is not saved yet with no id, and still its AaC document", async () => {
            const userContext = await sentUserContext({
                view: { publisherDocument: { title: "Q1", definition: publisherDocument } },
            });

            expect(userContext?.view?.report).toEqual({
                id: null,
                title: "Q1",
                definition: publisherDocumentDefinitionToYaml(publisherDocument).json,
            });
            expect(userContext?.view?.report?.definition).toMatchObject({
                type: "report",
                title: "Q1",
                period: { start: "2026-01-01", end: "2026-03-31" },
            });
        });

        it("should send the document without its definition when it cannot be written as code", async () => {
            const unsupportedSlot = { type: "unknown", localIdentifier: "h" } as unknown as PublisherSlot;
            const [page] = publisherDocument.content.pages;
            const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
            try {
                const userContext = await sentUserContext({
                    view: {
                        publisherDocument: {
                            ref: idRef("q1", "report"),
                            definition: {
                                ...publisherDocument,
                                content: {
                                    ...publisherDocument.content,
                                    pages: [{ ...page, slots: [unsupportedSlot] }],
                                },
                            },
                        },
                    },
                });

                expect(userContext?.view?.report).toEqual({ id: "q1" });
                expect(warn).toHaveBeenCalledTimes(1);
            } finally {
                warn.mockRestore();
            }
        });

        it("should send the conversation draft an unsaved document is shown from", async () => {
            const userContext = await sentUserContext({
                view: { publisherDocument: { title: "Draft", draftRef: "report_1" } },
            });

            expect(userContext?.view?.report).toEqual({ id: null, title: "Draft", draftRef: "report_1" });
        });

        it("should send only the id for a document without a definition", async () => {
            const userContext = await sentUserContext({
                view: { publisherDocument: { ref: idRef("q1", "report") } },
            });

            expect(userContext?.view).toEqual({ report: { id: "q1" } });
        });

        it("should send a dashboard and a document side by side", async () => {
            const userContext = await sentUserContext({
                view: {
                    dashboard: { ref: idRef("dashboard-1", "analyticalDashboard"), widgets: [] },
                    publisherDocument: { ref: idRef("q1", "report") },
                },
            });

            expect(userContext?.view).toEqual({
                dashboard: { id: "dashboard-1", widgets: [] },
                report: { id: "q1" },
            });
        });

        it("should send no view when it holds neither a dashboard nor a document", async () => {
            const userContext = await sentUserContext({ view: {} });

            expect(userContext).not.toHaveProperty("view");
        });

        it("should not send a v2 document in the v1 format", async () => {
            const userContext = await sentUserContext({
                view: { publisherDocumentV2: { ref: idRef("northwind_h1"), title: "Northwind H1" } },
            });

            expect(userContext).not.toHaveProperty("view");
        });
    });

    describe("document view of Publisher content v2", () => {
        async function sentUserContextV2(userContext: IGenAIUserContext) {
            const query = new ChatConversationThreadQuery(authCall, dateNormalizer, {
                workspaceId: "workspace",
                conversationId: "conversation",
                documentFormat: "aac-v2",
                userQuestion: "Summarize",
                userContext,
            });

            query.stream([]);

            return vi.mocked(GenAiApi_PostMessages).mock.calls[0][2].aiSendMessageRequest.userContext;
        }

        it("should send the document as AaC v2, identified by its ref", async () => {
            const userContext = await sentUserContextV2({
                view: {
                    publisherDocumentV2: {
                        ref: idRef("northwind_h1"),
                        title: "Northwind H1",
                        definition: absolutePeriodDocumentV2,
                    },
                },
            });

            expect(userContext?.view).toEqual({
                document: {
                    id: "northwind_h1",
                    title: "Northwind H1",
                    definition: publisherDocumentDefinitionToYamlV2({
                        ...absolutePeriodDocumentV2,
                        ref: idRef("northwind_h1"),
                    }).json,
                },
            });
        });

        it("should send a document that is not saved yet with no id", async () => {
            const userContext = await sentUserContextV2({
                view: { publisherDocumentV2: { definition: absolutePeriodDocumentV2 } },
            });

            expect(userContext?.view?.document).toEqual({
                id: null,
                definition: publisherDocumentDefinitionToYamlV2(absolutePeriodDocumentV2).json,
            });
        });

        it("should never send the v1 report view", async () => {
            const userContext = await sentUserContextV2({
                view: {
                    publisherDocument: { ref: idRef("q1", "report"), draftRef: "report_1" },
                    publisherDocumentV2: { ref: idRef("northwind_h1") },
                },
            });

            expect(userContext?.view).toEqual({ document: { id: "northwind_h1" } });
        });

        it("should send no view for a v1 document alone", async () => {
            const userContext = await sentUserContextV2({
                view: { publisherDocument: { ref: idRef("q1", "report") } },
            });

            expect(userContext).not.toHaveProperty("view");
        });
    });
});

describe("ChatConversationThreadQuery document format", () => {
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

    const sentOptions = (query: IChatConversationThreadQuery) => {
        query.stream([]);
        return vi.mocked(GenAiApi_PostMessages).mock.calls[0][2].aiSendMessageRequest.options;
    };

    const thread = () =>
        new ChatConversationsService(authCall, "workspace", dateNormalizer).getConversationThread(
            "conversation",
        );

    it("should ask for aac-v1 when the caller names no format", () => {
        expect(sentOptions(thread().query("Summarize"))).toMatchObject({ documentFormat: "aac-v1" });
    });

    it.each<GenAIPublisherDocumentFormat>(["aac-v1", "aac-v2"])("should ask for %s when named", (format) => {
        const query = thread().query("Summarize").withPublisherDocumentFormat(format);

        expect(sentOptions(query)).toMatchObject({ documentFormat: format });
    });

    it("should keep the format through later builder calls", () => {
        const query = thread()
            .query("Summarize")
            .withPublisherDocumentFormat("aac-v2")
            .withEffort("LOW")
            .withSearchLimit(5);

        expect(sentOptions(query)).toMatchObject({ documentFormat: "aac-v2", reasoningEffort: "LOW" });
    });
});
