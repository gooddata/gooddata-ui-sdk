// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboardAttributeFilterConfig,
    type IDashboardLayout,
    type IInsight,
    type InsightDrillDefinition,
    type ObjRef,
    idRef,
    newInsightDefinition,
    newMeasureValueFilter,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { selectIsSaveAsNewButtonVisible, selectSaveAsVisible } from "../topBar/topBarSelectors.js";
import { type DashboardState } from "../types.js";

import {
    type IDashboardCopySourceTab,
    hasCopyBlockingReference,
    selectHasCopyBlockingReferences,
} from "./copyBlockingReferences.js";
import { unavailableObjectsActions, unavailableObjectsSliceReducer } from "./index.js";

const forbidden = (
    id: string,
    type: IUnavailableDashboardReference["type"],
): IUnavailableDashboardReference => ({
    ref: idRef(id, type),
    type,
    reason: "forbidden",
});

const unavailable: IUnavailableDashboardReference[] = [
    forbidden("restricted-viz", "insight"),
    forbidden("restricted-metric", "measure"),
    forbidden("restricted-label", "displayForm"),
    forbidden("restricted-dashboard", "analyticalDashboard"),
    forbidden("restricted-computed", "computedAttribute"),
    { ref: idRef("deleted-viz", "insight"), type: "insight", reason: "notFound" },
];

const label = (id: string) => idRef(id, "displayForm");
const measureOrigin = { type: "drillFromMeasure", measure: { localIdentifier: "m1" } } as const;

let widgetCount = 0;
const base = (type: string, extra: object = {}) => ({
    type,
    ref: idRef(`w${++widgetCount}`),
    identifier: `w${widgetCount}`,
    uri: `/w${widgetCount}`,
    title: "",
    description: "",
    ignoreDashboardFilters: [],
    drills: [],
    ...extra,
});
const insightWidget = (insight = "readable-viz", extra: object = {}) =>
    base("insight", { insight: idRef(insight, "insight"), ...extra }) as unknown as ExtendedDashboardWidget;
const withDrill = (drill: object) =>
    insightWidget("readable-viz", {
        drills: [{ localIdentifier: "d1", origin: measureOrigin, ...drill }] as InsightDrillDefinition[],
    });

function layout(
    widgets: ExtendedDashboardWidget[],
    header?: object,
): IDashboardLayout<ExtendedDashboardWidget> {
    return {
        type: "IDashboardLayout",
        sections: [
            {
                type: "IDashboardLayoutSection",
                header,
                items: widgets.map((widget) => ({
                    type: "IDashboardLayoutItem",
                    size: { xl: { gridWidth: 12 } },
                    widget,
                })),
            },
        ],
    } as IDashboardLayout<ExtendedDashboardWidget>;
}

const attributeFilter = (displayForm: ObjRef): FilterContextItem => ({
    attributeFilter: {
        displayForm,
        negativeSelection: true,
        attributeElements: { uris: [] },
        localIdentifier: "af",
    },
});

function tab(
    widgets: ExtendedDashboardWidget[],
    {
        header,
        filters = [],
        configs = [],
    }: { header?: object; filters?: FilterContextItem[]; configs?: IDashboardAttributeFilterConfig[] } = {},
): IDashboardCopySourceTab {
    return { layout: layout(widgets, header), filters, attributeFilterConfigs: configs };
}

const blocked = (...tabs: IDashboardCopySourceTab[]) => hasCopyBlockingReference(tabs, [], unavailable);

