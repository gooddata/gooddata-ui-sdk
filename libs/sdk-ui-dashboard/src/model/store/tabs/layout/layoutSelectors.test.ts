// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../../types.js";

import { selectAllInsightWidgetRefs } from "./layoutSelectors.js";

describe("layoutSelectors", () => {
    describe("selectAllInsightWidgetRefs", () => {
        it("should match insight widgets in nested layouts and visualization switcher visualizations", () => {
            const targetInsightRef = idRef("target-insight", "insight");
            const topLevelWidgetRef = idRef("top-level-widget", "insight");
            const nestedWidgetRef = idRef("nested-widget", "insight");
            const switcherChildWidgetRef = idRef("switcher-child-widget", "insight");

            const state = {
                tabs: {
                    tabs: [
                        {
                            localIdentifier: "tab-1",
                            layout: {
                                layout: {
                                    type: "IDashboardLayout",
                                    sections: [
                                        {
                                            type: "IDashboardLayoutSection",
                                            items: [
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "insight",
                                                        identifier: "top-level-widget",
                                                        ref: topLevelWidgetRef,
                                                        insight: targetInsightRef,
                                                    },
                                                },
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "IDashboardLayout",
                                                        sections: [
                                                            {
                                                                type: "IDashboardLayoutSection",
                                                                items: [
                                                                    {
                                                                        type: "IDashboardLayoutItem",
                                                                        size: { xl: { gridWidth: 12 } },
                                                                        widget: {
                                                                            type: "insight",
                                                                            identifier: "nested-widget",
                                                                            ref: nestedWidgetRef,
                                                                            insight: targetInsightRef,
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "visualizationSwitcher",
                                                        identifier: "switcher-widget",
                                                        ref: idRef("switcher-widget", "insight"),
                                                        visualizations: [
                                                            {
                                                                type: "insight",
                                                                identifier: "switcher-child-widget",
                                                                ref: switcherChildWidgetRef,
                                                                insight: targetInsightRef,
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    activeTabLocalIdentifier: "tab-1",
                },
            } as unknown as DashboardState;

            const refs = selectAllInsightWidgetRefs(targetInsightRef)(state);

            expect(refs).toHaveLength(3);
            expect(refs.some((ref) => areObjRefsEqual(ref, topLevelWidgetRef))).toBe(true);
            expect(refs.some((ref) => areObjRefsEqual(ref, nestedWidgetRef))).toBe(true);
            expect(refs.some((ref) => areObjRefsEqual(ref, switcherChildWidgetRef))).toBe(true);
        });
    });
});
