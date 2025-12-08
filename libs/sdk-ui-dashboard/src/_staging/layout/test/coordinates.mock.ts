// (C) 2024-2025 GoodData Corporation

import { IDashboardLayout, IInsightWidget, idRef } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";

const buildInsightWidget = (name: string): IInsightWidget => ({
    type: "insight",
    insight: idRef(name),
    drills: [],
    title: name,
    description: "",
    ignoredDrillDownHierarchies: [],
    ignoredDrillToUrlAttributes: [],
    ignoreDashboardFilters: [],
    ref: idRef(name),
    uri: `/${name}`,
    identifier: name,
});

/**
 * layout
 *     section 1
 *         item 1: insight1
 *         item 2: layout
 *              section 3
 *                  item 4: insight2
 *                  item 5: insight3
 *              section 4
 *                  item 6: insight4
 *      section 2
 *          item 7: insight5
 */
export const NESTED_LAYOUT: IDashboardLayout<ExtendedDashboardWidget> = {
    type: "IDashboardLayout",
    size: { gridWidth: 12 },
    sections: [
        {
            type: "IDashboardLayoutSection",
            header: {
                title: "Section 1",
            },
            items: [
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 8 } },
                    widget: buildInsightWidget("insight1"),
                },
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 4 } },
                    widget: {
                        type: "IDashboardLayout",
                        ref: idRef("layout2"),
                        uri: "/layout2",
                        identifier: "layout2",
                        sections: [
                            {
                                type: "IDashboardLayoutSection",
                                header: {
                                    title: "Section 3",
                                },
                                items: [
                                    {
                                        type: "IDashboardLayoutItem",
                                        size: { xl: { gridWidth: 2 } },
                                        widget: buildInsightWidget("insight2"),
                                    },
                                    {
                                        type: "IDashboardLayoutItem",
                                        size: { xl: { gridWidth: 2 } },
                                        widget: buildInsightWidget("insight3"),
                                    },
                                ],
                            },
                            {
                                type: "IDashboardLayoutSection",
                                header: {
                                    title: "Section 4",
                                },
                                items: [
                                    {
                                        type: "IDashboardLayoutItem",
                                        size: { xl: { gridWidth: 4 } },
                                        widget: buildInsightWidget("insight4"),
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
        {
            type: "IDashboardLayoutSection",
            header: {
                title: "Section 2",
            },
            items: [
                {
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 12 } },
                    widget: buildInsightWidget("insight5"),
                },
            ],
        },
    ],
};
