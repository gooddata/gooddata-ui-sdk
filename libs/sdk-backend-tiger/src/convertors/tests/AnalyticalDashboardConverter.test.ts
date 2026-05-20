// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AnalyticalDashboardModelV2,
    type AnalyticalDashboardModelV3,
    type JsonApiAnalyticalDashboardOutDocument,
} from "@gooddata/api-client-tiger";
import { type IDashboardLayout } from "@gooddata/sdk-model";

import { convertDashboard as convertDashboardDispatcher } from "../fromBackend/analyticalDashboards/AnalyticalDashboardConverter.js";
import { convertDashboard } from "../fromBackend/analyticalDashboards/v2/AnalyticalDashboardConverter.js";
import { getDrillToCustomUrlPaths } from "../toBackend/AnalyticalDashboardConverter.js";

const layout: IDashboardLayout = {
    type: "IDashboardLayout",
    sections: [
        {
            type: "IDashboardLayoutSection",
            items: [
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 6 } },
                    widget: {
                        type: "insight",
                        title: "some insight",
                        description: "",
                        ignoreDashboardFilters: [],
                        insight: { identifier: "842a24d3-4455-45e1-b345-f97e582c2264", type: "insight" },
                        drills: [
                            {
                                type: "drillToDashboard",
                                transition: "in-place",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: { localIdentifier: "976db22206504c05b9b6836176746e61" },
                                },
                                target: {
                                    identifier: "56b58ac4-fc16-4762-86b9-86ecc1087a54",
                                    type: "analyticalDashboard",
                                },
                            },
                        ],
                        properties: {},
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 6 } },
                    widget: {
                        ref: { identifier: "ff51d6fc-6ac5-4157-8fd4-a22ca21a84d8_widget-0" },
                        identifier: "ff51d6fc-6ac5-4157-8fd4-a22ca21a84d8_widget-0",
                        type: "insight",
                        title: "quantity per state",
                        description: "",
                        ignoreDashboardFilters: [],
                        dateDataSet: { identifier: "6c2664ac21764748910953139a3aedad:date", type: "dataSet" },
                        insight: { identifier: "ff51d6fc-6ac5-4157-8fd4-a22ca21a84d8", type: "insight" },
                        drills: [
                            {
                                type: "drillToCustomUrl",
                                transition: "new-window",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: { localIdentifier: "fc0475e9edaf4c29aec210ace28ea1d6" },
                                },
                                target: {
                                    url: "https://google.com/?q={attribute_title(6c2664ac21764748910953139a3aedad:geo__state__location)}",
                                },
                            },
                        ],
                        properties: {},
                    },
                },
            ],
        },
        {
            type: "IDashboardLayoutSection",
            items: [
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 6 } },
                    widget: {
                        ref: { identifier: "842a24d3-4455-45e1-b345-f97e582c2264_widget-1" },
                        identifier: "842a24d3-4455-45e1-b345-f97e582c2264_widget-1",
                        type: "insight",
                        title: "some insight",
                        description: "",
                        ignoreDashboardFilters: [],
                        insight: { identifier: "842a24d3-4455-45e1-b345-f97e582c2264", type: "insight" },
                        drills: [
                            {
                                type: "drillToCustomUrl",
                                transition: "new-window",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: { localIdentifier: "976db22206504c05b9b6836176746e61" },
                                },
                                target: {
                                    url: "https://google.com/?q={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}",
                                },
                            },
                        ],
                        properties: {},
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 6 } },
                    widget: {
                        type: "insight",
                        title: "quantity per state",
                        description: "",
                        ignoreDashboardFilters: [],
                        dateDataSet: { identifier: "6c2664ac21764748910953139a3aedad:date", type: "dataSet" },
                        insight: { identifier: "ff51d6fc-6ac5-4157-8fd4-a22ca21a84d8", type: "insight" },
                        drills: [
                            {
                                type: "drillToInsight",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: { localIdentifier: "fc0475e9edaf4c29aec210ace28ea1d6" },
                                },
                                transition: "pop-up",
                                target: {
                                    identifier: "842a24d3-4455-45e1-b345-f97e582c2264",
                                    type: "insight",
                                },
                            },
                        ],
                        properties: {},
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 12 } },
                    widget: {
                        type: "insight",
                        title: "budget by category",
                        description: "",
                        ignoreDashboardFilters: [],
                        insight: {
                            identifier:
                                "6c2664ac21764748910953139a3aedad:c4c7a093-cb50-404c-88e9-ee8305c36091",
                            type: "insight",
                        },
                        drills: [],
                        properties: {},
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 6 } },
                    widget: {
                        type: "insight",
                        title: "some insight",
                        description: "",
                        ignoreDashboardFilters: [],
                        insight: { identifier: "842a24d3-4455-45e1-b345-f97e582c2264", type: "insight" },
                        drills: [],
                        properties: {},
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 12 } },
                    widget: {
                        ref: {
                            identifier:
                                "6c2664ac21764748910953139a3aedad:c4c7a093-cb50-404c-88e9-ee8305c36091_widget-2",
                        },
                        identifier:
                            "6c2664ac21764748910953139a3aedad:c4c7a093-cb50-404c-88e9-ee8305c36091_widget-2",
                        type: "insight",
                        title: "budget by category",
                        description: "",
                        ignoreDashboardFilters: [],
                        insight: {
                            identifier:
                                "6c2664ac21764748910953139a3aedad:c4c7a093-cb50-404c-88e9-ee8305c36091",
                            type: "insight",
                        },
                        drills: [
                            {
                                type: "drillToCustomUrl",
                                transition: "new-window",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: { localIdentifier: "d87df04c8f6f44b88ec2c58ecc47e120" },
                                },
                                target: {
                                    url: "https://third.com/?q={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}&ws={workspace_id}",
                                },
                            },
                        ],
                        properties: {},
                    },
                },
            ],
            header: { title: "Title" },
        },
    ],
};

