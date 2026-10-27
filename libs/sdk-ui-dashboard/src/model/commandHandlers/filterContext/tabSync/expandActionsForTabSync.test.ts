// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type Action } from "@reduxjs/toolkit";
import { batchActions } from "redux-batched-actions";
import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { type FilterContextState } from "../../../store/tabs/filterContext/filterContextState.js";
import { tabsActions, tabsSliceReducer } from "../../../store/tabs/index.js";
import { type ITabState, type ITabsState } from "../../../store/tabs/tabsState.js";

import { expandActionsForTabSync } from "./expandActionsForTabSync.js";
import { type ITabSyncScope } from "./tabSyncScope.js";

const displayForm = idRef("region.name", "displayForm");
const otherDisplayForm = idRef("product.name", "displayForm");
const dataSet = idRef("created", "dataSet");
const measure = idRef("amount", "measure");

function attributeFilter(
    localIdentifier: string,
    form: ObjRef,
    uris: string[] = [],
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

const commonDateFilter: IDashboardDateFilter = {
    dateFilter: { type: "relative", granularity: "GDC.time.date" },
};

function filterContext(filters: FilterContextItem[]): FilterContextState {
    return {
        filtersWithInvalidSelection: [],
        filterContextDefinition: { title: "", description: "", filters },
    };
}

function makeState(tabs: ITabState[]): ITabsState {
    return { tabs, activeTabLocalIdentifier: tabs[0]?.localIdentifier };
}

function scope(overrides: Partial<ITabSyncScope> = {}): ITabSyncScope {
    return {
        enabled: true,
        sourceTabLocalIdentifier: undefined,
        crossFilteringLocalIdsByTab: {},
        ...overrides,
    };
}

function sync(
    state: ITabsState,
    actions: Action[],
    syncScope: ITabSyncScope = scope(),
): { actions: Action[]; state: ITabsState } {
    const expanded = expandActionsForTabSync(state, actions, syncScope);
    return { actions: expanded, state: expanded.reduce(tabsSliceReducer, state) };
}

function filtersOn(state: ITabsState, index: number): FilterContextItem[] | undefined {
    return state.tabs?.[index]?.filterContext?.filterContextDefinition?.filters;
}

describe("expandActionsForTabSync", () => {
    describe("planning", () => {
        const conditions = measureFilter("", 5).dashboardMeasureValueFilter.conditions;

        it("passes actions through unchanged when the scope is disabled", () => {
            const initial = makeState([
                { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf-a", 1)]) },
                { localIdentifier: "tab-b", filterContext: filterContext([measureFilter("mvf-b", 1)]) },
            ]);
            const action = tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf-a",
                conditions,
            });

            expect(expandActionsForTabSync(initial, [action], scope({ enabled: false }))).toEqual([action]);
        });

        it("addresses every copy to its tab and leaves the source action untouched", () => {
            const initial = makeState([
                { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf-a", 1)]) },
                { localIdentifier: "tab-b", filterContext: filterContext([measureFilter("mvf-b", 1)]) },
            ]);
            const action = tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: "mvf-a",
                conditions,
            });

            expect(expandActionsForTabSync(initial, [action], scope())).toEqual([
                action,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf-b",
                    conditions,
                    tabLocalIdentifier: "tab-b",
                }),
            ]);
        });

        it("mirrors the actions of a nested batch", () => {
            const initial = makeState([
                { localIdentifier: "tab-a", filterContext: filterContext([measureFilter("mvf-a", 1)]) },
                { localIdentifier: "tab-b", filterContext: filterContext([measureFilter("mvf-b", 1)]) },
            ]);

            const { state } = sync(initial, [
                batchActions([
                    tabsActions.changeMeasureValueFilterCondition({ localIdentifier: "mvf-a", conditions }),
                ]),
            ]);

            expect(filtersOn(state, 1)).toEqual([measureFilter("mvf-b", 5)]);
        });

        describe("when the source tab is not the active tab", () => {
            const nameMeta = { ref: displayForm, id: "region.name" } as IAttributeDisplayFormMetadataObject;
            const initial: ITabsState = {
                ...makeState(
                    ["tab-y", "tab-x", "tab-z"].map((localIdentifier) => ({
                        localIdentifier,
                        filterContext: { ...filterContext([]), attributeFilterDisplayForms: [] },
                    })),
                ),
                activeTabLocalIdentifier: "tab-y",
            };
            const displayFormsOn = (state: ITabsState, index: number) =>
                state.tabs?.[index]?.filterContext?.attributeFilterDisplayForms;

            it("applies display form metadata to the source tab and mirrors it to the others", () => {
                const { state } = sync(
                    initial,
                    [tabsActions.addAttributeFilterDisplayForm(nameMeta)],
                    scope({ sourceTabLocalIdentifier: "tab-x" }),
                );

                expect(displayFormsOn(state, 0)).toEqual([nameMeta]);
                expect(displayFormsOn(state, 1)).toEqual([nameMeta]);
                expect(displayFormsOn(state, 2)).toEqual([nameMeta]);
            });

            it("replaces display form metadata referenced by an identifier instead of duplicating it", () => {
                const tigerMeta = {
                    ref: displayForm,
                    id: "region.name",
                    uri: "/api/v1/entities/workspaces/ws/labels/region.name",
                } as IAttributeDisplayFormMetadataObject;
                const add = tabsActions.addAttributeFilterDisplayForm(tigerMeta);

                const { state } = sync(initial, [add, add], scope({ sourceTabLocalIdentifier: "tab-x" }));

                expect(displayFormsOn(state, 0)).toEqual([tigerMeta]);
                expect(displayFormsOn(state, 1)).toEqual([tigerMeta]);
                expect(displayFormsOn(state, 2)).toEqual([tigerMeta]);
            });

            it("addresses actions without a tab to the source tab even when nothing is mirrored", () => {
                const actions = expandActionsForTabSync(
                    initial,
                    [tabsActions.addAttributeFilterDisplayForm(nameMeta)],
                    scope({ enabled: false, sourceTabLocalIdentifier: "tab-x" }),
                );

                expect(actions).toEqual([
                    tabsActions.addAttributeFilterDisplayForm({
                        displayForm: nameMeta,
                        tabLocalIdentifier: "tab-x",
                    }),
                ]);
            });
        });

        describe("when a filter is added", () => {
            const initial = makeState([
                { localIdentifier: "tab-a", filterContext: filterContext([]) },
                { localIdentifier: "tab-b", filterContext: filterContext([]) },
            ]);
            const addActions: Array<[string, Action]> = [
                [
                    "attribute",
                    tabsActions.addAttributeFilter({ displayForm, index: 0, localIdentifier: "region" }),
                ],
                [
                    "text attribute",
                    tabsActions.addTextAttributeFilter({
                        index: 0,
                        filter: {
                            arbitraryAttributeFilter: {
                                displayForm,
                                values: [],
                                negativeSelection: true,
                                localIdentifier: "region",
                            },
                        },
                    }),
                ],
                ["date", tabsActions.addDateFilter({ dateDataset: dataSet, index: 0 })],
                ["measure value", tabsActions.addMeasureValueFilter({ measure, index: 0 })],
            ];

            it.each(addActions)("keeps the new %s filter on its own tab", (_, action) => {
                const { actions, state } = sync(initial, [action]);

                expect(actions).toEqual([action]);
                expect(filtersOn(state, 1)).toEqual([]);
            });
        });

        describe("when a filter is removed or moved", () => {
            const filtersOfTab = (suffix: string) => [
                commonDateFilter,
                attributeFilter(`region-${suffix}`, displayForm),
                dateFilter(`date-${suffix}`, 0),
                measureFilter(`mvf-${suffix}`, 1),
            ];
            const initial = makeState([
                { localIdentifier: "tab-a", filterContext: filterContext(filtersOfTab("a")) },
                { localIdentifier: "tab-b", filterContext: filterContext(filtersOfTab("b")) },
            ]);
            const actions: Array<[string, Action]> = [
                ["removes the attribute", tabsActions.removeAttributeFilter({ filterLocalId: "region-a" })],
                [
                    "moves the attribute",
                    tabsActions.moveAttributeFilter({ filterLocalId: "region-a", index: 2 }),
                ],
                ["removes the date", tabsActions.removeDateFilter({ dataSet })],
                ["moves the date", tabsActions.moveDateFilter({ dataSet, index: 0 })],
                [
                    "removes the measure value",
                    tabsActions.removeMeasureValueFilter({ localIdentifier: "mvf-a" }),
                ],
                [
                    "moves the measure value",
                    tabsActions.moveMeasureValueFilter({ localIdentifier: "mvf-a", index: 0 }),
                ],
            ];

            it.each(actions)("%s filter on its own tab only", (_, action) => {
                const { actions: expanded, state } = sync(initial, [action]);

                expect(expanded).toEqual([action]);
                expect(filtersOn(state, 1)).toEqual(filtersOfTab("b"));
            });
        });

        it("does not mirror display form migrations, every tab migrates its own filters", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("region-a", displayForm)]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm)]),
                },
            ]);
            const action = tabsActions.changeAttributeDisplayForm({
                filterLocalId: "region-a",
                displayForm: otherDisplayForm,
                isResultOfMigration: true,
            });

            expect(expandActionsForTabSync(initial, [action], scope())).toEqual([action]);
        });
    });

    describe("common date filter", () => {
        const lastSevenDays = tabsActions.upsertDateFilter({
            type: "relative",
            granularity: "GDC.time.date",
            from: -6,
            to: 0,
            localIdentifier: "date-a",
        });
        const sourceTab: ITabState = {
            localIdentifier: "tab-a",
            filterContext: filterContext([
                { dateFilter: { ...commonDateFilter.dateFilter, localIdentifier: "date-a" } },
            ]),
        };
        it("skips a tab without a filter context", () => {
            const tabB: ITabState = { localIdentifier: "tab-b" };
            const { actions, state } = sync(makeState([sourceTab, tabB]), [lastSevenDays]);
            expect(actions).toEqual([lastSevenDays]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });
        it("does not copy the source local identifier onto a tab that is all time", () => {
            const { state } = sync(
                makeState([sourceTab, { localIdentifier: "tab-b", filterContext: filterContext([]) }]),
                [lastSevenDays],
            );
            expect(filtersOn(state, 1)).toEqual([
                { dateFilter: { type: "relative", granularity: "GDC.time.date", from: -6, to: 0 } },
            ]);
        });
    });

    describe("cross-filtering", () => {
        const select = (filterLocalId: string) =>
            tabsActions.updateAttributeFilterSelection({
                filterLocalId,
                elements: { uris: ["east"] },
                negativeSelection: false,
            });

        it("does not mirror changes of a cross-filtering virtual filter", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("virtual", displayForm)]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm)]),
                },
            ]);

            const { actions } = sync(
                initial,
                [select("virtual")],
                scope({ crossFilteringLocalIdsByTab: { "tab-a": ["virtual"] } }),
            );

            expect(actions).toHaveLength(1);
        });

        it("does not treat a cross-filtering virtual filter on another tab as the counterpart", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("region-a", displayForm)]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("virtual", displayForm)]),
                },
            ]);

            const { actions } = sync(
                initial,
                [select("region-a")],
                scope({ crossFilteringLocalIdsByTab: { "tab-b": ["virtual"] } }),
            );

            expect(actions).toHaveLength(1);
        });
    });

    describe("when a filter configuration changes", () => {
        const filtersOfTab = (suffix: string) => [
            attributeFilter(`region-${suffix}`, displayForm),
            attributeFilter(`child-${suffix}`, otherDisplayForm),
            dateFilter(`date-${suffix}`, 0),
            measureFilter(`mvf-${suffix}`, 1),
        ];
        const tabB = {
            localIdentifier: "tab-b",
            filterContext: filterContext(filtersOfTab("b")),
            dateFilterConfig: { dateFilterConfig: { mode: "active" as const, filterName: "Other" } },
        };
        const initial = makeState([
            {
                localIdentifier: "tab-a",
                filterContext: filterContext(filtersOfTab("a")),
                dateFilterConfig: { dateFilterConfig: { mode: "active", filterName: "Other" } },
            },
            tabB,
        ]);
        const configActions: Array<[string, Action]> = [
            [
                "attribute title",
                tabsActions.changeAttributeTitle({ filterLocalId: "region-a", title: "Area" }),
            ],
            [
                "attribute selection mode",
                tabsActions.changeSelectionMode({ filterLocalId: "region-a", selectionMode: "single" }),
            ],
            [
                "attribute limiting items",
                tabsActions.changeLimitingItems({ filterLocalId: "region-a", limitingItems: [measure] }),
            ],
            [
                "attribute parents",
                tabsActions.setAttributeFilterParents({
                    filterLocalId: "child-a",
                    parentFilters: [
                        { filterLocalIdentifier: "region-a", over: { attributes: [displayForm] } },
                    ],
                }),
            ],
            [
                "attribute dependent date filters",
                tabsActions.setAttributeFilterDependentDateFilters({
                    filterLocalId: "child-a",
                    dependentDateFilters: [{ filterLocalIdentifier: "date-a", isCommonDate: false }],
                }),
            ],
            [
                "attribute config mode",
                tabsActions.changeAttributeFilterConfigMode({ localIdentifier: "region-a", mode: "hidden" }),
            ],
            [
                "attribute selection type",
                tabsActions.changeAttributeFilterSelectionType({
                    localIdentifier: "region-a",
                    selectionType: "text",
                }),
            ],
            [
                "text attribute display form",
                tabsActions.changeTextFilterDisplayForm({
                    filterLocalId: "region-a",
                    displayForm: otherDisplayForm,
                }),
            ],
            ["common date mode", tabsActions.setDateFilterConfigMode("readonly")],
            ["common date title", tabsActions.setDateFilterConfigTitle("Period")],
            ["date mode", tabsActions.changeDateFilterConfigsMode({ dataSet, mode: "readonly" })],
            ["date title", tabsActions.changeDateFilterConfigsTitle({ dataSet, title: "Period" })],
            [
                "measure value title",
                tabsActions.changeMeasureValueFilterTitle({ filterLocalId: "mvf-a", title: "Revenue" }),
            ],
            [
                "measure value config mode",
                tabsActions.changeMeasureValueFilterConfigMode({ localIdentifier: "mvf-a", mode: "hidden" }),
            ],
        ];

        it.each(configActions)("keeps the %s on its own tab", (_, action) => {
            const { actions, state } = sync(initial, [action]);

            expect(actions).toEqual([action]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });
    });

    describe("attribute filters", () => {
        it("keeps a display-as label change on its own tab", () => {
            const tabB: ITabState = {
                localIdentifier: "tab-b",
                filterContext: filterContext([attributeFilter("region-b", displayForm)]),
            };
            const action = tabsActions.changeDisplayAsLabel({
                localIdentifier: "region-a",
                displayAsLabel: otherDisplayForm,
            });

            const { actions, state } = sync(
                makeState([
                    {
                        localIdentifier: "tab-a",
                        filterContext: filterContext([attributeFilter("region-a", displayForm)]),
                    },
                    tabB,
                ]),
                [action],
            );

            expect(actions).toEqual([action]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });

        it("keeps showing the label of a tab whose display form changes with a selection", () => {
            const regionCode = idRef("region.code", "displayForm");
            const regionShortName = idRef("region.short", "displayForm");
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("region-a", regionCode)]),
                    attributeFilterConfigs: {
                        attributeFilterConfigs: [
                            { localIdentifier: "region-a", displayAsLabel: displayForm },
                        ],
                    },
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: filterContext([attributeFilter("region-b", displayForm)]),
                },
            ]);

            const { state: changed } = sync(initial, [
                tabsActions.changeAttributeDisplayForm({
                    filterLocalId: "region-a",
                    displayForm: regionShortName,
                }),
            ]);
            const { state } = sync(changed, [
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-a",
                    elements: { uris: ["east"] },
                    negativeSelection: false,
                }),
            ]);

            expect(state.tabs?.[1]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
                { localIdentifier: "region-b", displayAsLabel: displayForm },
            ]);
            expect(filtersOn(state, 1)).toEqual([attributeFilter("region-b", regionShortName, ["east"])]);
        });
    });

    describe("between list and text filters", () => {
        const listOrText = (localIdentifier: string) => ({
            attributeFilterConfigs: [{ localIdentifier, selectionType: "listOrText" as const }],
        });
        const textFilter = (localIdentifier: string, values: string[]) => ({
            arbitraryAttributeFilter: { displayForm, localIdentifier, negativeSelection: false, values },
        });
        const listTab = (localIdentifier: string, filterLocalId: string): ITabState => ({
            localIdentifier,
            filterContext: filterContext([attributeFilter(filterLocalId, displayForm, ["east"])]),
            attributeFilterConfigs: listOrText(filterLocalId),
        });
        const textTab = (localIdentifier: string, filterLocalId: string): ITabState => ({
            localIdentifier,
            filterContext: filterContext([textFilter(filterLocalId, ["east"])]),
            attributeFilterConfigs: listOrText(filterLocalId),
        });

        it("keeps the display-as label of a text filter when a list filter changes it", () => {
            const tabB = textTab("tab-b", "region-b");
            const action = tabsActions.changeDisplayAsLabel({
                localIdentifier: "region-a",
                displayAsLabel: otherDisplayForm,
            });
            const { actions, state } = sync(makeState([listTab("tab-a", "region-a"), tabB]), [action]);
            expect(actions).toEqual([action]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });

        it("keeps a list filter when a text filter is replaced", () => {
            const tabB = listTab("tab-b", "region-b");
            const action = tabsActions.replaceAttributeFilterItem({
                filterLocalId: "region-a",
                filter: textFilter("region-a", ["west"]),
            });
            const { actions, state } = sync(makeState([textTab("tab-a", "region-a"), tabB]), [action]);
            expect(actions).toEqual([action]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });

        describe("when a filter switches between list and text", () => {
            const parentsOf = (suffix: string) => [
                { filterLocalIdentifier: `parent-${suffix}`, over: { attributes: [otherDisplayForm] } },
            ];
            const tabWith = (suffix: string, filter: FilterContextItem): ITabState => ({
                localIdentifier: `tab-${suffix}`,
                filterContext: filterContext([attributeFilter(`parent-${suffix}`, otherDisplayForm), filter]),
                attributeFilterConfigs: listOrText(`region-${suffix}`),
            });
            const listWithParents = (suffix: string): IDashboardAttributeFilter => {
                const filter = attributeFilter(`region-${suffix}`, displayForm, ["east"]);
                return {
                    attributeFilter: { ...filter.attributeFilter, filterElementsBy: parentsOf(suffix) },
                };
            };
            const textWithParents = (suffix: string) => {
                const filter = textFilter(`region-${suffix}`, ["east"]);
                return {
                    arbitraryAttributeFilter: {
                        ...filter.arbitraryAttributeFilter,
                        filterElementsBy: parentsOf(suffix),
                    },
                };
            };

            it("turns the matching list filter into text, keeping its local identifier and parents", () => {
                const initial = makeState([
                    tabWith("a", listWithParents("a")),
                    tabWith("b", listWithParents("b")),
                ]);

                const { state } = sync(initial, [
                    tabsActions.replaceAttributeFilterItem({
                        filterLocalId: "region-a",
                        filter: textFilter("region-a", ["west"]),
                    }),
                ]);

                expect(filtersOn(state, 1)?.[1]).toEqual({
                    arbitraryAttributeFilter: {
                        ...textFilter("region-b", ["west"]).arbitraryAttributeFilter,
                        filterElementsBy: parentsOf("b"),
                    },
                });
            });

            it("turns the matching text filter into a list, keeping its local identifier and parents", () => {
                const initial = makeState([
                    tabWith("a", textWithParents("a")),
                    tabWith("b", textWithParents("b")),
                ]);

                const { state } = sync(initial, [
                    tabsActions.replaceAttributeFilterItem({
                        filterLocalId: "region-a",
                        filter: attributeFilter("region-a", displayForm, ["west"]),
                    }),
                ]);

                expect(filtersOn(state, 1)?.[1]).toEqual({
                    attributeFilter: {
                        ...attributeFilter("region-b", displayForm, ["west"]).attributeFilter,
                        filterElementsBy: parentsOf("b"),
                    },
                });
            });
        });
    });

    describe("on reset", () => {
        const regionCode = idRef("region.code", "displayForm");
        const regionShortName = idRef("region.short", "displayForm");
        const withDisplayAsLabel = (
            localIdentifier: string,
            filterLocalId: string,
            displayAsLabel: ObjRef,
        ): ITabState => ({
            localIdentifier,
            filterContext: filterContext([attributeFilter(filterLocalId, displayForm)]),
            attributeFilterConfigs: {
                attributeFilterConfigs: [{ localIdentifier: filterLocalId, displayAsLabel }],
            },
        });

        it("restores the saved display form of each tab", () => {
            const initial = makeState([
                {
                    localIdentifier: "tab-a",
                    filterContext: filterContext([attributeFilter("region-a", regionCode)]),
                },
                {
                    localIdentifier: "tab-b",
                    filterContext: {
                        ...filterContext([attributeFilter("region-b", regionCode)]),
                        originalFilterContextDefinition: {
                            title: "",
                            description: "",
                            filters: [attributeFilter("region-b", displayForm)],
                        },
                    },
                },
            ]);

            const { state } = sync(initial, [
                tabsActions.changeAttributeDisplayForm({
                    filterLocalId: "region-a",
                    displayForm: regionShortName,
                    restoreTargetOriginal: true,
                }),
            ]);

            expect(filtersOn(state, 1)?.[0]).toMatchObject({
                attributeFilter: { localIdentifier: "region-b", displayForm },
            });
        });

        it("restores the saved display-as label of each tab", () => {
            const initial = makeState([
                withDisplayAsLabel("tab-a", "region-a", regionCode),
                withDisplayAsLabel("tab-b", "region-b", regionCode),
            ]);

            const { state } = sync(
                initial,
                [
                    tabsActions.changeDisplayAsLabel({
                        localIdentifier: "region-a",
                        displayAsLabel: undefined,
                        restoreTargetOriginal: true,
                    }),
                ],
                scope({
                    persistedAttributeFilterConfigsByTab: {
                        "tab-b": [{ localIdentifier: "region-b", displayAsLabel: regionShortName }],
                    },
                }),
            );

            expect(state.tabs?.[1]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
                { localIdentifier: "region-b", displayAsLabel: regionShortName },
            ]);
        });

        it("keeps the display-as label of a tab without a saved dashboard", () => {
            const tabB = withDisplayAsLabel("tab-b", "region-b", regionCode);
            const action = tabsActions.changeDisplayAsLabel({
                localIdentifier: "region-a",
                displayAsLabel: undefined,
                restoreTargetOriginal: true,
            });

            const { actions, state } = sync(
                makeState([withDisplayAsLabel("tab-a", "region-a", regionCode), tabB]),
                [action],
            );

            expect(actions).toEqual([action]);
            expect(state.tabs?.[1]).toEqual(tabB);
        });
    });
});
