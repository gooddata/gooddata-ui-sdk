// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiFilterContextOut,
} from "@gooddata/api-client-tiger";
import type { RestrictedObject } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IDashboard, type IFilterContext, idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { buildExportOverrideFilterContext } from "./index.js";
import {
    fetchUnavailableFilterDisplayForms,
    inspectableFilterContextIds,
    resolveUnavailableDashboardReferences,
    resolveUnavailableFilterContextReferences,
    resolveUnavailableReferences,
} from "./referenceAvailability.js";

function dashboardDocument({
    relationships,
    content,
    restricted,
}: {
    relationships?: Record<string, { data: { id: string; type: string }[] }>;
    content?: unknown;
    restricted?: RestrictedObject[];
}): JsonApiAnalyticalDashboardOutDocument {
    return {
        data: {
            id: "dash1",
            type: "analyticalDashboard",
            attributes: { content: content ?? {} },
            relationships,
        },
        links: { self: "" },
        ...(restricted ? { meta: { restricted } } : {}),
    } as unknown as JsonApiAnalyticalDashboardOutDocument;
}

const insightWidgetContent = (ids: string[]) => ({
    layout: {
        sections: [
            {
                items: ids.map((id) => ({
                    widget: { insight: { identifier: { id, type: "visualizationObject" } } },
                })),
            },
        ],
    },
});