describe("detect DrillToCustomUrl in layout", () => {
    it("should find paths for drills ", () => {
        const paths = getDrillToCustomUrlPaths(layout);
        expect(paths).toEqual([
            ["sections", 0, "items", 1, "widget", "drills", 0],
            ["sections", 1, "items", 0, "widget", "drills", 0],
            ["sections", 1, "items", 4, "widget", "drills", 0],
        ]);
    });
});

describe("convertDashboard root vs tabs content", () => {
    const wrapAsDocument = (
        content:
            | AnalyticalDashboardModelV2.IAnalyticalDashboard
            | AnalyticalDashboardModelV3.IAnalyticalDashboard,
    ): JsonApiAnalyticalDashboardOutDocument => ({
        data: {
            id: "dashboard-1",
            type: "analyticalDashboard",
            attributes: { title: "", description: "", content },
            relationships: {},
            meta: {},
        },
        links: { self: "https://example/dashboard-1" },
    });

    it("V2 tabs-only payload: synthesizes root layout/filter configs from tabs[0] on read", () => {
        // Wire-level V2 dashboard where root content is omitted (tabs-only payload, e.g.
        // produced by a client with the V3 toBackend FF on). The fromBackend converter
        // synthesizes root layout / filter configs from tabs[0] so the in-memory model
        // exposes the legacy root-level fields consumers expect. Parameters have no fallback.
        const tab: AnalyticalDashboardModelV2.IDashboardTab = {
            localIdentifier: "tab-A",
            title: "",
            layout: { type: "IDashboardLayout", sections: [] } as never,
            filterContextRef: {} as never,
            parameters: [
                {
                    ref: { identifier: { id: "topN", type: "parameter" } } as never,
                    parameterType: "NUMBER",
                    value: 25,
                },
            ],
            dateFilterConfig: { filterName: "tab-fc", mode: "readonly" } as never,
            attributeFilterConfigs: [{ localIdentifier: "af-1" }] as never,
            measureValueFilterConfigs: [{ localIdentifier: "mvf-1" }] as never,
        };
        const doc = wrapAsDocument({ version: "2", tabs: [tab] });

        const dashboard = convertDashboard(doc);

        // Root layout + filter configs are synthesized from tabs[0].
        expect(dashboard.layout).toBeDefined();
        expect(dashboard.dateFilterConfig).toBeDefined();
        expect(dashboard.attributeFilterConfigs).toBeDefined();
        expect(dashboard.measureValueFilterConfigs).toBeDefined();
        // Parameters has no fallback in the converter — stays undefined when root omits it.
        expect(dashboard.parameters).toBeUndefined();
        // Tabs are intact.
        expect(dashboard.tabs?.[0]?.parameters).toHaveLength(1);
        expect(dashboard.tabs?.[0]?.dateFilterConfig).toBeDefined();
        expect(dashboard.tabs?.[0]?.attributeFilterConfigs).toBeDefined();
        expect(dashboard.tabs?.[0]?.measureValueFilterConfigs).toBeDefined();
    });

    it("V3 dispatch: routes through V2 converter; tab content surfaces on root via fallback", () => {
        // A V3 document (version "3", tabs-only) is accepted by the top-level dispatcher and
        // routed through the V2 converter. The V2 converter's tabs[0] fallback synthesizes
        // root layout for the in-memory model; the V3-on-write transformation reapplies the
        // tabs-only shape on save.
        const tab: AnalyticalDashboardModelV2.IDashboardTab = {
            localIdentifier: "tab-A",
            title: "First",
            layout: { type: "IDashboardLayout", sections: [] } as never,
            filterContextRef: {} as never,
            parameters: [
                {
                    ref: { identifier: { id: "topN", type: "parameter" } } as never,
                    parameterType: "NUMBER",
                    value: 25,
                },
            ],
        };
        const v3Content: AnalyticalDashboardModelV3.IAnalyticalDashboard = {
            version: "3",
            tabs: [tab],
        };
        const doc = wrapAsDocument(v3Content);

        const dashboard = convertDashboardDispatcher(doc);

        expect(dashboard.layout).toBeDefined();
        expect(dashboard.tabs).toHaveLength(1);
        expect(dashboard.tabs?.[0]?.title).toBe("First");
        expect(dashboard.tabs?.[0]?.parameters).toHaveLength(1);
    });
});
