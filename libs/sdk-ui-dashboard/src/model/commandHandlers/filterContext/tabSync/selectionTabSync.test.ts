// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type Action } from "@reduxjs/toolkit";
import { produce } from "immer";
import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type IDashboardParameter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { filterContextReducers } from "../../../store/tabs/filterContext/filterContextReducers.js";
import {
    type FilterContextState,
    type WorkingFilterContextItem,
} from "../../../store/tabs/filterContext/filterContextState.js";
import {
    type CrossFilteringLocalIdsByTab,
    seedSyncedTabFilters,
} from "../../../store/tabs/filterContext/filterSync.js";
import { tabsActions, tabsSliceReducer } from "../../../store/tabs/index.js";
import { tabsReducers } from "../../../store/tabs/tabsReducers.js";
import { type ITabState, type ITabsState } from "../../../store/tabs/tabsState.js";

import { expandActionsForTabSync } from "./expandActionsForTabSync.js";

const displayForm = idRef("region.name", "displayForm");
const otherDisplayForm = idRef("region.code", "displayForm");
const dataSet = idRef("created", "dataSet");
const measure = idRef("amount", "measure");
const parameterRef = idRef("topN", "parameter");

const parameter: IDashboardParameter = {
    ref: parameterRef,
    parameterType: "NUMBER",
    mode: "active",
};

function displayFormMeta(
    id: string,
    attributeId: string,
    attributeType: "attribute" | "computedAttribute" = "attribute",
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        id,
        uri: `/${id}`,
        ref: idRef(id, "displayForm"),
        title: id,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(attributeId, attributeType),
    };
}

function attributeFilter(
    localIdentifier: string,
    form: typeof displayForm,
    uris: string[],
): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm: form,
            negativeSelection: false,
            attributeElements: { uris },
            localIdentifier,
        },
    };
}

function dateFilter(localIdentifier: string, from: number): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
            dataSet,
            localIdentifier,
            from,
            to: 0,
        },
    };
}

function measureFilter(
    localIdentifier: string,
    value: number,
    dimensionality?: ObjRef[],
): IDashboardMeasureValueFilter {
    return {
        dashboardMeasureValueFilter: {
            measure,
            localIdentifier,
            conditions: [{ comparison: { operator: "GREATER_THAN", value } }],
            ...(dimensionality?.length ? { dimensionality } : {}),
        },
    };
}

function filterContext(
    filters: FilterContextItem[],
    working: WorkingFilterContextItem[] = [],
    original?: FilterContextItem[],
): FilterContextState {
    return {
        filtersWithInvalidSelection: [],
        filterContextDefinition: { title: "", description: "", filters },
        workingFilterContextDefinition: { filters: working },
        ...(original
            ? { originalFilterContextDefinition: { title: "", description: "", filters: original } }
            : {}),
    };
}

function allAttributeFilter(localIdentifier: string, form: typeof displayForm): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm: form,
            negativeSelection: true,
            attributeElements: { uris: [] },
            localIdentifier,
        },
    };
}

function makeState(tabs: ITabState[]): ITabsState {
    return {
        tabs,
        activeTabLocalIdentifier: tabs[0]?.localIdentifier,
    };
}

function run<TState extends ITabsState>(state: TState, recipe: (draft: TState) => void): ITabsState {
    return produce(state, recipe) as ITabsState;
}

/**
 * Applies `actions` on the active tab together with their synced copies for the other tabs.
 */
function sync(
    state: ITabsState,
    actions: Action | Action[],
    crossFilteringLocalIdsByTab: CrossFilteringLocalIdsByTab = {},
): ITabsState {
    const expanded = expandActionsForTabSync(state, ([] as Action[]).concat(actions), {
        enabled: true,
        sourceTabLocalIdentifier: state.activeTabLocalIdentifier,
        crossFilteringLocalIdsByTab,
    });
    return expanded.reduce(tabsSliceReducer, state);
}

