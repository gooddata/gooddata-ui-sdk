// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FilterContextItem, areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../../types.js";
import { unavailableObjectsEntityAdapter } from "../../unavailableObjects/unavailableObjectsEntityAdapter.js";

import { selectAllFiltersForWidgetByRefAcrossTabs, selectAllInsightWidgetRefs } from "./layoutSelectors.js";

function attributeFilter(
    localIdentifier: string,
    displayForm = idRef("label", "displayForm"),
): FilterContextItem {
    return {
        attributeFilter: {
            displayForm,
            negativeSelection: false,
            attributeElements: { uris: [] },
            localIdentifier,
        },
    };
}

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

    describe("selectAllFiltersForWidgetByRefAcrossTabs", () => {
        it("should use the widget's tab filters and remove filters ignored on that widget", () => {
            const targetWidgetRef = idRef("target-widget", "insight");
            const targetInsightRef = idRef("target-insight", "insight");
            const ignoredDisplayFormRef = idRef("ignored-display-form", "displayForm");
            const keptDisplayFormRef = idRef("kept-display-form", "displayForm");

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
                                                        identifier: "active-tab-widget",
                                                        ref: idRef("active-tab-widget", "insight"),
                                                        insight: idRef("active-tab-insight", "insight"),
                                                        ignoreDashboardFilters: [],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            filterContext: {
                                filterContextDefinition: {
                                    filters: [attributeFilter("active-tab-filter")],
                                },
                            },
                        },
                        {
                            localIdentifier: "tab-2",
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
                                                        identifier: "target-widget",
                                                        ref: targetWidgetRef,
                                                        insight: targetInsightRef,
                                                        ignoreDashboardFilters: [
                                                            {
                                                                type: "attributeFilterReference",
                                                                displayForm: ignoredDisplayFormRef,
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            filterContext: {
                                filterContextDefinition: {
                                    filters: [
                                        attributeFilter("ignored-on-widget", ignoredDisplayFormRef),
                                        attributeFilter("kept-on-widget", keptDisplayFormRef),
                                    ],
                                },
                            },
                        },
                    ],
                    activeTabLocalIdentifier: "tab-1",
                },
                drill: {
                    crossFiltering: {
                        "tab-1": [],
                        "tab-2": [],
                    },
                    drillableItems: {},
                },
                unavailableObjects: unavailableObjectsEntityAdapter.getInitialState(),
            } as unknown as DashboardState;

            const [dateFilters, attributeFilters] =
                selectAllFiltersForWidgetByRefAcrossTabs(targetWidgetRef)(state);

            expect(dateFilters).toEqual([]);
            expect(attributeFilters).toMatchObject([
                {
                    positiveAttributeFilter: {
                        displayForm: keptDisplayFormRef,
                    },
                },
            ]);
            expect(attributeFilters).toHaveLength(1);
        });

        it("should return empty filter arrays when the widget is not found", () => {
            const state = {
                tabs: {
                    tabs: [],
                    activeTabLocalIdentifier: "tab-1",
                },
                drill: {
                    crossFiltering: {},
                    drillableItems: {},
                },
                unavailableObjects: unavailableObjectsEntityAdapter.getInitialState(),
            } as unknown as DashboardState;

            expect(selectAllFiltersForWidgetByRefAcrossTabs(idRef("missing", "insight"))(state)).toEqual([
                [],
                [],
            ]);
        });
    });
});
