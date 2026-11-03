// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Dashboard, Dataset, Metric, Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    yamlDocumentsToDeclarativeWorkspace,
    yamlEntitiesToDeclarativeWorkspace,
} from "./to/yamlDocumentsToDeclarativeWorkspace.js";
import type { ExportEntities } from "./types.js";

const orders: Dataset = {
    type: "dataset",
    id: "orders",
    table_path: "demo/orders",
    primary_key: "order_id",
    fields: {
        order_id: { type: "attribute", source_column: "order_id", data_type: "STRING" },
        amount: { type: "fact", source_column: "amount", data_type: "NUMERIC" },
    },
};

const revenue: Metric = {
    type: "metric",
    id: "revenue",
    maql: "SELECT SUM({fact/amount})",
};

const revenueChart: Visualisation = {
    type: "column_chart",
    id: "revenue_chart",
    query: { fields: { revenue: "metric/revenue" } },
    metrics: ["revenue"],
};

const overview: Dashboard = {
    type: "dashboard",
    id: "overview",
    sections: [{ widgets: [{ visualization: "revenue_chart", columns: 12 }] }],
};

const tabbed = (version: "2" | "3", tabIds: string[]): Dashboard => ({
    type: "dashboard",
    id: `tabbed_v${version}`,
    version,
    tabs: tabIds.map((id) => ({
        id,
        title: id,
        sections: [{ widgets: [{ visualization: "revenue_chart", columns: 12 }] }],
    })),
});

const tabFilterContextIds = (content: object) =>
    (content as { tabs: { filterContextRef: { identifier: { id: string } } }[] }).tabs.map(
        ({ filterContextRef }) => filterContextRef.identifier.id,
    );

describe("yamlDocumentsToDeclarativeWorkspace", () => {
    it("puts each document into its collection", () => {
        const ws = yamlDocumentsToDeclarativeWorkspace([orders, revenue, revenueChart, overview]);

        expect(ws.ldm.datasets?.map(({ id }) => id)).toEqual(["orders"]);
        expect(ws.analytics.metrics?.map(({ id }) => id)).toEqual(["revenue"]);
        expect(ws.analytics.visualizationObjects?.map(({ id }) => id)).toEqual(["revenue_chart"]);
        expect(ws.analytics.analyticalDashboards?.map(({ id }) => id)).toEqual(["overview"]);
    });

    it("gives each dashboard filter context once", () => {
        const ws = yamlDocumentsToDeclarativeWorkspace([revenueChart, overview]);
        const ids = ws.analytics.filterContexts?.map(({ id }) => id) ?? [];

        expect(ids).toHaveLength(1);
        expect(ws.analytics.analyticalDashboards?.[0].content).toMatchObject({
            filterContextRef: { identifier: { id: ids[0] } },
        });
    });

    it.each([
        ["2", ["a", "b", "c"]],
        ["3", ["a", "b"]],
    ] as const)("gives each tab of a V%s dashboard its own filter context", (version, tabIds) => {
        const ws = yamlDocumentsToDeclarativeWorkspace([revenueChart, tabbed(version, [...tabIds])]);
        const ids = ws.analytics.filterContexts?.map(({ id }) => id);
        const content = ws.analytics.analyticalDashboards?.[0].content as {
            filterContextRef?: { identifier: { id: string } };
        };

        expect(ids).toEqual(tabFilterContextIds(content));
        expect(new Set(ids).size).toBe(tabIds.length);
        expect(content.filterContextRef?.identifier.id).toBe(version === "2" ? ids?.[0] : undefined);
    });

    it("binds the datasets without a data source to the given data source", () => {
        const ownSource: Dataset = { ...orders, id: "returns", data_source: "warehouse" };

        const ws = yamlDocumentsToDeclarativeWorkspace([orders, ownSource], { dataSourceId: "demo_ds" });

        expect(ws.ldm.datasets?.map((dataset) => dataset.dataSourceTableId?.dataSourceId)).toEqual([
            "demo_ds",
            "warehouse",
        ]);
    });

    it("returns empty collections for no documents", () => {
        expect(yamlDocumentsToDeclarativeWorkspace([])).toEqual({
            ldm: { datasets: [], dateInstances: [] },
            analytics: {
                metrics: [],
                parameters: [],
                computedAttributes: [],
                visualizationObjects: [],
                analyticalDashboards: [],
                filterContexts: [],
                dashboardPlugins: [],
                attributeHierarchies: [],
            },
        });
    });

    it("stores the declarative form of each entity", () => {
        const entities: ExportEntities = [revenue, overview].map((data) => ({
            id: data.id,
            type: data.type,
            path: "metrics.yaml",
            data,
        }));

        const ws = yamlEntitiesToDeclarativeWorkspace(entities);

        expect(entities[0].declarative).toBe(ws.analytics.metrics?.[0]);
        expect(entities[1].declarative).toMatchObject({ dashboard: ws.analytics.analyticalDashboards?.[0] });
    });
});
