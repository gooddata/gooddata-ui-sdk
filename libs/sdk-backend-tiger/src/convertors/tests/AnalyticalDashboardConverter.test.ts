// (C) 2022 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-model";
import { getDrillToCustomUrlPaths } from "../toBackend/AnalyticalDashboardConverter";

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
    test("should find paths for drills ", () => {
        const paths = getDrillToCustomUrlPaths(layout);
        expect(paths).toEqual([
            ["sections", 0, "items", 1, "widget", "drills", 0],
            ["sections", 1, "items", 0, "widget", "drills", 0],
            ["sections", 1, "items", 4, "widget", "drills", 0],
        ]);
    });
});
