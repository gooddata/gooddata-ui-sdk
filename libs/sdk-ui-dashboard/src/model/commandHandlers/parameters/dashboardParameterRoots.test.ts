// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IDashboard,
    type IInsight,
    type ITempFilterContext,
    idRef,
} from "@gooddata/sdk-model";

import { collectDashboardParameterRoots, collectTextReferenceRoots } from "./dashboardParameterRoots.js";

const revenueRef = idRef("revenue", "measure");
const marginRef = idRef("margin", "measure");
const tierRef = idRef("tier", "computedAttribute");
const insightRef = idRef("insight-1", "insight");

const insight = {
    insight: {
        ref: insightRef,
        identifier: "insight-1",
        uri: "/insights/insight-1",
        summary: "Margin {metric/margin}",
    },
} as IInsight;

const section = (header: string | undefined, widgets: unknown[]) => ({
    type: "IDashboardLayoutSection",
    header: header === undefined ? undefined : { description: header },
    items: widgets.map((widget) => ({ type: "IDashboardLayoutItem", size: {}, widget })),
});

const dashboardWith = (...sections: unknown[]) =>
    ({
        tabs: [
            {
                localIdentifier: "tab-1",
                title: "Tab 1",
                layout: { type: "IDashboardLayout", sections },
            },
        ],
    }) as never;

describe("collectDashboardParameterRoots", () => {
    it("collects the insights and the roots of rich text, descriptions and section headers", () => {
        const dashboard = dashboardWith(
            section("Tier {computed_attribute/tier}", [
                { type: "richText", ref: idRef("rt-1"), content: "Revenue {metric/revenue}" },
                { type: "insight", ref: idRef("w-1"), insight: insightRef },
            ]),
        );

        expect(collectDashboardParameterRoots(dashboard, [insight])).toEqual([
            insightRef,
            tierRef,
            revenueRef,
            marginRef,
        ]);
    });

    it("takes the widget's own description where the insight is unavailable", () => {
        const dashboard = dashboardWith(
            section(undefined, [
                {
                    type: "insight",
                    ref: idRef("w-1"),
                    insight: insightRef,
                    description: "Revenue {metric/revenue}",
                },
            ]),
        );

        expect(collectDashboardParameterRoots(dashboard, [])).toEqual([revenueRef]);
    });

    it("lists a root once however many texts name it", () => {
        const dashboard = dashboardWith(
            section("Revenue {metric/revenue}", [
                { type: "richText", ref: idRef("rt-1"), content: "Revenue {metric/revenue}" },
            ]),
        );

        expect(collectDashboardParameterRoots(dashboard, [])).toEqual([revenueRef]);
    });

    it("collects filter roots from every tab and the root filter context", () => {
        const dashboard = buildDashboard({
            tabs: [
                {
                    localIdentifier: "tab-1",
                    title: "Tab 1",
                    filterContext: filterContext([
                        {
                            dashboardMeasureValueFilter: {
                                measure: revenueRef,
                                localIdentifier: "revenue-filter",
                            },
                        },
                    ]),
                },
                {
                    localIdentifier: "tab-2",
                    title: "Tab 2",
                    filterContext: filterContext([
                        {
                            dashboardMeasureValueFilter: {
                                measure: marginRef,
                                localIdentifier: "margin-filter",
                            },
                        },
                    ]),
                },
            ],
            filterContext: filterContext([
                {
                    attributeFilter: {
                        displayForm: tierRef,
                        negativeSelection: false,
                        attributeElements: { values: [] },
                        localIdentifier: "tier-filter",
                    },
                },
            ]),
        });

        expect(collectDashboardParameterRoots(dashboard, [])).toEqual([revenueRef, marginRef, tierRef]);
    });

    it("collects root filter context roots from a dashboard without tabs", () => {
        const dashboard = buildDashboard({
            filterContext: filterContext([
                {
                    dashboardMeasureValueFilter: {
                        measure: revenueRef,
                        localIdentifier: "revenue-filter",
                    },
                },
            ]),
        });

        expect(collectDashboardParameterRoots(dashboard, [])).toEqual([revenueRef]);
    });

    it("lists a root once when a filter and text reference the same object", () => {
        const dashboard = buildDashboard({
            layout: {
                type: "IDashboardLayout",
                sections: [
                    {
                        type: "IDashboardLayoutSection",
                        header: { description: "Revenue {metric/revenue}" },
                        items: [],
                    },
                ],
            },
            filterContext: filterContext([
                {
                    dashboardMeasureValueFilter: {
                        measure: revenueRef,
                        localIdentifier: "revenue-filter",
                    },
                },
            ]),
        });

        expect(collectDashboardParameterRoots(dashboard, [])).toEqual([revenueRef]);
    });
});

describe("collectTextReferenceRoots", () => {
    it("keeps the objects a text executes, each spelled with its own type", () => {
        expect(collectTextReferenceRoots("Revenue {metric/revenue} per {computed_attribute/tier}")).toEqual([
            idRef("revenue", "measure"),
            idRef("tier", "computedAttribute"),
        ]);
    });

    it("lists a root once however often the text names it", () => {
        expect(collectTextReferenceRoots("{metric/revenue} of {metric/revenue}")).toEqual([
            idRef("revenue", "measure"),
        ]);
    });

    it("leaves out what no execution resolves", () => {
        expect(collectTextReferenceRoots("{label/city} in {parameter/topN}")).toEqual([]);
    });

    it("has no roots for a text without references", () => {
        expect(collectTextReferenceRoots("Plain words")).toEqual([]);
    });
});

function buildDashboard(dashboard: Partial<IDashboard>): IDashboard {
    return {
        type: "IDashboard",
        ref: idRef("dashboard-1", "analyticalDashboard"),
        identifier: "dashboard-1",
        uri: "/dashboard-1",
        title: "Dashboard",
        description: "",
        created: "",
        updated: "",
        shareStatus: "private",
        ...dashboard,
    };
}

function filterContext(filters: FilterContextItem[]): ITempFilterContext {
    return {
        ref: idRef("filter-context"),
        uri: "/filter-context",
        created: "2026-09-22 00:00:00",
        filters,
    };
}
