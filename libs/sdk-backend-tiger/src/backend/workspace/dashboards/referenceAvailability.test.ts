// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiFilterContextOut,
    JsonApiFilterContextOutIncludes,
} from "@gooddata/api-client-tiger";
import { type IDashboard, type IFilterContext, idRef } from "@gooddata/sdk-model";

import { buildExportOverrideFilterContext } from "./index.js";
import {
    dashboardSideloadIncludes,
    inspectableFilterContextIds,
    resolveUnavailableDashboardReferences,
    resolveUnavailableFilterContextReferences,
    resolveUnavailableReferences,
} from "./referenceAvailability.js";

function dashboardDocument({
    relationships,
    included,
    content,
}: {
    relationships?: Record<string, { data: { id: string; type: string }[] }>;
    included?: { id: string; type: string }[];
    content?: unknown;
}): JsonApiAnalyticalDashboardOutDocument {
    return {
        data: {
            id: "dash1",
            type: "analyticalDashboard",
            attributes: { content: content ?? {} },
            relationships,
        },
        included,
        links: { self: "" },
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
    it("reports nothing when the response has no relationships for inspected types", () => {
        const doc = dashboardDocument({
            included: [{ id: "vis1", type: "visualizationObject" }],
            content: insightWidgetContent(["vis1"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([]);
    });

    it("returns empty array when every relationship ref is side-loaded", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] } },
            included: [{ id: "vis1", type: "visualizationObject" }],
            content: insightWidgetContent(["vis1"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([]);
    });

    it("classifies a ref in relationships but not in included as forbidden", () => {
        const doc = dashboardDocument({
            relationships: {
                visualizationObjects: {
                    data: [
                        { id: "vis1", type: "visualizationObject" },
                        { id: "vis2", type: "visualizationObject" },
                    ],
                },
            },
            included: [{ id: "vis1", type: "visualizationObject" }],
            content: insightWidgetContent(["vis1", "vis2"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([
            { ref: { identifier: "vis2", type: "insight" }, type: "insight", reason: "forbidden" },
        ]);
    });

    it("classifies a content ref absent from relationships as notFound", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] } },
            included: [{ id: "vis1", type: "visualizationObject" }],
            content: insightWidgetContent(["vis1", "visDeleted"]),
        });

        expect(resolveUnavailableReferences(doc, ["insight"])).toEqual([
            { ref: { identifier: "visDeleted", type: "insight" }, type: "insight", reason: "notFound" },
        ]);
    });

    it("classifies a missing filter context as forbidden even when not in requested types", () => {
        const doc = dashboardDocument({
            relationships: { filterContexts: { data: [{ id: "fc1", type: "filterContext" }] } },
            included: [],
        });

        expect(resolveUnavailableReferences(doc, [])).toEqual([
            {
                ref: { identifier: "fc1", type: "filterContext" },
                type: "filterContext",
                reason: "forbidden",
            },
        ]);
    });

    it("reports nothing for a type whose relationship key is absent and whose content has no refs of it", () => {
        const doc = dashboardDocument({
            relationships: { visualizationObjects: { data: [{ id: "vis2", type: "visualizationObject" }] } },
            included: [],
            content: insightWidgetContent(["vis2"]),
        });

        const result = resolveUnavailableReferences(doc, ["insight", "dataSet"]);

        expect(result).toEqual([
            { ref: { identifier: "vis2", type: "insight" }, type: "insight", reason: "forbidden" },
        ]);
    });

    it("does not resolve labels from the dashboard document (they relate to filter contexts)", () => {
        const doc = dashboardDocument({
            relationships: { labels: { data: [{ id: "label2", type: "label" }] } },
            included: [],
        });

        expect(resolveUnavailableReferences(doc, ["displayForm"])).toEqual([]);
    });

    it("classifies drill-target dashboards: forbidden when omitted from included, notFound when absent from relationships", () => {
        const doc = dashboardDocument({
            relationships: {
                analyticalDashboards: { data: [{ id: "dashForbidden", type: "analyticalDashboard" }] },
            },
            included: [],
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
                ref: { identifier: "dashForbidden", type: "analyticalDashboard" },
                type: "analyticalDashboard",
                reason: "forbidden",
            },
            {
                ref: { identifier: "dashDeleted", type: "analyticalDashboard" },
                type: "analyticalDashboard",
                reason: "notFound",
            },
        ]);
    });

    it("resolves labels from a filter context document: forbidden when omitted from included, notFound when absent from relationships", () => {
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
            included: [{ id: "label1", type: "label" }],
        } as unknown as { data: JsonApiFilterContextOut; included: JsonApiFilterContextOutIncludes[] };

        expect(resolveUnavailableFilterContextReferences(doc.data, doc.included)).toEqual([
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
            included: [],
        });

        expect(resolveUnavailableReferences(doc, [])).toEqual([]);
    });

    it("classifies content refs as notFound when Tiger omits the relationship key (all refs of the type deleted)", () => {
        const doc = dashboardDocument({
            relationships: { filterContexts: { data: [{ id: "fc1", type: "filterContext" }] } },
            included: [{ id: "fc1", type: "filterContext" }],
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
            included: [{ id: "other", type: "analyticalDashboard" }],
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
    const forbiddenStoredContext = dashboardDocument({
        relationships: {
            filterContexts: { data: [{ id: "fcStored", type: "filterContext" }] },
            visualizationObjects: { data: [{ id: "vis1", type: "visualizationObject" }] },
        },
        included: [],
        content: { filterContextRef: { identifier: { id: "fcStored", type: "filterContext" } } },
    });
    const withContext = (ref: unknown): IDashboard => ({ filterContext: { ref } }) as unknown as IDashboard;

    it("keeps the stored filter context when the dashboard could not resolve it (no override)", () => {
        expect(resolveUnavailableDashboardReferences(forbiddenStoredContext, {} as IDashboard, [])).toEqual([
            {
                ref: { identifier: "fcStored", type: "filterContext" },
                type: "filterContext",
                reason: "forbidden",
            },
        ]);
    });

    it("keeps a context re-created for a deleted stored one (its stored id is not an override)", () => {
        const deletedStoredContext = dashboardDocument({
            relationships: {},
            included: [],
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
                forbiddenStoredContext,
                withContext(idRef("fcOverride", "filterContext")),
                ["insight"],
            ),
        ).toEqual([{ ref: { identifier: "vis1", type: "insight" }, type: "insight", reason: "forbidden" }]);
    });

    it("keeps the stored filter context a tab still uses when another tab is overridden", () => {
        const twoStoredContexts = dashboardDocument({
            relationships: {
                filterContexts: {
                    data: [
                        { id: "fcKept", type: "filterContext" },
                        { id: "fcReplaced", type: "filterContext" },
                    ],
                },
            },
            included: [],
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
                reason: "forbidden",
            },
        ]);
    });

    it("drops the replaced stored context even when the override reuses another stored context", () => {
        const twoStoredContexts = dashboardDocument({
            relationships: {
                filterContexts: {
                    data: [
                        { id: "fcKept", type: "filterContext" },
                        { id: "fcReplaced", type: "filterContext" },
                    ],
                },
            },
            included: [{ id: "fcKept", type: "filterContext" }],
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
                forbiddenStoredContext,
                { filterContext: buildExportOverrideFilterContext("export-1", []) } as unknown as IDashboard,
                [],
            ),
        ).toEqual([]);
    });
});

describe("dashboardSideloadIncludes", () => {
    it("always side-loads filter contexts and adds one include per requested type in request order", () => {
        expect(dashboardSideloadIncludes([])).toEqual(["filterContexts"]);
        expect(dashboardSideloadIncludes(["dataSet", "insight"])).toEqual([
            "filterContexts",
            "visualizationObjects",
            "datasets",
        ]);
        expect(dashboardSideloadIncludes(["dashboardPlugin", "analyticalDashboard"])).toEqual([
            "filterContexts",
            "dashboardPlugins",
            "analyticalDashboards",
        ]);
    });

    it("does not side-load labels for displayForm (they are resolved from the filter contexts)", () => {
        expect(dashboardSideloadIncludes(["displayForm"])).toEqual(["filterContexts"]);
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