describe("resolveUnavailableReferences", () => {
    it("reports a restricted metric of the dashboard as forbidden", () => {
        const doc = dashboardDocument({
            relationships: { metrics: { data: [{ id: "m1", type: "metric" }] } },
            restricted: [{ id: "m1", type: "metric" }],
        });

        expect(resolveUnavailableReferences(doc, ["measure"])).toEqual([
            { ref: idRef("m1", "measure"), type: "measure", reason: "forbidden" },
        ]);
    });

    it("reports nothing for a metric the user can read", () => {
        const doc = dashboardDocument({
            relationships: { metrics: { data: [{ id: "m1", type: "metric" }] } },
        });

        expect(resolveUnavailableReferences(doc, ["measure"])).toEqual([]);
    });

    it("reports nothing when the response has no relationships for inspected types", () => {
        const doc = dashboardDocument({
            content: {},
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([]);
    });

    it("returns empty array when every content ref is present in relationships", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] } },
            content: insightWidgetContent(["vis1"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([]);
    });

    it("classifies a ref reported in meta.restricted as forbidden", () => {
        const doc = dashboardDocument({
            relationships: {
                visualizationObjects: {
                    data: [
                        { id: "vis1", type: "visualizationObject" },
                        { id: "vis2", type: "visualizationObject" },
                    ],
                },
            },
            content: insightWidgetContent(["vis1", "vis2"]),
            restricted: [{ id: "vis2", type: "visualizationObject" }],
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([
            { ref: { identifier: "vis2", type: "insight" }, type: "insight", reason: "forbidden" },
        ]);
    });

    it("does not infer forbidden from a relationship/include mismatch without meta.restricted", () => {
        const doc = dashboardDocument({
            relationships: {
                visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] },
            },
            content: insightWidgetContent(["vis1"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([]);
    });

    it("classifies a content ref absent from relationships as notFound", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] } },
            content: insightWidgetContent(["vis1", "visDeleted"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([
            { ref: { identifier: "visDeleted", type: "insight" }, type: "insight", reason: "notFound" },
        ]);
    });

    it("classifies a missing filter context as notFound even when not in requested types", () => {
        const doc = dashboardDocument({
            relationships: { filterContexts: { data: [] } },
            content: { filterContextRef: { identifier: { id: "fc1", type: "filterContext" } } },
        });

        expect(resolveUnavailableReferences(doc, [])).toEqual([
            {
                ref: { identifier: "fc1", type: "filterContext" },
                type: "filterContext",
                reason: "notFound",
            },
        ]);
    });

    it("reports nothing for a type whose relationship key is absent and whose content has no refs of it", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis2", type: "visualizationObject" }] } },
            content: insightWidgetContent(["vis2"]),
            restricted: [{ id: "vis2", type: "visualizationObject" }],
        });

        const result = resolveUnavailableReferences(doc, ["insight", "dataSet"]);

        expect(result).toEqual([
            { ref: { identifier: "vis2", type: "insight" }, type: "insight", reason: "forbidden" },
        ]);
    });

    it("does not resolve labels from the dashboard document (they relate to filter contexts)", () => {
        const doc = dashboardDocument({
            relationships: { labels: { data: [{ id: "label2", type: "label" }] } },
        });

        expect(resolveUnavailableReferences(doc, ["displayForm"])).toEqual([]);
    });

    it("classifies a missing drill-target dashboard as notFound without inferring forbidden", () => {
        const doc = dashboardDocument({
            relationships: {
                analyticalDashboards: { data: [{ id: "dashForbidden", type: "analyticalDashboard" }] },
            },
            content: {
                layout: {
                    sections: [
                        {
                            items: [
                                {
                                    widget: {
                                        drills: [
                                            {
                                                target: {
                                                    identifier: {
                                                        id: "dashForbidden",
                                                        type: "analyticalDashboard",
                                                    },
                                                },
                                            },
                                            {
                                                target: {
                                                    identifier: {
                                                        id: "dashDeleted",
                                                        type: "analyticalDashboard",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        });

        expect(resolveUnavailableReferences(doc, ["analyticalDashboard"])).toEqual([
            {
                ref: { identifier: "dashDeleted", type: "analyticalDashboard" },
                type: "analyticalDashboard",
                reason: "notFound",
            },
        ]);
    });

    it("resolves labels from a filter context document: forbidden when restricted, notFound when absent from relationships", () => {
        const doc = {
            data: {
                id: "fc1",
                type: "filterContext",
                attributes: {
                    content: {
                        filters: [
                            {
                                attributeFilter: {
                                    displayForm: { identifier: { id: "label1", type: "label" } },
                                },
                            },
                            {
                                attributeFilter: {
                                    displayForm: { identifier: { id: "label2", type: "label" } },
                                },
                            },
                            {
                                attributeFilter: {
                                    displayForm: { identifier: { id: "labelDeleted", type: "label" } },
                                },
                            },
                        ],
                    },
                },
                relationships: {
                    labels: {
                        data: [
                            { id: "label1", type: "label" },
                            { id: "label2", type: "label" },
                        ],
                    },
                },
            },
        } as unknown as { data: JsonApiFilterContextOut };

        expect(
            resolveUnavailableFilterContextReferences(doc.data, [
                { id: "label2", type: "label" },
                { id: "labelFromAnotherContext", type: "label" },
            ]),
        ).toEqual([
            { ref: { identifier: "label2", type: "displayForm" }, type: "displayForm", reason: "forbidden" },
            {
                ref: { identifier: "labelDeleted", type: "displayForm" },
                type: "displayForm",
                reason: "notFound",
            },
        ]);
    });

    it("does not inspect types that were not requested", () => {
        const doc = dashboardDocument({
            relationships: {
                filterContexts: { data: [] },
                datasets: { data: [{ id: "ds1", type: "dataset" }] },
            },
        });

        expect(resolveUnavailableReferences(doc, [])).toEqual([]);
    });

    it("classifies content refs as notFound when Tiger omits the relationship key (all refs of the type deleted)", () => {
        const doc = dashboardDocument({
            relationships: { filterContexts: { data: [{ id: "fc1", type: "filterContext" }] } },
            content: insightWidgetContent(["visDeleted"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([
            { ref: { identifier: "visDeleted", type: "insight" }, type: "insight", reason: "notFound" },
        ]);
    });

    it("never reports the dashboard itself (self-drill is linked but not repeated in included)", () => {
        const doc = dashboardDocument({
            relationships: {
                analyticalDashboards: {
                    data: [
                        { id: "dash1", type: "analyticalDashboard" },
                        { id: "other", type: "analyticalDashboard" },
                    ],
                },
            },
            content: {
                drills: [
                    { target: { identifier: { id: "dash1", type: "analyticalDashboard" } } },
                    { target: { identifier: { id: "other", type: "analyticalDashboard" } } },
                ],
            },
        });

        expect(resolveUnavailableReferences(doc, ["analyticalDashboard"])).toEqual([]);
    });
});

describe("resolveUnavailableDashboardReferences", () => {
    const missingStoredContext = dashboardDocument({
        relationships: {
            visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] },
        },
        content: { filterContextRef: { identifier: { id: "fcStored", type: "filterContext" } } },
        restricted: [{ id: "vis1", type: "visualizationObject" }],
    });
    const withContext = (ref: unknown): IDashboard => ({ filterContext: { ref } }) as unknown as IDashboard;

    it("keeps the stored filter context when the dashboard could not resolve it (no override)", () => {
        expect(resolveUnavailableDashboardReferences(missingStoredContext, {} as IDashboard, [])).toEqual([
            {
                ref: { identifier: "fcStored", type: "filterContext" },
                type: "filterContext",
                reason: "notFound",
            },
        ]);
    });

    it("keeps a context re-created for a deleted stored one (its stored id is not an override)", () => {
        const deletedStoredContext = dashboardDocument({
            relationships: {},
            content: {
                tabs: [{ filterContextRef: { identifier: { id: "fcGone", type: "filterContext" } } }],
            },
        });
        const dashboard = {
            tabs: [{ filterContext: { ref: idRef("fcGone", "filterContext") } }],
        } as unknown as IDashboard;

        expect(resolveUnavailableDashboardReferences(deletedStoredContext, dashboard, [])).toEqual([
            {
                ref: { identifier: "fcGone", type: "filterContext" },
                type: "filterContext",
                reason: "notFound",
            },
        ]);
    });

    it("drops stored filter-context entries when a filterContextRef override is in use, keeping the rest", () => {
        expect(
            resolveUnavailableDashboardReferences(
                missingStoredContext,
                withContext(idRef("fcOverride", "filterContext")),
                ["insight"],
            ),
        ).toEqual([{ ref: { identifier: "vis1", type: "insight" }, type: "insight", reason: "forbidden" }]);
    });

    it("keeps the stored filter context a tab still uses when another tab is overridden", () => {
        const twoStoredContexts = dashboardDocument({
            relationships: {
                filterContexts: {
                    data: [],
                },
            },
            content: {
                tabs: [
                    { filterContextRef: { identifier: { id: "fcKept", type: "filterContext" } } },
                    { filterContextRef: { identifier: { id: "fcReplaced", type: "filterContext" } } },
                ],
            },
        });
        const dashboard = {
            tabs: [
                { filterContext: { ref: idRef("fcKept", "filterContext") } },
                { filterContext: { ref: idRef("fcOverride", "filterContext") } },
            ],
        } as unknown as IDashboard;

        expect(resolveUnavailableDashboardReferences(twoStoredContexts, dashboard, [])).toEqual([
            {
                ref: { identifier: "fcKept", type: "filterContext" },
                type: "filterContext",
                reason: "notFound",
            },
        ]);
    });

    it("drops the replaced stored context even when the override reuses another stored context", () => {
        const twoStoredContexts = dashboardDocument({
            relationships: {
                filterContexts: {
                    data: [{ id: "fcKept", type: "filterContext" }],
                },
            },
            content: {
                tabs: [
                    { filterContextRef: { identifier: { id: "fcKept", type: "filterContext" } } },
                    { filterContextRef: { identifier: { id: "fcReplaced", type: "filterContext" } } },
                ],
            },
        });
        const dashboard = {
            filterContext: { ref: idRef("fcKept", "filterContext") },
            tabs: [
                { filterContext: { ref: idRef("fcKept", "filterContext") } },
                { filterContext: { ref: idRef("fcKept", "filterContext") } },
            ],
        } as unknown as IDashboard;

        expect(resolveUnavailableDashboardReferences(twoStoredContexts, dashboard, [])).toEqual([]);
    });

    it("drops stored filter-context entries when the export override context is in use", () => {
        expect(
            resolveUnavailableDashboardReferences(
                missingStoredContext,
                { filterContext: buildExportOverrideFilterContext("export-1", []) } as unknown as IDashboard,
                [],
            ),
        ).toEqual([]);
    });
});

describe("inspectableFilterContextIds", () => {
    const persisted = (id: string): IFilterContext =>
        ({
            ref: idRef(id, "filterContext"),
            identifier: id,
            uri: id,
            filters: [],
        }) as unknown as IFilterContext;

    it("collects the persisted filter contexts of the root and the tabs once each", () => {
        const dashboard = {
            filterContext: persisted("fc1"),
            tabs: [{ filterContext: persisted("fc1") }, { filterContext: persisted("fc2") }, {}],
        } as unknown as IDashboard;

        expect(inspectableFilterContextIds(dashboard)).toEqual(["fc1", "fc2"]);
    });

    it("collects nothing from a dashboard without filter contexts", () => {
        expect(inspectableFilterContextIds({} as IDashboard)).toEqual([]);
    });

    it("skips the synthetic export-override context, which has no entity behind it", () => {
        const dashboard = {
            filterContext: buildExportOverrideFilterContext("export-1", []),
            tabs: [{ filterContext: buildExportOverrideFilterContext("export-1", []) }],
        } as unknown as IDashboard;

        expect(inspectableFilterContextIds(dashboard)).toEqual([]);
    });
});

describe("fetchUnavailableFilterDisplayForms", () => {
    // The real client runs against a fake axios, so the request it builds is what is asserted.
    let request: ReturnType<typeof vi.fn>;
    let authCall: TigerAuthenticatedCallGuard;

    const respondWith = (data: unknown[], restricted?: RestrictedObject[]) => {
        request.mockResolvedValue({ data: { data, ...(restricted ? { meta: { restricted } } : {}) } });
    };

    const requestedQuery = () => new URL(request.mock.calls[0][0].url).searchParams;

    const dashboardWithContexts = (...ids: string[]) =>
        ({
            filterContext: { ref: idRef(ids[0], "filterContext") },
            tabs: ids.slice(1).map((id) => ({ filterContext: { ref: idRef(id, "filterContext") } })),
        }) as unknown as IDashboard;

    const contextWithLabels = (id: string, labelIds: string[]) => ({
        id,
        type: "filterContext",
        attributes: {
            content: {
                filters: labelIds.map((labelId) => ({
                    attributeFilter: { displayForm: { identifier: { id: labelId, type: "label" } } },
                })),
            },
        },
        relationships: { labels: { data: labelIds.map((labelId) => ({ id: labelId, type: "label" })) } },
    });

    beforeEach(() => {
        request = vi.fn();
        authCall = ((call: (client: unknown) => unknown) =>
            call({ axios: { request }, basePath: "https://example.com" })) as TigerAuthenticatedCallGuard;
    });

    it("does not ask the backend when display forms were not requested", async () => {
        await expect(
            fetchUnavailableFilterDisplayForms(authCall, "ws", dashboardWithContexts("fc1"), ["insight"]),
        ).resolves.toEqual([]);
        expect(request).not.toHaveBeenCalled();
    });

    it("does not ask the backend for a dashboard with no persisted filter context", async () => {
        await expect(
            fetchUnavailableFilterDisplayForms(authCall, "ws", {} as IDashboard, ["displayForm"]),
        ).resolves.toEqual([]);
        expect(request).not.toHaveBeenCalled();
    });

    it("asks for the labels of every persisted context in one request", async () => {
        respondWith([]);

        await fetchUnavailableFilterDisplayForms(authCall, "ws", dashboardWithContexts("fcRoot", "fcTab"), [
            "displayForm",
        ]);

        expect(request).toHaveBeenCalledTimes(1);
        expect(request.mock.calls[0][0].url).toContain("/workspaces/ws/filterContexts");
        expect(requestedQuery().get("filter")).toEqual("id==fcRoot,id==fcTab");
        expect(requestedQuery().get("include")).toEqual("labels");
        expect(requestedQuery().get("size")).toEqual("2");
    });

    it("reports the labels the response withholds, each against the context that uses it", async () => {
        respondWith(
            [contextWithLabels("fcRoot", ["label1", "label2"]), contextWithLabels("fcTab", ["label3"])],
            [
                { id: "label2", type: "label" },
                { id: "label3", type: "label" },
            ],
        );

        await expect(
            fetchUnavailableFilterDisplayForms(authCall, "ws", dashboardWithContexts("fcRoot", "fcTab"), [
                "displayForm",
            ]),
        ).resolves.toEqual([
            { ref: { identifier: "label2", type: "displayForm" }, type: "displayForm", reason: "forbidden" },
            { ref: { identifier: "label3", type: "displayForm" }, type: "displayForm", reason: "forbidden" },
        ]);
    });

    it("reports nothing when the response withholds nothing", async () => {
        respondWith([contextWithLabels("fcRoot", ["label1"])]);

        await expect(
            fetchUnavailableFilterDisplayForms(authCall, "ws", dashboardWithContexts("fcRoot"), [
                "displayForm",
            ]),
        ).resolves.toEqual([]);
    });

    it("keeps the dashboard loading when the request fails", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        request.mockRejectedValue(new Error("403"));

        await expect(
            fetchUnavailableFilterDisplayForms(authCall, "ws", dashboardWithContexts("fcRoot"), [
                "displayForm",
            ]),
        ).resolves.toEqual([]);
        expect(warn).toHaveBeenCalled();
    });
});
