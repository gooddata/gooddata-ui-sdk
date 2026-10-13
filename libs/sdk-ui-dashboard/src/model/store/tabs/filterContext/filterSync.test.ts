// (C) 2026 GoodData Corporation

// @vitest-environment node

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type IDashboardParameter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { tabsActions } from "../index.js";
import { tabsReducers } from "../tabsReducers.js";
import { type ITabState, type ITabsState } from "../tabsState.js";

import { filterContextReducers } from "./filterContextReducers.js";
import { type FilterContextState, type WorkingFilterContextItem } from "./filterContextState.js";
import { seedSyncedTabFilters } from "./filterSync.js";

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

describe("persist filters across tabs", () => {
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

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region_0_attributeFilter",
                    elements: { uris: ["west"] },
                    negativeSelection: false,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-a",
                    elements: { uris: [] },
                    negativeSelection: true,
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

    it("matches a computed attribute across display forms of the same attribute", () => {
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

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "segment-a",
                    elements: { uris: ["online"] },
                    negativeSelection: false,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "segment-b",
                displayForm: code,
                attributeElements: { uris: ["online"] },
            },
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

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-a",
                    elements: { uris: ["west"] },
                    negativeSelection: false,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region-a",
                    elements: { uris: ["west"] },
                    negativeSelection: false,
                    isWorkingSelectionChange: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

            const next = run(initial, (draft) => {
                filterContextReducers.updateAttributeFilterSelection(
                    draft,
                    tabsActions.updateAttributeFilterSelection({
                        filterLocalId: "virtual-region",
                        elements: { uris: ["clicked"] },
                        negativeSelection: false,
                        crossFilteringLocalIdsByTab: { "tab-a": ["virtual-region"] },
                        enablePersistentFiltersAcrossTabs: true,
                    }),
                );
            });

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

            const next = run(initial, (draft) => {
                filterContextReducers.updateAttributeFilterSelection(
                    draft,
                    tabsActions.updateAttributeFilterSelection({
                        filterLocalId: "region-a",
                        elements: { uris: ["west"] },
                        negativeSelection: false,
                        crossFilteringLocalIdsByTab: { "tab-b": ["virtual-b"] },
                        enablePersistentFiltersAcrossTabs: true,
                    }),
                );
            });

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

            const next = run(initial, (draft) => {
                filterContextReducers.replaceAttributeFilterItem(
                    draft,
                    tabsActions.replaceAttributeFilterItem({
                        filterLocalId: "virtual-region",
                        filter: attributeFilter("virtual-region", displayForm, ["clicked"]),
                        crossFilteringLocalIdsByTab: { "tab-a": ["virtual-region"] },
                        enablePersistentFiltersAcrossTabs: true,
                    }),
                );
            });

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

            const next = run(initial, (draft) => {
                filterContextReducers.clearAttributeFiltersSelection(
                    draft,
                    tabsActions.clearAttributeFiltersSelection({
                        filterLocalIds: ["virtual-region"],
                        crossFilteringLocalIdsByTab: { "tab-a": ["virtual-region"] },
                        enablePersistentFiltersAcrossTabs: true,
                    }),
                );
            });

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

            const next = run(initial, (draft) => {
                tabsReducers.applyWorkingSelection(
                    draft,
                    tabsActions.applyWorkingSelection({
                        crossFilteringLocalIdsByTab: { "tab-a": ["virtual-region"] },
                        enablePersistentFiltersAcrossTabs: true,
                    }),
                );
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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "relative",
                    granularity: "GDC.time.date",
                    dataSet,
                    from: -30,
                    to: 0,
                    localIdentifier: "date_0",
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "relative",
                    granularity: "GDC.time.year",
                    from: -3,
                    to: 0,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            dateFilter: { from: -3, granularity: "GDC.time.year" },
        });
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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "relative",
                    granularity: "GDC.time.date",
                    dataSet,
                    from: -7,
                    to: 0,
                    localIdentifier: "date-a",
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "relative",
                    granularity: "GDC.time.year",
                    from: -1,
                    to: 0,
                    localIdentifier: "common",
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "allTime",
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.upsertDateFilter(
                draft,
                tabsActions.upsertDateFilter({
                    type: "relative",
                    granularity: "GDC.time.date",
                    dataSet,
                    from: -7,
                    to: 0,
                    localIdentifier: "date-a",
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf_0",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf_0",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf_0",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 1_000_000 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf_0",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            tabsReducers.applyWorkingSelection(
                draft,
                tabsActions.applyWorkingSelection({ enablePersistentFiltersAcrossTabs: true }),
            );
        });

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

        const next = run(initial, (draft) => {
            tabsReducers.applyWorkingSelection(
                draft,
                tabsActions.applyWorkingSelection({ enablePersistentFiltersAcrossTabs: true }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf_0",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 1_000_000 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.clearAttributeFiltersSelection(
                draft,
                tabsActions.clearAttributeFiltersSelection({
                    filterLocalIds: ["region-a"],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.replaceAttributeFilterItem(
                draft,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "text-a",
                    filter: text("text-a", name, ["West"]),
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.replaceAttributeFilterItem(
                draft,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "text-a",
                    filter: text("text-a", ["west"]),
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

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

        const next = run(initial, (draft) => {
            filterContextReducers.replaceAttributeFilterItem(
                draft,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "text-a",
                    filter: text(["west"]),
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([target]);
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

        const next = run(initial, (draft) => {
            filterContextReducers.replaceAttributeFilterItem(
                draft,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "shared",
                    filter: attributeFilter("shared", displayForm, ["west"]),
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([text]);
    });

    it("matches a list filter to a text filter by local id when they share an attribute", () => {
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

        const next = run(initial, (draft) => {
            filterContextReducers.replaceAttributeFilterItem(
                draft,
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: "shared",
                    filter: attributeFilter("shared", name, ["west"]),
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(next.tabs?.[1]?.filterContext?.filterContextDefinition?.filters[0]).toMatchObject({
            attributeFilter: {
                localIdentifier: "shared",
                displayForm: name,
                attributeElements: { uris: ["west"] },
            },
        });
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

        const next = run(initial, (draft) => {
            tabsReducers.applyWorkingSelection(
                draft,
                tabsActions.applyWorkingSelection({ enablePersistentFiltersAcrossTabs: true }),
            );
        });

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

        const next = run(initial, (draft) => {
            tabsReducers.applyWorkingSelection(
                draft,
                tabsActions.applyWorkingSelection({ enablePersistentFiltersAcrossTabs: true }),
            );
        });

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
});

describe("seedSyncedTabFilters", () => {
    const base = { title: "filterContext", description: "", filters: [] };

    it("copies applied filters and their configs, leaving out working values and cross-filtering filters", () => {
        const source: ITabState = {
            localIdentifier: "tab-a",
            filterContext: {
                ...filterContext(
                    [
                        attributeFilter("region", displayForm, ["east"]),
                        attributeFilter("cross", otherDisplayForm, ["x"]),
                        dateFilter("created", -7),
                        measureFilter("mvf", 10),
                    ],
                    [attributeFilter("region", displayForm, ["west"])],
                ),
                attributeFilterDisplayForms: [displayFormMeta("region.name", "region")],
            },
            attributeFilterConfigs: {
                attributeFilterConfigs: [
                    { localIdentifier: "region", mode: "readonly" },
                    { localIdentifier: "cross", mode: "hidden" },
                ],
            },
            dateFilterConfigs: {
                dateFilterConfigs: [
                    { dateDataSet: dataSet, config: { filterName: "Created", mode: "active" } },
                    {
                        dateDataSet: idRef("closed", "dataSet"),
                        config: { filterName: "Closed", mode: "active" },
                    },
                ],
            },
            measureValueFilterConfigs: {
                measureValueFilterConfigs: [{ localIdentifier: "mvf", mode: "readonly" }],
            },
            filterGroupsConfig: {
                groups: [
                    {
                        title: "Mixed",
                        filters: [{ filterLocalIdentifier: "region" }, { filterLocalIdentifier: "cross" }],
                    },
                    { title: "Cross only", filters: [{ filterLocalIdentifier: "cross" }] },
                ],
            },
        };

        const seed = seedSyncedTabFilters(source, base, { "tab-a": ["cross"] });

        expect(seed.filterContextDefinition).toEqual({
            ...base,
            filters: [
                attributeFilter("region", displayForm, ["east"]),
                dateFilter("created", -7),
                measureFilter("mvf", 10),
            ],
        });
        expect(seed.attributeFilterDisplayForms).toEqual([displayFormMeta("region.name", "region")]);
        expect(seed.attributeFilterConfigs).toEqual([{ localIdentifier: "region", mode: "readonly" }]);
        expect(seed.dateFilterConfigs).toEqual([
            { dateDataSet: dataSet, config: { filterName: "Created", mode: "active" } },
        ]);
        expect(seed.measureValueFilterConfigs).toEqual([{ localIdentifier: "mvf", mode: "readonly" }]);
        expect(seed.filterGroupsConfig).toEqual({
            groups: [{ title: "Mixed", filters: [{ filterLocalIdentifier: "region" }] }],
        });
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
        const seed = seedSyncedTabFilters(source, base);
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

        const changed = run(withNewTab, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region",
                    elements: { uris: ["west"] },
                    negativeSelection: false,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 50 } }],
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(changed.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region", displayForm, ["west"]),
            measureFilter("mvf", 50),
        ]);

        const reset = run(changed, (draft) => {
            filterContextReducers.updateAttributeFilterSelection(
                draft,
                tabsActions.updateAttributeFilterSelection({
                    filterLocalId: "region",
                    elements: { uris: [] },
                    negativeSelection: true,
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
            filterContextReducers.changeMeasureValueFilterCondition(
                draft,
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier: "mvf",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 0 } }],
                    restoreTargetOriginal: true,
                    enablePersistentFiltersAcrossTabs: true,
                }),
            );
        });

        expect(reset.tabs?.[1]?.filterContext?.filterContextDefinition?.filters).toEqual([
            attributeFilter("region", displayForm, ["east"]),
            measureFilter("mvf", 10),
        ]);
    });
});