describe("view mode tab sync", () => {
    it("updates only the active tab when the flag is off", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-0", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-migrated", displayForm, ["east"])]),
            },
        ]);

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-0",
                    elements: { uris: ["west"] },
                    negativeSelection: true,
                }),
            );
        });

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "region-0",
                attributeElements: { uris: ["west"] },
                negativeSelection: true,
            },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region-migrated", displayForm, ["east"]),
        ]);
    });

    it("mirrors an attribute selection to the same display form when local identifiers differ", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([
                    attributeFilter("region_0_attributeFilter", displayForm, ["east"]),
                ]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("migrated-region", displayForm, ["east"])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region_0_attributeFilter",
                elements: { uris: ["west"] },
                negativeSelection: false,
            }),
        );

        const mirrored = next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0];
        expect(mirrored).toMatchObject({
            attributeFilter: {
                localIdentifier: "migrated-region",
                attributeElements: { uris: ["west"] },
            },
        });
    });

    it("restores each tab to its own original selection on reset", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [attributeFilter("region-a", displayForm, ["west"])],
                    [],
                    [allAttributeFilter("region-a", displayForm)],
                ),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext(
                    [attributeFilter("region-b", displayForm, ["west"])],
                    [],
                    [attributeFilter("region-b", displayForm, ["east"])],
                ),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region-a",
                elements: { uris: [] },
                negativeSelection: true,
                restoreTargetOriginal: true,
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { attributeElements: { uris: [] }, negativeSelection: true },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "region-b",
                attributeElements: { uris: ["east"] },
                negativeSelection: false,
            },
        });
        expect(next.tabs?.[1]?.filterContext?.originalFilterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { attributeElements: { uris: ["east"] } },
        });
    });

    it("does not match a computed attribute shown in another display form", () => {
        const name = idRef("segment.name", "displayForm");
        const code = idRef("segment.code", "displayForm");
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: {
                    ...filterContext([attributeFilter("segment-a", name, ["retail"])]),
                    attributeFilterDisplayForms: [
                        displayFormMeta("segment.name", "segment", "computedAttribute"),
                    ],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: {
                    ...filterContext([attributeFilter("segment-b", code, ["retail"])]),
                    attributeFilterDisplayForms: [
                        displayFormMeta("segment.code", "segment", "computedAttribute"),
                    ],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "segment-a",
                elements: { uris: ["online"] },
                negativeSelection: false,
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toEqual(
            attributeFilter("segment-b", code, ["retail"]),
        );
    });

    describe("when the counterpart is configured differently", () => {
        const tabWith = (
            localIdentifier: string,
            filterLocalId: string,
            config: Omit<IDashboardAttributeFilterConfig, "localIdentifier">,
            selectionMode: "single" | "multi" = "multi",
        ): ITabState => ({
            localIdentifier,
            filterContext: filterContext([
                {
                    attributeFilter: {
                        ...attributeFilter(filterLocalId, displayForm, ["east"]).attributeFilter,
                        selectionMode,
                    },
                },
            ]),
            attributeFilterConfigs: {
                attributeFilterConfigs: [{ localIdentifier: filterLocalId, ...config }],
            },
        });
        const selectWest = tabsActions.updateAttributeFilterSelection({
            filterLocalId: "region-a",
            elements: { uris: ["west"] },
            negativeSelection: false,
        });
        const selectionOnTabB = (state: ITabsState) => {
            const filter = state.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0];
            return (filter as IDashboardAttributeFilter | undefined)?.attributeFilter.attributeElements;
        };

        it("does not sync a filter with another display-as label", () => {
            const next = sync(
                makeState([
                    tabWith("tab-a", "region-a", { displayAsLabel: otherDisplayForm }),
                    tabWith("tab-b", "region-b", {}),
                ]),
                selectWest,
            );

            expect(selectionOnTabB(next)).toEqual({ uris: ["east"] });
        });

        it.each([
            [
                "List",
                { selectionType: "list" as const },
                "List or Text",
                { selectionType: "listOrText" as const },
            ],
            [
                "List or Text",
                { selectionType: "listOrText" as const },
                "List",
                { selectionType: "list" as const },
            ],
            ["List", { selectionType: "list" as const }, "default List or Text", {}],
            ["default List or Text", {}, "List", { selectionType: "list" as const }],
        ] as const)("syncs a list selection from $0 to $2", (_, sourceConfig, __, targetConfig) => {
            const next = sync(
                makeState([
                    tabWith("tab-a", "region-a", sourceConfig),
                    tabWith("tab-b", "region-b", targetConfig),
                ]),
                selectWest,
            );

            expect(selectionOnTabB(next)).toEqual({ uris: ["west"] });
        });

        it("does not sync a list selection to a text-only filter", () => {
            const next = sync(
                makeState([
                    tabWith("tab-a", "region-a", { selectionType: "listOrText" }),
                    tabWith("tab-b", "region-b", { selectionType: "text" }),
                ]),
                selectWest,
            );

            expect(selectionOnTabB(next)).toEqual({ uris: ["east"] });
        });

        it.each([
            ["does not sync", "multi", ["east"]],
            ["syncs", "single", ["west"]],
        ] as const)(
            "%s a single value filter with a %s value filter of the same selection type",
            (_, targetSelectionMode, expectedUris) => {
                const next = sync(
                    makeState([
                        tabWith("tab-a", "region-a", { selectionType: "list" }, "single"),
                        tabWith("tab-b", "region-b", { selectionType: "list" }, targetSelectionMode),
                    ]),
                    selectWest,
                );

                expect(selectionOnTabB(next)).toEqual({ uris: expectedUris });
            },
        );

        it("syncs a filter whose explicit config equals the defaults of the other", () => {
            const next = sync(
                makeState([
                    tabWith("tab-a", "region-a", {
                        displayAsLabel: displayForm,
                        selectionType: "listOrText",
                    }),
                    tabWith("tab-b", "region-b", {}),
                ]),
                selectWest,
            );

            expect(selectionOnTabB(next)).toEqual({ uris: ["west"] });
        });
    });

    it("does not create a filter on a tab that has no counterpart", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("product-b", otherDisplayForm, ["sku"])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region-a",
                elements: { uris: ["west"] },
                negativeSelection: false,
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("product-b", otherDisplayForm, ["sku"]),
        ]);
    });

    it("does not mirror a working-selection edit", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region-a",
                elements: { uris: ["west"] },
                negativeSelection: false,
                isWorkingSelectionChange: true,
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region-a", displayForm, ["east"]),
        ]);
        expect(next.tabs?.[0]?.filterContext?.workingFilterContextDefinition?.filters).toMatchObject([
            { attributeFilter: { attributeElements: { uris: ["west"] } } },
        ]);
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region-b", displayForm, ["east"]),
        ]);
        expect(next.tabs?.[1]?.filterContext?.workingFilterContextDefinition?.filters).toEqual([]);
    });

    describe("cross-filtering virtual filters", () => {
        it("does not mirror a selection of a virtual filter to other tabs", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("virtual-region", displayForm, ["east"])]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                },
            ]);

            const next = sync(
                initial,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "virtual-region",
                    elements: { uris: ["clicked"] },
                    negativeSelection: false,
                }),
                { "tab-a": ["virtual-region"] },
            );

            expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
                attributeFilter: { attributeElements: { uris: ["clicked"] } },
            });
            expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
                attributeFilter("region-b", displayForm, ["east"]),
            ]);
        });

        it("does not write a selection into a virtual filter on another tab", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([
                        attributeFilter("virtual-b", displayForm, ["clicked"]),
                        attributeFilter("region-b", displayForm, ["east"]),
                    ]),
                },
            ]);

            const next = sync(
                initial,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-a",
                    elements: { uris: ["west"] },
                    negativeSelection: false,
                }),
                { "tab-b": ["virtual-b"] },
            );

            expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
                attributeFilter("virtual-b", displayForm, ["clicked"]),
                attributeFilter("region-b", displayForm, ["west"]),
            ]);
        });

        it("does not mirror a replaced virtual filter to other tabs", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("virtual-region", displayForm, ["east"])]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                },
            ]);

            const next = sync(
                initial,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "virtual-region",
                    filter: attributeFilter("virtual-region", displayForm, ["clicked"]),
                }),
                { "tab-a": ["virtual-region"] },
            );

            expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
                attributeFilter("region-b", displayForm, ["east"]),
            ]);
        });

        it("does not clear other tabs when a virtual filter is cleared", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("virtual-region", displayForm, ["east"])]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                },
            ]);

            const next = sync(
                initial,
                tabsActions.clearAttributeFiltersSelection({
                    filterLocalIds: ["virtual-region"],
                }),
                { "tab-a": ["virtual-region"] },
            );

            expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
                attributeFilter("region-b", displayForm, ["east"]),
            ]);
        });

        it("does not mirror a committed virtual filter to other tabs", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext(
                        [attributeFilter("virtual-region", displayForm, ["east"])],
                        [
                            {
                                attributeFilter: {
                                    localIdentifier: "virtual-region",
                                    attributeElements: { uris: ["clicked"] },
                                    negativeSelection: false,
                                },
                            },
                        ],
                    ),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                },
            ]);

            const next = sync(initial, tabsActions.applyWorkingSelection({}), {
                "tab-a": ["virtual-region"],
            });

            expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
                attributeFilter("region-b", displayForm, ["east"]),
            ]);
        });
    });

    it("mirrors a date filter by data set and keeps the target local identifier", () => {
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([dateFilter("date_0", -7)]) },
            { localIdentifier: "tab-b", filterContext: filterContext([dateFilter("date-migrated", -7)]) },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.date",
                dataSet,
                from: -30,
                to: 0,
                localIdentifier: "date_0",
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { localIdentifier: "date-migrated", from: -30 },
        });
    });

    it("mirrors the common date filter", () => {
        const common = (from: number): IDashboardDateFilter => ({
            dateFilter: { type: "relative", granularity: "GDC.time.year", from, to: 0 },
        });
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([common(-1)]) },
            { localIdentifier: "tab-b", filterContext: filterContext([common(-1)]) },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.year",
                from: -3,
                to: 0,
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { from: -3, granularity: "GDC.time.year" },
        });
    });

    it("mirrors a committed common date filter onto a tab that is all time", () => {
        const lastSevenDays: IDashboardDateFilter = {
            dateFilter: { type: "relative", granularity: "GDC.time.date", from: -6, to: 0 },
        };
        const region = attributeFilter("region-b", displayForm, ["east"]);
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([], [lastSevenDays]) },
            { localIdentifier: "tab-b", filterContext: filterContext([region]) },
        ]);
        const next = sync(initial, tabsActions.applyWorkingSelection({}));
        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters).toEqual([lastSevenDays]);
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            lastSevenDays,
            region,
        ]);
    });
    it("does not add a common date filter when the committed value is all time", () => {
        const allTime: IDashboardDateFilter = {
            dateFilter: { type: "relative", granularity: "GDC.time.date" },
        };
        const lastYear: IDashboardDateFilter = {
            dateFilter: { type: "relative", granularity: "GDC.time.year", from: -1, to: 0 },
        };
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([lastYear], [allTime]) },
            { localIdentifier: "tab-b", filterContext: filterContext([]) },
        ]);
        const next = sync(initial, tabsActions.applyWorkingSelection({}));
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([]);
    });

    it("restores each tab to its own original date filter on reset", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([dateFilter("date-a", -30)], [], [dateFilter("date-a", -7)]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([dateFilter("date-b", -30)], [], [dateFilter("date-b", -1)]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.date",
                dataSet,
                from: -7,
                to: 0,
                localIdentifier: "date-a",
                restoreTargetOriginal: true,
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { localIdentifier: "date-a", from: -7 },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { localIdentifier: "date-b", from: -1 },
        });
    });

    it("restores all time when a common date filter has no saved original", () => {
        const common = (from: number): IDashboardDateFilter => ({
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.year",
                from,
                to: 0,
                localIdentifier: "common",
            },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([common(-3)], [], [common(-1)]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext(
                    [common(-3), attributeFilter("region-b", displayForm, ["east"])],
                    [],
                    [attributeFilter("region-b", displayForm, ["east"])],
                ),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: 0,
                localIdentifier: "common",
                restoreTargetOriginal: true,
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { from: -1, localIdentifier: "common" },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region-b", displayForm, ["east"]),
        ]);
    });

    it("restores a saved common date filter when the source reset is all time", () => {
        const common = (from: number, localIdentifier: string): IDashboardDateFilter => ({
            dateFilter: { type: "relative", granularity: "GDC.time.year", from, to: 0, localIdentifier },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([common(-3, "common-a")]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([], [], [common(-5, "common-b")]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "allTime",
                restoreTargetOriginal: true,
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters).toEqual([]);
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { localIdentifier: "common-b", from: -5, granularity: "GDC.time.year" },
        });
    });

    it("leaves a date filter unchanged when the other tab has no saved original", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([dateFilter("date-a", -30)], [], [dateFilter("date-a", -7)]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([dateFilter("date-b", -30)]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.date",
                dataSet,
                from: -7,
                to: 0,
                localIdentifier: "date-a",
                restoreTargetOriginal: true,
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            dateFilter("date-b", -30),
        ]);
    });

    it("mirrors a measure value filter by measure ref when local identifiers differ", () => {
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf_0", 1)]) },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([measureFilter("mvf-migrated", 1)]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dashboardMeasureValueFilter: {
                localIdentifier: "mvf-migrated",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            },
        });
    });

    it("mirrors a measure value filter when the measure and dimensionality match", () => {
        const region = idRef("region", "attribute");
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([measureFilter("mvf_0", 1, [region])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([measureFilter("mvf-b", 1, [region])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toEqual(
            measureFilter("mvf-b", 50, [region]),
        );
    });

    it("does not mirror a measure value filter when only one side has dimensionality", () => {
        const region = idRef("region", "attribute");
        const target = measureFilter("mvf-b", 1, [region]);
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf_0", 1)]) },
            { localIdentifier: "tab-b", filterContext: filterContext([target]) },
        ]);

        const next = sync(
            initial,
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 1_000_000 } }],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not mirror a measure value filter onto a different dimensionality of the same measure", () => {
        const region = idRef("region", "attribute");
        const product = idRef("product", "attribute");
        const target = measureFilter("mvf-b", 1, [product]);
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([measureFilter("mvf_0", 1, [region])]),
            },
            { localIdentifier: "tab-b", filterContext: filterContext([target]) },
        ]);

        const next = sync(
            initial,
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("mirrors a committed measure value filter when the measure and dimensionality match", () => {
        const region = idRef("region", "attribute");
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [measureFilter("mvf_0", 1, [region])],
                    [
                        {
                            dashboardMeasureValueFilter: {
                                localIdentifier: "mvf_0",
                                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                            },
                        },
                    ],
                ),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([measureFilter("mvf-b", 1, [region])]),
            },
        ]);

        const next = sync(initial, tabsActions.applyWorkingSelection({}));

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            measureFilter("mvf-b", 50, [region]),
        ]);
    });

    it("keeps the target dimensionality when committing a measure value filter", () => {
        const region = idRef("region", "attribute");
        const source = measureFilter("mvf_0", 1);
        const target = measureFilter("mvf-b", 1, [region]);
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [source],
                    [
                        {
                            dashboardMeasureValueFilter: {
                                localIdentifier: "mvf_0",
                                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                            },
                        },
                    ],
                ),
            },
            { localIdentifier: "tab-b", filterContext: filterContext([target]) },
        ]);

        const next = sync(initial, tabsActions.applyWorkingSelection({}));

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dashboardMeasureValueFilter: {
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not mirror a measure value filter onto a different measure that shares its local identifier", () => {
        const headcount = idRef("headcount", "measure");
        const target = {
            dashboardMeasureValueFilter: {
                measure: headcount,
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN" as const, value: 10 } }],
            },
        };
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf_0", 1)]) },
            { localIdentifier: "tab-b", filterContext: filterContext([target]) },
        ]);

        const next = sync(
            initial,
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf_0",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 1_000_000 } }],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("clears the matching attribute filter on every tab", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.clearAttributeFiltersSelection({
                filterLocalIds: ["region-a"],
            }),
        );

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { attributeElements: { uris: [] }, negativeSelection: true },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "region-b",
                attributeElements: { uris: [] },
                negativeSelection: true,
            },
        });
    });

    it("clears a list selection on a tab whose selection type is the default list or text", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-a", selectionType: "list" }],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
            },
        ]);

        const next = sync(
            initial,
            tabsActions.clearAttributeFiltersSelection({
                filterLocalIds: ["region-a"],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "region-b",
                attributeElements: { uris: [] },
                negativeSelection: true,
            },
        });
    });

    it("does not commit a staged list selection onto a text-only filter", () => {
        const target = allAttributeFilter("region-b", displayForm);
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [allAttributeFilter("region-a", displayForm)],
                    [attributeFilter("region-a", displayForm, ["west"])],
                ),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([target]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "text" }],
                },
            },
        ]);

        const next = sync(initial, tabsActions.applyWorkingSelection({}));

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not change the display form of a text-only filter", () => {
        const target = allAttributeFilter("region-b", displayForm);
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([allAttributeFilter("region-a", displayForm)]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([target]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "text" }],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.changeAttributeDisplayForm({
                filterLocalId: "region-a",
                displayForm: otherDisplayForm,
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not clear a list selection on a text-only filter", () => {
        const target = attributeFilter("region-b", displayForm, ["east"]);
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([target]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "text" }],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.clearAttributeFiltersSelection({
                filterLocalIds: ["region-a"],
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not copy a text filter onto a different label of the same attribute", () => {
        const name = idRef("region.name", "displayForm");
        const code = idRef("region.code", "displayForm");
        const text = (localIdentifier: string, form: ObjRef, values: string[]) => ({
            arbitraryAttributeFilter: {
                displayForm: form,
                localIdentifier,
                negativeSelection: false,
                values,
            },
        });
        const target = text("text-b", code, ["E"]);
        const displayForms = [
            displayFormMeta("region.name", "region"),
            displayFormMeta("region.code", "region"),
        ];
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: {
                    ...filterContext([text("text-a", name, ["East"])]),
                    attributeFilterDisplayForms: displayForms,
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: {
                    ...filterContext([target]),
                    attributeFilterDisplayForms: displayForms,
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "text-a",
                filter: text("text-a", name, ["West"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("mirrors a text filter replacement by display form and keeps the target local identifier", () => {
        const text = (localIdentifier: string, values: string[]) => ({
            arbitraryAttributeFilter: {
                displayForm,
                localIdentifier,
                negativeSelection: false,
                values,
            },
        });
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([text("text-a", ["east"])]) },
            { localIdentifier: "tab-b", filterContext: filterContext([text("text-b", ["east"])]) },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "text-a",
                filter: text("text-a", ["west"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toEqual(
            text("text-b", ["west"]),
        );
    });

    it("does not replace a list-only target with a text filter", () => {
        const text = (values: string[]) => ({
            arbitraryAttributeFilter: {
                displayForm,
                localIdentifier: "text-a",
                negativeSelection: false,
                values,
            },
        });
        const target = attributeFilter("list-b", displayForm, ["east"]);
        const initial = makeState([
            { localIdentifier: "tab-a", filterContext: filterContext([text(["east"])]) },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([target]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [
                        {
                            localIdentifier: "list-b",
                            selectionType: "list",
                        },
                    ],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "text-a",
                filter: text(["west"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
    });

    it("does not apply a contains value to a list-only filter", () => {
        const contains = (localIdentifier: string, literal: string) => ({
            matchAttributeFilter: {
                displayForm,
                localIdentifier,
                operator: "contains" as const,
                literal,
            },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "list" }],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: contains("region-a", "West"),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region-b", displayForm, ["east"]),
        ]);
    });

    it("syncs the next list value after a list-only filter rejects a contains value", () => {
        const contains = (localIdentifier: string, literal: string) => ({
            matchAttributeFilter: {
                displayForm,
                localIdentifier,
                operator: "contains" as const,
                literal,
            },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-a", selectionType: "listOrText" }],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "list" }],
                },
            },
        ]);

        const next = sync(initial, [
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: contains("region-a", "W"),
            }),
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: attributeFilter("region-a", displayForm, ["north"]),
            }),
        ]);

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { attributeElements: { uris: ["north"] } },
        });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { localIdentifier: "region-b", attributeElements: { uris: ["north"] } },
        });
    });

    it("restores a list-only filter to its own original after a rejected text value", () => {
        const contains = (localIdentifier: string, literal: string) => ({
            matchAttributeFilter: {
                displayForm,
                localIdentifier,
                operator: "contains" as const,
                literal,
            },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [attributeFilter("region-a", displayForm, ["east"])],
                    [],
                    [attributeFilter("region-a", displayForm, ["saved-a"])],
                ),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-a", selectionType: "listOrText" }],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext(
                    [attributeFilter("region-b", displayForm, ["east"])],
                    [],
                    [attributeFilter("region-b", displayForm, ["saved-b"])],
                ),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "list" }],
                },
            },
        ]);

        const afterText = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: contains("region-a", "W"),
            }),
        );
        const reset = sync(
            afterText,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: attributeFilter("region-a", displayForm, ["saved-a"]),
                restoreTargetOriginal: true,
            }),
        );

        expect(reset.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { localIdentifier: "region-a", attributeElements: { uris: ["saved-a"] } },
        });
        expect(reset.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { localIdentifier: "region-b", attributeElements: { uris: ["saved-b"] } },
        });
    });

    it("applies a text value from a list or text filter to a text filter", () => {
        const text = (localIdentifier: string, values: string[]) => ({
            arbitraryAttributeFilter: {
                displayForm,
                localIdentifier,
                negativeSelection: false,
                values,
            },
        });
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("region-a", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-a", selectionType: "listOrText" }],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                attributeFilterConfigs: {
                    attributeFilterConfigs: [{ localIdentifier: "region-b", selectionType: "text" }],
                },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: text("region-a", ["West"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toEqual(
            text("region-b", ["West"]),
        );
    });

    it("does not match a text filter by local id when the attributes differ", () => {
        const product = idRef("product.name", "displayForm");
        const text = {
            arbitraryAttributeFilter: {
                displayForm: product,
                localIdentifier: "shared",
                negativeSelection: false,
                values: ["sku"],
            },
        };
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("shared", displayForm, ["east"])]),
            },
            { localIdentifier: "tab-b", filterContext: filterContext([text]) },
        ]);

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "shared",
                filter: attributeFilter("shared", displayForm, ["west"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([text]);
    });

    it("does not match a list filter to a text filter of the same attribute shown in another label", () => {
        const name = idRef("region.name", "displayForm");
        const code = idRef("region.code", "displayForm");
        // Drop `attribute` so identity is resolved only through attributesWithReferences.
        const withoutAttribute = (id: string): IAttributeDisplayFormMetadataObject => {
            const { attribute: _attribute, ...rest } = displayFormMeta(id, "region");
            return rest as IAttributeDisplayFormMetadataObject;
        };
        const text = {
            arbitraryAttributeFilter: {
                displayForm: code,
                localIdentifier: "shared",
                negativeSelection: false,
                values: ["E"],
            },
        };
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext([attributeFilter("shared", name, ["east"])]),
            },
            { localIdentifier: "tab-b", filterContext: filterContext([text]) },
        ]);
        initial.attributesWithReferences = [
            {
                attribute: {
                    type: "attribute",
                    id: "region",
                    uri: "/region",
                    ref: idRef("region", "attribute"),
                    title: "region",
                    description: "",
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    displayForms: [withoutAttribute("region.name"), withoutAttribute("region.code")],
                },
            },
        ];

        const next = sync(
            initial,
            tabsActions.replaceAttributeFilterItem({
                filterLocalId: "shared",
                filter: attributeFilter("shared", name, ["west"]),
            }),
        );

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toEqual(text);
    });

    it("mirrors committed working filters and parameters, not the working overlay", () => {
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [attributeFilter("region-a", displayForm, ["east"])],
                    [
                        {
                            attributeFilter: {
                                displayForm,
                                localIdentifier: "region-a",
                                attributeElements: { uris: ["west"] },
                                negativeSelection: false,
                            },
                        },
                    ],
                ),
                parameters: {
                    parameters: [{ parameter, runtimeOverride: 1, workingOverride: 9 }],
                },
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])]),
                parameters: { parameters: [{ parameter, runtimeOverride: 1 }] },
            },
        ]);

        const next = sync(initial, tabsActions.applyWorkingSelection({}));

        expect(next.tabs?.[0]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { attributeElements: { uris: ["west"] } },
        });
        expect(next.tabs?.[0]?.filterContext?.workingFilterContextDefinition).toEqual({ filters: [] });
        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: { localIdentifier: "region-b", attributeElements: { uris: ["west"] } },
        });
        expect(next.tabs?.[1]?.filterContext?.workingFilterContextDefinition?.filters).toEqual([]);
        expect(next.tabs?.[0]?.parameters?.parameters[0]?.runtimeOverride).toBe(9);
        expect(next.tabs?.[1]?.parameters?.parameters[0]?.runtimeOverride).toBe(9);
        expect(next.tabs?.[1]?.parameters?.parameters[0]).not.toHaveProperty("workingOverride");
    });

    it("drops the target tab's staged value for a mirrored filter and keeps unrelated staging", () => {
        const stagedOnB: WorkingFilterContextItem[] = [
            {
                attributeFilter: {
                    localIdentifier: "region-b",
                    attributeElements: { uris: ["north"] },
                    negativeSelection: false,
                },
            },
            dateFilter("date-b", -3),
            {
                attributeFilter: {
                    localIdentifier: "product-b",
                    attributeElements: { uris: ["phone"] },
                    negativeSelection: false,
                },
            },
        ];
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [attributeFilter("region-a", displayForm, ["east"]), dateFilter("date-a", -1)],
                    [
                        {
                            attributeFilter: {
                                localIdentifier: "region-a",
                                attributeElements: { uris: ["west"] },
                                negativeSelection: false,
                            },
                        },
                        dateFilter("date-a", -7),
                    ],
                ),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext(
                    [
                        attributeFilter("region-b", displayForm, ["east"]),
                        dateFilter("date-b", -1),
                        attributeFilter("product-b", otherDisplayForm, []),
                    ],
                    stagedOnB,
                ),
            },
        ]);

        const next = sync(initial, tabsActions.applyWorkingSelection({}));

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toMatchObject([
            { attributeFilter: { localIdentifier: "region-b", attributeElements: { uris: ["west"] } } },
            { dateFilter: { localIdentifier: "date-b", from: -7 } },
            { attributeFilter: { localIdentifier: "product-b", attributeElements: { uris: [] } } },
        ]);
        expect(next.tabs?.[1]?.filterContext?.workingFilterContextDefinition?.filters).toEqual([
            stagedOnB[2],
        ]);
    });

    it("resets staged filters and parameters only on the active tab", () => {
        const stagedOnB: WorkingFilterContextItem[] = [
            {
                attributeFilter: {
                    localIdentifier: "region-b",
                    attributeElements: { uris: ["north"] },
                    negativeSelection: false,
                },
            },
        ];
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(
                    [attributeFilter("region-a", displayForm, ["east"])],
                    [
                        {
                            attributeFilter: {
                                localIdentifier: "region-a",
                                attributeElements: { uris: ["west"] },
                                negativeSelection: false,
                            },
                        },
                    ],
                ),
            },
            {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm, ["east"])], stagedOnB),
                parameters: { parameters: [{ parameter, runtimeOverride: 1, workingOverride: 9 }] },
            },
        ]);

        const afterCancel = run(initial, (draft) => {
            tabsReducers.resetWorkingSelection(draft, tabsActions.resetWorkingSelection());
        });
        const afterFilterReset = run(initial, (draft) => {
            filterContextReducers.resetWorkingFilterSelection(
                draft,
                tabsActions.resetWorkingFilterSelection(),
            );
        });

        for (const next of [afterCancel, afterFilterReset]) {
            expect(next.tabs?.[0]?.filterContext?.workingFilterContextDefinition).toEqual({ filters: [] });
            expect(next.tabs?.[1]?.filterContext?.workingFilterContextDefinition?.filters).toEqual(stagedOnB);
        }
        expect(afterCancel.tabs?.[1]?.parameters?.parameters[0]?.workingOverride).toBe(9);
    });

    it("keeps a seeded tab in sync and restores it to its seed on reset", () => {
        const source: ITabState = {
            localIdentifier: "tab-a",
            filterContext: filterContext(
                [attributeFilter("region", displayForm, ["east"]), measureFilter("mvf", 10)],
                [],
                [allAttributeFilter("region", displayForm), measureFilter("mvf", 0)],
            ),
        };
        const seed = seedSyncedTabFilters(source, { title: "filterContext", description: "", filters: [] });
        const seeded: ITabState = {
            localIdentifier: "tab-new",
            filterContext: {
                filtersWithInvalidSelection: [],
                filterContextDefinition: seed.filterContextDefinition,
                originalFilterContextDefinition: seed.filterContextDefinition,
            },
        };

        const withNewTab = tabsReducers.setTabs(
            makeState([source]),
            tabsActions.setTabs({ tabs: [source, seeded], activeTabLocalIdentifier: "tab-a" }),
        )!;

        const changed = sync(withNewTab, [
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region",
                elements: { uris: ["west"] },
                negativeSelection: false,
            }),
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
            }),
        ]);

        expect(changed.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region", displayForm, ["west"]),
            measureFilter("mvf", 50),
        ]);

        const reset = sync(changed, [
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: "region",
                elements: { uris: [] },
                negativeSelection: true,
                restoreTargetOriginal: true,
            }),
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 0 } }],
                restoreTargetOriginal: true,
            }),
        ]);

        expect(reset.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region", displayForm, ["east"]),
            measureFilter("mvf", 10),
        ]);
    });

    it("writes parameter values onto every tab that defines the parameter", () => {
        const scenarioRef = idRef("scenario", "parameter");
        const scenario: IDashboardParameter = { ref: scenarioRef, parameterType: "STRING", mode: "active" };
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                parameters: { parameters: [{ parameter, runtimeOverride: 10, workingOverride: 40 }] },
            },
            {
                localIdentifier: "tab-b",
                parameters: { parameters: [{ parameter, runtimeOverride: 20, workingOverride: 30 }] },
            },
            {
                localIdentifier: "tab-c",
                parameters: { parameters: [{ parameter: scenario, runtimeOverride: "Actual" }] },
            },
        ]);

        const next = sync(
            initial,
            tabsActions.setParameterRuntimeValues({ values: [{ ref: parameterRef, value: 99 }] }),
        );

        expect(next.tabs?.[0]?.parameters?.parameters[0]).toEqual({ parameter, runtimeOverride: 99 });
        expect(next.tabs?.[1]?.parameters?.parameters[0]).toEqual({ parameter, runtimeOverride: 99 });
        expect(next.tabs?.[2]?.parameters?.parameters).toEqual([
            { parameter: scenario, runtimeOverride: "Actual" },
        ]);
    });

    it("keeps display form metadata when removing a cross-filter that shares it with a dashboard filter", () => {
        const regionName = displayFormMeta("region.name", "region");
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: {
                    ...filterContext([
                        attributeFilter("region", displayForm, ["east"]),
                        attributeFilter("cross", displayForm, ["west"]),
                        attributeFilter("code", otherDisplayForm, ["x"]),
                    ]),
                    attributeFilterDisplayForms: [regionName, displayFormMeta("region.code", "region")],
                },
            },
        ]);

        const next = sync(
            initial,
            [
                tabsActions.removeAttributeFilter({ filterLocalId: "cross" }),
                tabsActions.removeAttributeFilterDisplayForms({ displayForm }),
                tabsActions.removeAttributeFilter({ filterLocalId: "code" }),
                tabsActions.removeAttributeFilterDisplayForms({ displayForm: otherDisplayForm }),
            ],
            { "tab-a": ["cross"] },
        );

        expect(next.tabs?.[0]?.filterContext?.attributeFilterDisplayForms).toEqual([regionName]);
    });
});