describe("hasCopyBlockingReference", () => {
    it("lets a dashboard of readable objects be copied", () => {
        expect(blocked(tab([insightWidget()], { filters: [attributeFilter(label("readable-label"))] }))).toBe(
            false,
        );
    });

    it.each([
        ["a widget showing a restricted visualization", tab([insightWidget("restricted-viz")])],
        [
            "a visualization switcher with a restricted entry",
            tab([
                base("visualizationSwitcher", {
                    visualizations: [insightWidget(), insightWidget("restricted-viz")],
                }) as unknown as ExtendedDashboardWidget,
            ]),
        ],
        [
            "a container holding a restricted visualization",
            tab([
                {
                    type: "IDashboardLayout",
                    sections: layout([insightWidget("restricted-viz")]).sections,
                } as unknown as ExtendedDashboardWidget,
            ]),
        ],
        [
            "a KPI on a restricted metric",
            tab([
                base("kpi", {
                    kpi: { metric: idRef("restricted-metric", "measure"), comparisonType: "none" },
                }) as unknown as ExtendedDashboardWidget,
            ]),
        ],
        [
            "a drill to a restricted visualization",
            tab([
                withDrill({
                    type: "drillToInsight",
                    transition: "pop-up",
                    target: idRef("restricted-viz", "insight"),
                }),
            ]),
        ],
        [
            "a drill to URL from a restricted hyperlink label",
            tab([
                withDrill({
                    type: "drillToAttributeUrl",
                    transition: "new-window",
                    target: {
                        displayForm: label("readable-label"),
                        hyperlinkDisplayForm: label("restricted-label"),
                    },
                }),
            ]),
        ],
        [
            "a custom URL drill referencing a restricted label",
            tab([
                withDrill({
                    type: "drillToCustomUrl",
                    transition: "new-window",
                    target: { url: "https://x/?a={attribute_title(restricted-label)}" },
                }),
            ]),
        ],
        [
            "rich text referencing a restricted metric",
            tab([
                base("richText", {
                    content: "Value {metric/restricted-metric}",
                }) as unknown as ExtendedDashboardWidget,
            ]),
        ],
        [
            "a widget description referencing a restricted label",
            tab([insightWidget("readable-viz", { description: "By {label/restricted-label}" })]),
        ],
        [
            "a section description referencing a restricted metric",
            tab([insightWidget()], { header: { description: "Value {metric/restricted-metric}" } }),
        ],
        [
            "a widget ignoring a filter on a restricted label",
            tab([
                insightWidget("readable-viz", {
                    ignoreDashboardFilters: [
                        { type: "attributeFilterReference", displayForm: label("restricted-label") },
                    ],
                }),
            ]),
        ],
        [
            "a filter whose Display as label is restricted",
            tab([insightWidget()], {
                configs: [{ localIdentifier: "af", displayAsLabel: label("restricted-label") }],
            }),
        ],
        [
            "a filter whose Display as label is a restricted computed attribute",
            tab([insightWidget()], {
                configs: [
                    {
                        localIdentifier: "af",
                        displayAsLabel: idRef("restricted-computed", "computedAttribute"),
                    },
                ],
            }),
        ],
        [
            "a restricted attribute filter, hidden or not",
            tab([insightWidget()], { filters: [attributeFilter(label("restricted-label"))] }),
        ],
    ])("refuses %s", (_, restrictedTab) => {
        expect(blocked(restrictedTab)).toBe(true);
    });

    it("refuses restricted objects on a tab other than the first", () => {
        expect(blocked(tab([insightWidget()]), tab([insightWidget("restricted-viz")]))).toBe(true);
    });

    it.each([
        [
            "a drill to a dashboard the user cannot open",
            tab([
                withDrill({
                    type: "drillToDashboard",
                    transition: "in-place",
                    target: idRef("restricted-dashboard", "analyticalDashboard"),
                }),
            ]),
        ],
        [
            "a measure value filter on a restricted metric",
            tab([insightWidget()], {
                filters: [
                    {
                        dashboardMeasureValueFilter: {
                            measure: idRef("restricted-metric", "measure"),
                            localIdentifier: "mvf",
                        },
                    } as FilterContextItem,
                ],
            }),
        ],
        [
            "rich text whose restricted references were removed",
            tab([base("richText", { content: "Value ???" }) as unknown as ExtendedDashboardWidget]),
        ],
        ["a widget whose visualization is merely deleted", tab([insightWidget("deleted-viz")])],
    ])("accepts %s", (_, allowedTab) => {
        expect(blocked(allowedTab)).toBe(false);
    });
});

