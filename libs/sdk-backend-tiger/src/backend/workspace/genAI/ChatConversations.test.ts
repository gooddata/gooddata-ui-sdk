// (C) 2026 GoodData Corporation

import { type AxiosProgressEvent, type AxiosPromise } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    GenAiApi_PostConversations,
    GenAiApi_PostMessages,
    GenAiApi_SwitchAgent,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import { reportDefinitionToYaml } from "@gooddata/sdk-code-convertors";
import {
    type IDashboardDefinition,
    type IFilterContext,
    type IFilterContextDefinition,
    type IGenAIUserContext,
    type IReportDefinition,
    type ITempFilterContext,
    type ReportSlot,
    idRef,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import type { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
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

    describe("report view", () => {
        const report: IReportDefinition = {
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
                userQuestion: "Summarize",
                userContext,
            });

            query.stream([]);

            return vi.mocked(GenAiApi_PostMessages).mock.calls[0][2].aiSendMessageRequest.userContext;
        }

        it("should send the report as its AaC document, identified by the report ref", async () => {
            const userContext = await sentUserContext({
                view: { report: { ref: idRef("q1", "report"), title: "Q1", definition: report } },
            });

            expect(userContext?.view?.report).toEqual({
                id: "q1",
                title: "Q1",
                definition: reportDefinitionToYaml({ ...report, ref: idRef("q1", "report") }).json,
            });
            expect(userContext?.view?.report?.definition).toMatchObject({
                id: "q1",
                type: "report",
                title: "Q1",
                period: { start: "2026-01-01", end: "2026-03-31" },
            });
        });

        it("should send the report without its definition when it cannot be written as code", async () => {
            const unsupportedSlot = { type: "unknown", localIdentifier: "h" } as unknown as ReportSlot;
            const [page] = report.content.pages;
            const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
            try {
                const userContext = await sentUserContext({
                    view: {
                        report: {
                            ref: idRef("q1", "report"),
                            definition: {
                                ...report,
                                content: {
                                    ...report.content,
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

        it("should send only the id for a report without a definition", async () => {
            const userContext = await sentUserContext({ view: { report: { ref: idRef("q1", "report") } } });

            expect(userContext?.view).toEqual({ report: { id: "q1" } });
        });

        it("should send a dashboard and a report side by side", async () => {
            const userContext = await sentUserContext({
                view: {
                    dashboard: { ref: idRef("dashboard-1", "analyticalDashboard"), widgets: [] },
                    report: { ref: idRef("q1", "report") },
                },
            });

            expect(userContext?.view).toEqual({
                dashboard: { id: "dashboard-1", widgets: [] },
                report: { id: "q1" },
            });
        });

        it("should send no view when it holds neither a dashboard nor a report", async () => {
            const userContext = await sentUserContext({ view: {} });

            expect(userContext).not.toHaveProperty("view");
        });
    });
});
