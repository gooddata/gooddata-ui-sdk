// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { initialState as initial_state } from "../../reducers/initial_state.js";
import { withUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import {
    attributeFilterWith2Elements,
    buildAttributeFilterMock,
    buildDateFilterMock,
    comparisonMeasureValueFilter,
    dateFilterLast30Days,
    emptyMeasureValueFilter,
    rangeMeasureValueFilter,
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
} from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";

import {
    areSomeFiltersSetUp,
    dateFilterExists,
    getAcceptedTypes,
    getAdditionalDateAttributeFilters,
    getAttributeFilter,
    getAttributeFilterById,
    getConfig,
    getFilterBarState,
    getFilterForMeasure,
    getFilterItems,
    getFilterItemsExtended,
    getFilterItemsWithoutAdditionalDateAttributes,
    getFirstDateFilter,
    getItemsLimit,
    getMeasureValueFilter,
    getMeasureValueFilters,
    getMigratedAdditionalFilters,
    getRankingFilter,
    hasActiveMeasureValueFilter,
    hasRankingFilter,
    hasRankingFilterWithCustomGranularity,
    isMultiline,
} from "./filter_bar_selector.js";
import { setFilterBarState } from "./filter_bar_service.js";
import { type IFilterBarState, defaultFilterBarState } from "./filter_bar_state.js";
import { type IFilter, type IFilterBarConfig } from "./filter_bar_types.js";

const DATE_FILTER: IFilter = buildDateFilterMock({
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    localIdentifier: "date.localId",
});

const COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.country.id",
    localIdentifier: "country.localId",
    filterConfig: {
        selectedElements: [
            {
                title: "title1",
                uri: "uri1",
            },
            {
                title: "title2",
                uri: "uri2",
            },
        ],
        isInverted: false,
        totalElementsCount: 5,
    },
});

const PRODUCT_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.product.id",
    localIdentifier: "product.localId",
});

const DAY_IN_WEEK_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.activity.day.in.week",
    localIdentifier: "activity.dayInWeek",
    displayFormRef: { uri: "/activity.days.in.week" },
});

const FILTER_BAR_ITEMS: IFilter[] = [
    DATE_FILTER,
    COUNTRY_ATTRIBUTE_FILTER,
    comparisonMeasureValueFilter,
    rankingFilterWithAttributes,
];

const FILTER_BAR_STATE: IFilterBarState = {
    attributeFilterConfigs: {},
    items: FILTER_BAR_ITEMS,
    isMultiline: false,
    migratedAdditionalFilters: [],
    parameterItems: [],
    filterBarDropdownOpen: false,
};

const initialState = getInitializedState();

const state = setFilterBarState(initial_state, FILTER_BAR_STATE);

const UI_CONFIG = {
    filters: {
        accepts: ["date", "attribute"],
        itemsLimit: 50,
    },
};

const DATE_DATASET_ITEMS = [
    {
        attributes: [
            { dfRef: { uri: "/activity.days.in.week" } },
            { dfRef: { uri: "/activity.days.in.month" } },
            { dfRef: { uri: "/activity.days.in.year" } },
        ],
    },
];

const stateWithConfig = withData(state, {
    extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, { buckets: UI_CONFIG }),
});