describe("custom URL drills resolved against the current insight", () => {
    // the drill stores the references from its last save; Save as new recomputes them from the insight
    const insightFilteringBy = (metric: string): IInsight => {
        const definition = newInsightDefinition("local:table", (builder) =>
            builder.filters([newMeasureValueFilter(idRef(metric, "measure"), "GREATER_THAN", 1)]),
        );
        return {
            insight: {
                ...definition.insight,
                identifier: "readable-viz",
                uri: "/readable-viz",
                ref: idRef("readable-viz", "insight"),
            },
        } as IInsight;
    };
    const mvfDrill = (metric: string, storedMetric: string) =>
        tab([
            withDrill({
                type: "drillToCustomUrl",
                transition: "new-window",
                target: {
                    url: `https://x/?c={mvf_condition(${metric})}`,
                    references: { [`{mvf_condition(${metric})}`]: [idRef(storedMetric, "measure")] },
                },
            }),
        ]);

    it("accepts a drill whose stored reference is restricted but whose insight now filters by a readable metric", () => {
        expect(
            hasCopyBlockingReference(
                [mvfDrill("readable-metric", "restricted-metric")],
                [insightFilteringBy("readable-metric")],
                unavailable,
            ),
        ).toBe(false);
    });

    it("refuses a drill whose stored reference is readable but whose insight now filters by a restricted metric", () => {
        expect(
            hasCopyBlockingReference(
                [mvfDrill("restricted-metric", "readable-metric")],
                [insightFilteringBy("restricted-metric")],
                unavailable,
            ),
        ).toBe(true);
    });
});

describe("selectHasCopyBlockingReferences", () => {
    // the restricted filter was removed in edit mode but is still in the saved filter context
    const stateIn = (renderMode: "view" | "edit") =>
        ({
            renderMode: { renderMode },
            tabs: {
                tabs: [
                    {
                        localIdentifier: "tab",
                        layout: { layout: layout([insightWidget()]) },
                        filterContext: {
                            filterContextDefinition: { filters: [] },
                            originalFilterContextDefinition: {
                                filters: [attributeFilter(label("restricted-label"))],
                            },
                        },
                        attributeFilterConfigs: { attributeFilterConfigs: [] },
                    },
                ],
            },
            insights: { ids: [], entities: {} },
            unavailableObjects: unavailableObjectsSliceReducer(
                undefined,
                unavailableObjectsActions.setUnavailableObjects(unavailable),
            ),
        }) as unknown as DashboardState;

    it("checks the saved filters in view mode, where the copy is made from them", () => {
        expect(selectHasCopyBlockingReferences(stateIn("view"))).toBe(true);
    });

    it("checks the edited filters in edit mode", () => {
        expect(selectHasCopyBlockingReferences(stateIn("edit"))).toBe(false);
    });
});

// The combiners are called directly so we don't have to build the full dashboard state.
const combinerOf = (selector: unknown) =>
    (selector as { resultFunc: (...args: unknown[]) => boolean }).resultFunc;

describe("Save as new visibility", () => {
    it("hides the standalone button when the copy would be refused", () => {
        expect(combinerOf(selectIsSaveAsNewButtonVisible)(false, false, true, false, false, true)).toBe(
            false,
        );
        expect(combinerOf(selectIsSaveAsNewButtonVisible)(false, false, true, false, false, false)).toBe(
            true,
        );
    });

    it("hides the menu item when the copy would be refused", () => {
        expect(combinerOf(selectSaveAsVisible)(false, true, false, {}, true)).toBe(false);
        expect(combinerOf(selectSaveAsVisible)(false, true, false, {}, false)).toBe(true);
    });
});