describe("Filter bar selector", () => {
    describe("getFilterBarState", () => {
        it("should return the filter bar state", () => {
            const filterBarState = getFilterBarState(state);
            expect(filterBarState).toEqual(FILTER_BAR_STATE);
        });
    });

    describe("getFilterItems", () => {
        it("should return the filter bar items", () => {
            const filterBarState = getFilterItems(state);
            expect(filterBarState).toEqual(FILTER_BAR_ITEMS);
        });

        it("should return an empty array if filter bar state does not contain any item", () => {
            const noItemsState = setFilterBarState(initial_state, defaultFilterBarState);
            const filterBarState = getFilterItems(noItemsState);
            expect(filterBarState).toEqual([]);
        });
    });

    describe("getAdditionalDateAttributes", () => {
        it("should return additional date attributes", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [...FILTER_BAR_ITEMS, DAY_IN_WEEK_ATTRIBUTE_FILTER],
            });
            const stateWithDateDatasets = withData(state, {
                dateDatasetsMeta: {
                    ...state.data.dateDatasetsMeta,
                    items: DATE_DATASET_ITEMS as unknown as IDateDatasetsMetaItem[],
                },
            });

            const result = getAdditionalDateAttributeFilters(stateWithDateDatasets);
            expect(result).toEqual([DAY_IN_WEEK_ATTRIBUTE_FILTER]);
        });

        it("should return an empty array if filter bar state does not contain any additional date attributes", () => {
            const state = setFilterBarState(initial_state, FILTER_BAR_STATE);
            const stateWithDateDatasets = withData(state, {
                dateDatasetsMeta: {
                    ...state.data.dateDatasetsMeta,
                    items: DATE_DATASET_ITEMS as unknown as IDateDatasetsMetaItem[],
                },
            });

            const result = getAdditionalDateAttributeFilters(stateWithDateDatasets);
            expect(result).toEqual([]);
        });
    });

    describe("getFilterItemsWithoutAdditionalDateAttributes", () => {
        it("should return the filter bar items without any additional date attributes", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [...FILTER_BAR_ITEMS, DAY_IN_WEEK_ATTRIBUTE_FILTER],
            });
            const stateWithDateDatasets = withData(state, {
                dateDatasetsMeta: {
                    ...state.data.dateDatasetsMeta,
                    items: DATE_DATASET_ITEMS as unknown as IDateDatasetsMetaItem[],
                },
            });

            const result = getFilterItemsWithoutAdditionalDateAttributes(stateWithDateDatasets);
            expect(result).toEqual(FILTER_BAR_ITEMS);
        });

        it("should return an empty array if filter bar state contains only additional date attributes", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [DAY_IN_WEEK_ATTRIBUTE_FILTER],
            });
            const stateWithDateDatasets = withData(state, {
                dateDatasetsMeta: {
                    ...state.data.dateDatasetsMeta,
                    items: DATE_DATASET_ITEMS as unknown as IDateDatasetsMetaItem[],
                },
            });

            const result = getFilterItemsWithoutAdditionalDateAttributes(stateWithDateDatasets);
            expect(result).toEqual([]);
        });
    });

    describe("isMultiline", () => {
        it("should return whether the filter bar is multiline or not", () => {
            const MULTILINE_FILTER_BAR_STATE = { ...FILTER_BAR_STATE, isMultiline: true };

            expect(isMultiline(state)).toBe(false);

            const multilineState = setFilterBarState(initial_state, MULTILINE_FILTER_BAR_STATE);
            expect(isMultiline(multilineState)).toBe(true);
        });
    });

    describe("getFilterItemsExtended", () => {
        it("should return extended reference point filters", () => {
            const extendedRefPointFiltersState = withData(state, {
                extendedReferencePoint: {
                    ...state.data.extendedReferencePoint,
                    filters: [PRODUCT_ATTRIBUTE_FILTER],
                },
            });
            const filterBarState = getFilterItemsExtended(extendedRefPointFiltersState);
            expect(filterBarState).toEqual([PRODUCT_ATTRIBUTE_FILTER]);
        });

        it("should return the filter bar items if there is no extended reference point filter", () => {
            const filterBarState = getFilterItemsExtended(state);
            expect(filterBarState).toEqual(FILTER_BAR_ITEMS);
        });
    });

    describe("getConfig", () => {
        it("should return default config if none is provided by the state", () => {
            const defaultConfig: IFilterBarConfig = {
                acceptedTypes: [],
                itemsLimit: 0,
            };
            expect(getConfig(state)).toEqual(defaultConfig);
        });

        it("should return config if it is provided by the state", () => {
            const filterBarConfig: IFilterBarConfig = {
                acceptedTypes: ["date", "attribute"],
                itemsLimit: 50,
            };
            expect(getConfig(stateWithConfig)).toEqual(filterBarConfig);
        });
    });

    describe("getAcceptedTypes", () => {
        it("should return empty array if no UI config is provided by the state", () => {
            expect(getAcceptedTypes(state)).toEqual([]);
        });

        it("should return the accepted types if the UI config is provided by the state", () => {
            expect(getAcceptedTypes(stateWithConfig)).toEqual(["date", "attribute"]);
        });
    });

    describe("getItemsLimit", () => {
        it("should return 0 if no UI config is provided by the state", () => {
            expect(getItemsLimit(state)).toEqual(0);
        });

        it("should return the items limit if the UI config is provided by the state", () => {
            expect(getItemsLimit(stateWithConfig)).toEqual(50);
        });
    });

    describe("getFirstDateFilter", () => {
        it("should return undefined if the date filter is not present in the state", () => {
            expect(getFirstDateFilter(initialState)).toEqual(undefined);
        });

        it("should return the date filter if it is present in the state", () => {
            expect(getFirstDateFilter(state)).toEqual(DATE_FILTER);
        });
    });

    describe("getAttributeFilter", () => {
        it("should return undefined if the attribute filter is not present in the state", () => {
            expect(getAttributeFilter(state, DATE_DATASET_ATTRIBUTE)).toEqual(undefined);
        });

        it("should return the attribute filter if is present in the state", () => {
            expect(getAttributeFilter(state, "country.localId")).toEqual(COUNTRY_ATTRIBUTE_FILTER);
        });
    });

    describe("getMeasureValueFilter", () => {
        it("should return null if the measure value filter is not present in the state", () => {
            expect(getMeasureValueFilter(state, "f2")).toEqual(null);
        });

        it("should return the measure value filter if is present in the state", () => {
            expect(getMeasureValueFilter(state, "f1")).toEqual(comparisonMeasureValueFilter);
        });
    });

    describe("dateFilterExists", () => {
        it("should return whether the date filter exists or not", () => {
            expect(dateFilterExists(initialState)).toBe(false);
            expect(dateFilterExists(state)).toBe(true);
        });
    });

    describe("getMeasureValueFilters", () => {
        it("should return only measure value filters", () => {
            expect(getMeasureValueFilters(state)).toEqual([comparisonMeasureValueFilter]);
        });
        it("should return empty array if there are no measure value filters", () => {
            expect(getMeasureValueFilters(initialState)).toEqual([]);
        });
    });

    describe("getFilterForMeasure", () => {
        it("should return filter for measure", () => {
            expect(getFilterForMeasure(state, comparisonMeasureValueFilter.measureLocalIdentifier)).toEqual(
                comparisonMeasureValueFilter,
            );
        });
        it("should return nothing if there is no MVF for measure", () => {
            expect(
                getFilterForMeasure(initialState, comparisonMeasureValueFilter.measureLocalIdentifier),
            ).toEqual(null);
        });
    });

    describe("getAttributeFilterById", () => {
        it("should return attribute filter by identifier", () => {
            expect(getAttributeFilterById(state, "attr.country.id")).toEqual(COUNTRY_ATTRIBUTE_FILTER);
        });
        it("should return undefined when there's no attribute filter matched", () => {
            expect(getAttributeFilterById(state, "no.identifier")).toBeUndefined();
        });
    });

    describe("getRankingFilter", () => {
        it("should return null when there when no ranking filter in the state", () => {
            expect(getRankingFilter(initialState)).toBeNull();
        });

        it("should return the ranking filter when it is in the state", () => {
            expect(getRankingFilter(state)).toBe(rankingFilterWithAttributes);
        });
    });

    describe("hasRankingFilter", () => {
        it("should return false when there is no ranking filter in the state", () => {
            expect(hasRankingFilter(initialState)).toBe(false);
        });

        it("should return true when there is ranking filter in the state", () => {
            expect(hasRankingFilter(state)).toBe(true);
        });
    });

    describe("hasRankingFilterWithCustomGranularity", () => {
        it("should return false when no ranking filter is present", () => {
            expect(hasRankingFilterWithCustomGranularity(initialState)).toBe(false);
        });

        it("should return false when ranking filter has no attributes", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [rankingFilterWithoutAttributes],
            });

            expect(hasRankingFilterWithCustomGranularity(state)).toBe(false);
        });

        it("should return true when ranking filter has some attributes", () => {
            expect(hasRankingFilterWithCustomGranularity(state)).toBe(true);
        });
    });

    describe("hasActiveMeasureValueFilter", () => {
        it("should return false when no measure value filter is present", () => {
            expect(hasActiveMeasureValueFilter(initialState)).toBe(false);
        });

        it("should return false when measure value filter without condition is present", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [emptyMeasureValueFilter],
            });

            expect(hasActiveMeasureValueFilter(state)).toBe(false);
        });

        it("should return true when measure value filter with condition is present", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [emptyMeasureValueFilter, comparisonMeasureValueFilter],
            });

            expect(hasActiveMeasureValueFilter(state)).toBe(true);
        });
    });

    describe("areSomeFiltersSetUp", () => {
        it("should return false if there are no filters set up", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [buildDateFilterMock(), buildAttributeFilterMock(), emptyMeasureValueFilter],
            });

            expect(areSomeFiltersSetUp(state)).toBe(false);
        });

        it("should true false if there is a date filter set up", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [dateFilterLast30Days, buildAttributeFilterMock(), emptyMeasureValueFilter],
            });

            expect(areSomeFiltersSetUp(state)).toBe(true);
        });

        it("should true false if there is an attribute filter set up", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [buildDateFilterMock(), attributeFilterWith2Elements, emptyMeasureValueFilter],
            });

            expect(areSomeFiltersSetUp(state)).toBe(true);
        });

        it("should true false if there is a measure value filter set up", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [buildDateFilterMock(), attributeFilterWith2Elements, rangeMeasureValueFilter],
            });

            expect(areSomeFiltersSetUp(state)).toBe(true);
        });

        it("should true false if there is ranking filter set up", () => {
            const state = setFilterBarState(initial_state, {
                ...FILTER_BAR_STATE,
                items: [
                    buildDateFilterMock(),
                    buildAttributeFilterMock(),
                    emptyMeasureValueFilter,
                    rankingFilterWithoutAttributes,
                ],
            });

            expect(areSomeFiltersSetUp(state)).toBe(true);
        });
    });

    describe("getMigratedAdditionalFilters", () => {
        it("should return false when flag is not set", () => {
            expect(getMigratedAdditionalFilters(state)).toEqual([]);
        });

        it("should return true when flag is set", () => {
            const migratedAdditionalFilters = ["id1"];
            const state = setFilterBarState(initialState, {
                ...FILTER_BAR_STATE,
                migratedAdditionalFilters,
            });
            expect(getMigratedAdditionalFilters(state)).toBe(migratedAdditionalFilters);
        });
    });
});
