// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IParameterMetadataObject, idRef, uriRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { type IFilters } from "@gooddata/sdk-ui-ext/internal";

import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { itemCache } from "../../tests/constants.test.helpers.js";
import {
    dateDatasetsMetaItems,
    timelineDateDatasetRef,
} from "../../tests/date_datasets_meta.test.helpers.js";
import {
    dateDataset3,
    dateDatasetRefsWithGranularities,
} from "../../tests/DateDatasetWithGranularities.test.helpers.js";
import {
    DATE_FILTER_DATASET_REF,
    buildAttributeFilterMock,
    buildDateFilterMock,
    comparisonMeasureValueFilter,
    emptyMeasureValueFilter,
    rangeMeasureValueFilter,
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
} from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IRawBucketItems } from "../../typings/buckets.js";

import { buildCacheItemMock } from "./cache_item.test.helpers.js";
import { getFilterBarState, getFilterItems, getFirstDateFilter } from "./filter_bar_selector.js";
import { FilterBarService } from "./filter_bar_service.js";
import { type IFilterBarState } from "./filter_bar_state.js";
import {
    type IAttributeFilter,
    type IAttributeFilterConfig,
    type IDateFilter,
    type IDateFilterConfig,
    type IFilter,
    type IMeasureValueFilter,
} from "./filter_bar_types.js";
import { parameterFilterFromMetadata } from "./parameter_filter_service.js";

const DATE_FILTER: IFilter = buildDateFilterMock({
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    localIdentifier: "date.localId",
});

const COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.country.id",
    localIdentifier: "country.localId",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
    filterConfig: {
        selectedElements: [{ title: "title1", uri: "uri1" }],
        totalElementsCount: 5,
        isInverted: false,
    },
});

const PRODUCT_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.product.id",
    localIdentifier: "product.localId",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
});

const EMPTY_MEASURE_VALUE_FILTER: IMeasureValueFilter = {
    ...emptyMeasureValueFilter,
    localIdentifier: "f1",
};

const COMPARISON_MEASURE_VALUE_FILTER: IMeasureValueFilter = {
    ...comparisonMeasureValueFilter,
    localIdentifier: "f1",
};

const RANGE_MEASURE_VALUE_FILTER: IMeasureValueFilter = {
    ...rangeMeasureValueFilter,
    localIdentifier: "f1",
};

const expectedLocalIdentifierMatcher = expect.stringMatching(/[a-z0-9]+/);

const initialState = getInitializedState();

describe("filterBarService", () => {
    describe("addFilter", () => {
        it("should add the filter to the state", () => {
            let state = FilterBarService.addFilter(initialState, COUNTRY_ATTRIBUTE_FILTER);

            let filterBarState = getFilterBarState(state);
            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [{ title: "title1", uri: "uri1" }],
                            totalElementsCount: 5,
                            isInverted: false,
                        },
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });

            state = FilterBarService.addFilter(state, PRODUCT_ATTRIBUTE_FILTER);
            filterBarState = getFilterBarState(state);
            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [{ title: "title1", uri: "uri1" }],
                            totalElementsCount: 5,
                            isInverted: false,
                        },
                    },
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                        localIdentifier: "product.localId",
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });
        });
    });

    describe("storeFilter", () => {
        it("should update filterBarState with the new filter value if it was already present", () => {
            const UPDATED_COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
                cacheItemIdentifier: "attr.country.new_id",
                localIdentifier: "country.localId",
                displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                filterConfig: {
                    selectedElements: [
                        { title: "title1", uri: "uri1" },
                        { title: "title2", uri: "uri2" },
                    ],
                    totalElementsCount: 4,
                    isInverted: true,
                },
            });

            let state = FilterBarService.addFilter(initialState, COUNTRY_ATTRIBUTE_FILTER);
            state = FilterBarService.addFilter(state, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.storeFilter(state, UPDATED_COUNTRY_ATTRIBUTE_FILTER);
            const filterBarState = getFilterBarState(state);

            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.new_id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [
                                { title: "title1", uri: "uri1" },
                                { title: "title2", uri: "uri2" },
                            ],
                            totalElementsCount: 4,
                            isInverted: true,
                        },
                    },
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                        localIdentifier: "product.localId",
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });
        });
        it("should not update filterBarState if the filter was not already present", () => {
            const OTHER_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
                cacheItemIdentifier: "other_attribute.new_id",
                localIdentifier: "other_attribute.localId",
                displayFormRef: uriRef("other_attr/df/uri"),
            });

            let state = FilterBarService.addFilter(initialState, COUNTRY_ATTRIBUTE_FILTER);
            state = FilterBarService.addFilter(state, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.storeFilter(state, OTHER_ATTRIBUTE_FILTER);
            const filterBarState = getFilterBarState(state);

            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [{ title: "title1", uri: "uri1" }],
                            totalElementsCount: 5,
                            isInverted: false,
                        },
                    },
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                        localIdentifier: "product.localId",
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });
        });
    });

    describe("updateDateFilter", () => {
        const NEW_FILTER_CONFIG: IDateFilterConfig = {
            granularity: "GDC.time.year",
            interval: [0, 100],
            type: "absolute",
        };

        const NEW_OVER_TIME_COMPARISON_TYPE: OverTimeComparisonType = "same_period_previous_year";

        it("should update filterBarState with the new date filter values if it was already present", () => {
            let state = FilterBarService.addFilter(initialState, DATE_FILTER);
            state = FilterBarService.updateDateFilter(state, {
                localIdentifier: DATE_FILTER.localIdentifier,
                filterConfig: NEW_FILTER_CONFIG,
                overTimeComparisonType: NEW_OVER_TIME_COMPARISON_TYPE,
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            });
            const filterBarState = getFilterBarState(state);

            const expectedState: IFilterBarState = {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "date",
                        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                        localIdentifier: "date.localId",
                        filterConfig: {
                            granularity: "GDC.time.year",
                            interval: [0, 100],
                            type: "absolute",
                        },
                        overTimeComparisonType: "same_period_previous_year",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            };

            expect(filterBarState).toEqual(expectedState);
        });

        it("should not update filterBarState with the new date filter values if it was not already present", () => {
            let state = FilterBarService.addFilter(initialState, COUNTRY_ATTRIBUTE_FILTER);
            state = FilterBarService.updateDateFilter(state, {
                localIdentifier: undefined,
                filterConfig: NEW_FILTER_CONFIG,
                overTimeComparisonType: NEW_OVER_TIME_COMPARISON_TYPE,
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            });
            const filterBarState = getFilterBarState(state);

            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [{ title: "title1", uri: "uri1" }],
                            totalElementsCount: 5,
                            isInverted: false,
                        },
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });
        });

        it("should update filter date even when the change is only partial, keeping rest untouched", () => {
            let state = FilterBarService.addFilter(initialState, DATE_FILTER);
            state = FilterBarService.updateDateFilter(state, {
                localIdentifier: DATE_FILTER.localIdentifier,
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            });
            let dateFilter = getFirstDateFilter(state);

            const expectedWithNewDateDataset: IDateFilter = {
                type: "date",
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                localIdentifier: "date.localId",
                overTimeComparisonType: "nothing",
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            };

            expect(dateFilter).toEqual(expectedWithNewDateDataset);

            state = FilterBarService.updateDateFilter(state, {
                localIdentifier: DATE_FILTER.localIdentifier,
                overTimeComparisonType: NEW_OVER_TIME_COMPARISON_TYPE,
            });
            dateFilter = getFirstDateFilter(state);

            const expectedWithNewComparisonType: IDateFilter = {
                type: "date",
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                localIdentifier: "date.localId",
                overTimeComparisonType: NEW_OVER_TIME_COMPARISON_TYPE,
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            };

            expect(dateFilter).toEqual(expectedWithNewComparisonType);
        });
    });

    describe("updateAttributeFilter", () => {
        it("should update filterBarState with the new attribute filter values if it was already present", () => {
            let state = FilterBarService.addFilter(initialState, COUNTRY_ATTRIBUTE_FILTER);
            state = FilterBarService.addFilter(state, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.updateAttributeFilter(
                state,
                "country.localId",
                [
                    { title: "title1", uri: "uri1" },
                    { title: "title2", uri: "uri2" },
                ],
                4,
                true,
            );
            const filterBarState = getFilterBarState(state);

            expect(filterBarState).toEqual({
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        localIdentifier: "country.localId",
                        filterConfig: {
                            selectedElements: [
                                { title: "title1", uri: "uri1" },
                                { title: "title2", uri: "uri2" },
                            ],
                            totalElementsCount: 4,
                            isInverted: true,
                        },
                    },
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                        localIdentifier: "product.localId",
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });
        });
    });

    describe("updateMeasureValueFilter", () => {
        it("should throw error when updated filter does not exist in the app state", () => {
            expect(() =>
                FilterBarService.updateMeasureValueFilter(initialState, COMPARISON_MEASURE_VALUE_FILTER),
            ).toThrow();
        });

        it("should set conditions to originally empty filter", () => {
            const state = FilterBarService.addFilter(initialState, EMPTY_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(
                state,
                COMPARISON_MEASURE_VALUE_FILTER,
            );
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should remove conditions from configured filter if new filter does not have conditions", () => {
            const state = FilterBarService.addFilter(initialState, COMPARISON_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(
                state,
                EMPTY_MEASURE_VALUE_FILTER,
            );
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should remove conditions from configured filter if new filter does not have them", () => {
            const state = FilterBarService.addFilter(initialState, COMPARISON_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(
                state,
                EMPTY_MEASURE_VALUE_FILTER,
            );
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should update comparison filter", () => {
            const state = FilterBarService.addFilter(initialState, COMPARISON_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(state, {
                ...comparisonMeasureValueFilter,
                conditions: [{ comparison: { operator: "LESS_THAN", value: 42 } }],
            });
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should update range filter", () => {
            const state = FilterBarService.addFilter(initialState, RANGE_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(state, {
                ...RANGE_MEASURE_VALUE_FILTER,
                conditions: [
                    {
                        range: {
                            operator: "NOT_BETWEEN",
                            from: 10,
                            to: 20,
                        },
                    },
                ],
            });
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should change comparison filter to use range condition instead", () => {
            const state = FilterBarService.addFilter(initialState, comparisonMeasureValueFilter);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(
                state,
                RANGE_MEASURE_VALUE_FILTER,
            );
            expect(updatedFilter).toMatchSnapshot();
        });

        it("should change range filter to use comparison condition instead", () => {
            const state = FilterBarService.addFilter(initialState, RANGE_MEASURE_VALUE_FILTER);
            const updatedFilter = FilterBarService.updateMeasureValueFilter(
                state,
                comparisonMeasureValueFilter,
            );
            expect(updatedFilter).toMatchSnapshot();
        });
    });

    describe("updateFilters", () => {
        it("should remove filter, update existing filter and add new filter", () => {
            const dateDatasetItems = [
                {
                    attributes: [
                        { dfRef: uriRef("attr.first.uri") },
                        { dfRef: uriRef("attr.second.uri") },
                        { dfRef: uriRef("attr.third.uri") },
                    ],
                },
            ];

            const firstAttributeFilter = buildAttributeFilterMock({
                localIdentifier: "attr.first.localIdentifier",
                cacheItemIdentifier: "attr.first.identifier",
                displayFormRef: uriRef("attr.first.uri"),
                filterConfig: {
                    isInverted: true,
                    totalElementsCount: 657,
                    selectedElements: [
                        {
                            uri: "/gdc/md/projectId/obj/4394/elements?id=298",
                        },
                        {
                            uri: "/gdc/md/projectId/obj/4394/elements?id=325",
                        },
                    ],
                },
            });

            const secondAttributeFilter = buildAttributeFilterMock({
                localIdentifier: "attr.second.localIdentifier",
                cacheItemIdentifier: "attr.second.identifier",
                displayFormRef: uriRef("attr.second.uri"),
                filterConfig: {
                    isInverted: true,
                    totalElementsCount: 0,
                    selectedElements: [],
                },
            });

            const updatedSecondAttributeFilter: IAttributeFilter = {
                ...secondAttributeFilter,
                filterConfig: {
                    isInverted: true,
                    totalElementsCount: 2,
                    selectedElements: [
                        {
                            uri: "/gdc/md/projectId/obj/4394/elements?id=123",
                        },
                    ],
                },
            };

            const thirdAttributeFilter = buildAttributeFilterMock({
                localIdentifier: "attr.third.localIdentifier",
                cacheItemIdentifier: "attr.third.identifier",
                displayFormRef: uriRef("attr.third.uri"),
                filterConfig: {
                    isInverted: true,
                    totalElementsCount: 0,
                    selectedElements: [],
                },
            });

            const state = withData(
                FilterBarService.setFilterItems(initialState, [firstAttributeFilter, secondAttributeFilter]),
                {
                    dateDatasetsMeta: {
                        ...FilterBarService.setFilterItems(initialState, [
                            firstAttributeFilter,
                            secondAttributeFilter,
                        ]).data.dateDatasetsMeta,
                        items: dateDatasetItems as unknown as IDateDatasetsMetaItem[],
                    },
                },
            );
            const updatedState = FilterBarService.updateFilters(state, [
                updatedSecondAttributeFilter,
                thirdAttributeFilter,
            ]);

            const filters = getFilterItems(updatedState);

            expect(filters).toEqual([updatedSecondAttributeFilter, thirdAttributeFilter]);
        });
    });

    describe("createFilter", () => {
        it("should return a date filter for a date cache item", () => {
            const DATE_CACHE_ITEM = buildCacheItemMock({
                type: "date",
            });

            const filter = FilterBarService.createFilter(DATE_CACHE_ITEM, DATE_FILTER_DATASET_REF);
            expect(filter).toEqual({
                type: "date",
                localIdentifier: expect.stringMatching(/[a-z0-9]+/),
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                overTimeComparisonType: "nothing",
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            });
        });
        it("should return an attribute filter for an attribute cache item", () => {
            const ATTRIBUTE_CACHE_ITEM = buildCacheItemMock({
                type: "attribute",
                identifier: "attr.id",
            });

            const filter = FilterBarService.createFilter(ATTRIBUTE_CACHE_ITEM);
            expect(filter).toEqual({
                type: "attribute",
                localIdentifier: expectedLocalIdentifierMatcher,
                cacheItemIdentifier: "attr.id",
                filterConfig: {
                    isInverted: true,
                    selectedElements: [],
                    totalElementsCount: 0,
                },
            });
        });

        it("should return a measure value filter with objRef for a metric cache item when no bucket measures provided", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureRef: idRef("metric.revenue"),
            });
        });

        it("should return a measure value filter with localIdentifier when matching bucket measure exists", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
            ];

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM, undefined, false, bucketMeasures);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
            });
        });

        it("should prefer master measure over derived when matching bucket measures", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const bucketMeasures: IRawBucketItems = [
                {
                    localIdentifier: "m1_derived",
                    ref: idRef("metric.revenue"),
                    type: "metric",
                    masterLocalIdentifier: "m1",
                },
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
            ];

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM, undefined, false, bucketMeasures);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
            });
        });

        it("should use first master measure when multiple masters match", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
                { localIdentifier: "m2", ref: idRef("metric.revenue"), type: "metric" },
            ];

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM, undefined, false, bucketMeasures);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
            });
        });

        it("should fall back to objRef when no matching bucket measure found", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.other"), type: "metric" },
            ];

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM, undefined, false, bucketMeasures);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureRef: idRef("metric.revenue"),
            });
        });
    });

    describe("findMatchingBucketMeasureLocalIdentifier", () => {
        it("should return undefined when bucket measures is undefined", () => {
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                undefined,
            );
            expect(result).toBeUndefined();
        });

        it("should return undefined when bucket measures is empty", () => {
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                [],
            );
            expect(result).toBeUndefined();
        });

        it("should return undefined when no matching measure found", () => {
            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.other"), type: "metric" },
            ];
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                bucketMeasures,
            );
            expect(result).toBeUndefined();
        });

        it("should return localIdentifier of matching master measure", () => {
            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
            ];
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                bucketMeasures,
            );
            expect(result).toBe("m1");
        });

        it("should prefer master over derived measure", () => {
            const bucketMeasures: IRawBucketItems = [
                {
                    localIdentifier: "m1_derived",
                    ref: idRef("metric.revenue"),
                    type: "metric",
                    masterLocalIdentifier: "m1",
                },
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
            ];
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                bucketMeasures,
            );
            expect(result).toBe("m1");
        });

        it("should return first derived if no master exists", () => {
            const bucketMeasures: IRawBucketItems = [
                {
                    localIdentifier: "m1_derived",
                    ref: idRef("metric.revenue"),
                    type: "metric",
                    masterLocalIdentifier: "m1",
                },
                {
                    localIdentifier: "m2_derived",
                    ref: idRef("metric.revenue"),
                    type: "metric",
                    masterLocalIdentifier: "m2",
                },
            ];
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                bucketMeasures,
            );
            expect(result).toBe("m1_derived");
        });

        it("should return first master when multiple masters match", () => {
            const bucketMeasures: IRawBucketItems = [
                { localIdentifier: "m1", ref: idRef("metric.revenue"), type: "metric" },
                { localIdentifier: "m2", ref: idRef("metric.revenue"), type: "metric" },
            ];
            const result = FilterBarService.findMatchingBucketMeasureLocalIdentifier(
                idRef("metric.revenue"),
                bucketMeasures,
            );
            expect(result).toBe("m1");
        });
        it("should return a measure value filter for a metric cache item", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });

            const filter = FilterBarService.createFilter(METRIC_CACHE_ITEM);
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureRef: idRef("metric.revenue"),
            });
        });
        it("should return a measure value filter with dimensionality when provided for metric cache item", () => {
            const METRIC_CACHE_ITEM = buildCacheItemMock({
                type: "metric",
                identifier: "metric.revenue",
                ref: idRef("metric.revenue"),
            });
            const dimensionality = ["a1", "date1"];

            const filter = FilterBarService.createFilter(
                METRIC_CACHE_ITEM,
                undefined,
                false,
                undefined,
                dimensionality,
            );
            expect(filter).toEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureRef: idRef("metric.revenue"),
                dimensionality: ["a1", "date1"],
            });
        });
    });

    describe("createDateFilter", () => {
        it("should return a date filter", () => {
            const filter = FilterBarService.createDateFilter(DATE_FILTER_DATASET_REF);
            const expectedFilter: IDateFilter = {
                type: "date",
                localIdentifier: expectedLocalIdentifierMatcher,
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                overTimeComparisonType: "nothing",
                dateDatasetRef: DATE_FILTER_DATASET_REF,
            };
            expect(filter).toEqual(expectedFilter);
        });
    });

    describe("createAttributeFilter", () => {
        const dfRef = uriRef("/gdc/md/attr");
        const cacheItem = buildCacheItemMock({
            type: "attribute",
            identifier: "attr.id",
            dfRef,
        });

        it("should return an attribute filter for an attribute cache item", () => {
            const filter = FilterBarService.createAttributeFilter(cacheItem.identifier, cacheItem.dfRef);

            expect(filter).toEqual({
                type: "attribute",
                localIdentifier: expectedLocalIdentifierMatcher,
                cacheItemIdentifier: "attr.id",
                displayFormRef: dfRef,
                filterConfig: {
                    isInverted: true,
                    selectedElements: [],
                    totalElementsCount: 0,
                },
            });
        });

        it("should return an attribute filter with given filterConfig if provided", () => {
            const filterConfig: IAttributeFilterConfig = {
                isInverted: false,
                selectedElements: [
                    {
                        uri: "/gdc/md/mockproject/obj/1/elements?id=1",
                    },
                ],
                totalElementsCount: 10,
            };
            const filter = FilterBarService.createAttributeFilter(
                cacheItem.identifier,
                cacheItem.dfRef,
                filterConfig,
            );

            expect(filter).toEqual({
                type: "attribute",
                localIdentifier: expectedLocalIdentifierMatcher,
                cacheItemIdentifier: "attr.id",
                displayFormRef: dfRef,
                filterConfig,
            });
        });
    });

    describe("createMeasureValueFilter", () => {
        it("should return empty measure value filter for a measure local identifier", () => {
            const filter = FilterBarService.createMeasureValueFilter("m1");
            expect(filter).toStrictEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
            });
        });

        it("should return measure value filter with dimensionality when provided", () => {
            const dimensionality = ["a1", "a2", "date1"];
            const filter = FilterBarService.createMeasureValueFilter("m1", dimensionality);
            expect(filter).toStrictEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
                dimensionality: ["a1", "a2", "date1"],
            });
        });

        it("should include dimensionality when empty array is provided", () => {
            const filter = FilterBarService.createMeasureValueFilter("m1", []);
            expect(filter).toStrictEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
                dimensionality: [],
            });
        });

        it("should not include dimensionality when undefined is provided", () => {
            const filter = FilterBarService.createMeasureValueFilter("m1", undefined);
            expect(filter).toStrictEqual({
                type: "measure",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
            });
        });
    });

    describe("createDefaultRankingFilter", () => {
        it("should return ranking filter for a measure local identifier", () => {
            const filter = FilterBarService.createDefaultRankingFilter("m1");
            expect(filter).toStrictEqual({
                type: "ranking",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureLocalIdentifier: "m1",
                operator: "TOP",
                value: 10,
            });
        });

        it("should return ranking filter with measureRef for a catalog metric ObjRef", () => {
            const filter = FilterBarService.createDefaultRankingFilter(idRef("metric.revenue", "measure"));
            expect(filter).toStrictEqual({
                type: "ranking",
                localIdentifier: expectedLocalIdentifierMatcher,
                measureRef: idRef("metric.revenue", "measure"),
                operator: "TOP",
                value: 10,
            });
        });
    });

    describe("parameterFilterFromMetadata", () => {
        function buildParameter(
            definition: IParameterMetadataObject["definition"],
        ): IParameterMetadataObject {
            return {
                ref: idRef("threshold", "parameter"),
                id: "threshold",
                uri: "",
                type: "parameter",
                title: "Threshold",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                definition,
            };
        }

        it("builds a parameter filter from a NUMBER parameter, carrying its default and constraints", () => {
            const filter = parameterFilterFromMetadata(
                buildParameter({ type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } }),
            );

            expect(filter).toStrictEqual({
                type: "parameter",
                localIdentifier: expectedLocalIdentifierMatcher,
                parameterRef: idRef("threshold", "parameter"),
                name: "Threshold",
                value: 10,
                definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
            });
        });

        it("omits constraints when the NUMBER parameter has none", () => {
            const filter = parameterFilterFromMetadata(buildParameter({ type: "NUMBER", defaultValue: 10 }));

            expect(filter.definition).toStrictEqual({ type: "NUMBER", defaultValue: 10 });
        });

        it("builds a parameter filter from a STRING parameter", () => {
            const filter = parameterFilterFromMetadata(
                buildParameter({ type: "STRING", defaultValue: "x", constraints: { maxLength: 10 } }),
            );

            expect(filter).toStrictEqual({
                type: "parameter",
                localIdentifier: expectedLocalIdentifierMatcher,
                parameterRef: idRef("threshold", "parameter"),
                name: "Threshold",
                value: "x",
                definition: { type: "STRING", defaultValue: "x", constraints: { maxLength: 10 } },
            });
        });
    });

    describe("setFilterItems", () => {
        it("should return the state with the new filters", () => {
            let state = FilterBarService.addFilter(initialState, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.setFilterItems(state, [DATE_FILTER, COUNTRY_ATTRIBUTE_FILTER]);
            const filterBarState = getFilterBarState(state);

            const expectedState: IFilterBarState = {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "date",
                        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                        localIdentifier: "date.localId",
                        overTimeComparisonType: "nothing",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.country.id",
                        localIdentifier: "country.localId",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                        filterConfig: {
                            selectedElements: [{ title: "title1", uri: "uri1" }],
                            totalElementsCount: 5,
                            isInverted: false,
                        },
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            };

            expect(filterBarState).toEqual(expectedState);
        });
    });

    describe("convertFromExtendedRefPointFilters", () => {
        it("should return the list of converted filters", () => {
            const EXTENDED_REF_POINT_FILTERS: IFilters = {
                localIdentifier: "filters",
                items: [
                    {
                        localIdentifier: "country.localId",
                        attribute: "attr.country.id",
                        filters: [
                            {
                                attribute: "attr.country.id",
                                displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                                selectedElements: [{ title: "title1", uri: "uri1" }],
                                totalElementsCount: 5,
                                isInverted: false,
                            },
                        ],
                    },
                    {
                        localIdentifier: "date.localId",
                        attribute: DATE_DATASET_ATTRIBUTE,
                        filters: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                overTimeComparisonType: "same_period_previous_year",
                                interval: {
                                    granularity: "interval_granularity",
                                    interval: ["value1", "value2"],
                                    name: "interval_name",
                                    type: "absolute",
                                },
                            },
                        ],
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                    {
                        localIdentifier: "f1",
                        attribute: null,
                        filters: [
                            {
                                measureLocalIdentifier: "m1",
                                condition: {
                                    comparison: {
                                        operator: "GREATER_THAN",
                                        value: 14,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "f2",
                        attribute: null,
                        filters: [
                            {
                                measureLocalIdentifier: "m2",
                                condition: {
                                    range: {
                                        operator: "BETWEEN",
                                        from: 14,
                                        to: 16,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "f3",
                        filters: [
                            {
                                measureLocalIdentifier: "m3",
                            },
                        ],
                    },
                    {
                        localIdentifier: "f5",
                        filters: [
                            {
                                measure: "m4",
                                operator: "TOP",
                                value: 10,
                            },
                        ],
                    },
                    {
                        localIdentifier: "f6",
                        filters: [
                            {
                                measure: "m5",
                                attributes: ["a1", "a2"],
                                operator: "BOTTOM",
                                value: 3,
                            },
                        ],
                    },
                ],
            };
            const convertedFilters =
                FilterBarService.convertFromExtendedRefPointFilters(EXTENDED_REF_POINT_FILTERS);

            expect(convertedFilters).toEqual([
                {
                    localIdentifier: "country.localId",
                    type: "attribute",
                    cacheItemIdentifier: "attr.country.id",
                    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                    filterConfig: {
                        selectedElements: [{ title: "title1", uri: "uri1" }],
                        totalElementsCount: 5,
                        isInverted: false,
                    },
                },
                {
                    localIdentifier: "date.localId",
                    type: "date",
                    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                    filterConfig: {
                        interval: ["value1", "value2"],
                        name: "interval_name",
                        granularity: "interval_granularity",
                        type: "absolute",
                    },
                    overTimeComparisonType: "same_period_previous_year",
                    dateDatasetRef: DATE_FILTER_DATASET_REF,
                },
                {
                    type: "measure",
                    localIdentifier: "f1",
                    measureLocalIdentifier: "m1",
                    conditions: [
                        {
                            comparison: {
                                operator: "GREATER_THAN",
                                value: 14,
                            },
                        },
                    ],
                },
                {
                    type: "measure",
                    localIdentifier: "f2",
                    measureLocalIdentifier: "m2",
                    conditions: [
                        {
                            range: {
                                operator: "BETWEEN",
                                from: 14,
                                to: 16,
                            },
                        },
                    ],
                },
                {
                    type: "measure",
                    localIdentifier: "f3",
                    measureLocalIdentifier: "m3",
                },
                rankingFilterWithoutAttributes,
                rankingFilterWithAttributes,
            ]);
        });

        it("should convert a ranking filter referencing a catalog measure by ref to a ranking filter (not MVF)", () => {
            const EXTENDED_REF_POINT_FILTERS: IFilters = {
                localIdentifier: "filters",
                items: [
                    {
                        localIdentifier: "f1",
                        filters: [
                            {
                                measureRef: idRef("metric.revenue", "measure"),
                                operator: "TOP",
                                value: 10,
                            },
                        ],
                    },
                ],
            };

            const convertedFilters =
                FilterBarService.convertFromExtendedRefPointFilters(EXTENDED_REF_POINT_FILTERS);

            expect(convertedFilters).toEqual([
                {
                    type: "ranking",
                    localIdentifier: "f1",
                    measureRef: idRef("metric.revenue", "measure"),
                    operator: "TOP",
                    value: 10,
                },
            ]);
        });
    });

    describe("createDateFilterIfDoesntExist", () => {
        it("should add date filter if it does not exist", () => {
            let state = FilterBarService.addFilter(initialState, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.createDateFilterIfDoesntExist(state, DATE_FILTER_DATASET_REF);
            const filterBarState = getFilterBarState(state);

            const expectedState: IFilterBarState = {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        localIdentifier: "product.localId",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                    },
                    {
                        type: "date",
                        localIdentifier: expect.stringMatching(/[a-z0-9]+/),
                        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                        overTimeComparisonType: "nothing",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            };

            expect(filterBarState).toEqual(expectedState);
        });

        it("should not add date filter if it already exists", () => {
            let state = FilterBarService.addFilter(initialState, PRODUCT_ATTRIBUTE_FILTER);
            state = FilterBarService.addFilter(state, DATE_FILTER);
            state = FilterBarService.createDateFilterIfDoesntExist(state, DATE_FILTER_DATASET_REF);
            const filterBarState = getFilterBarState(state);
            const expectedState: IFilterBarState = {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "attribute",
                        cacheItemIdentifier: "attr.product.id",
                        localIdentifier: "product.localId",
                        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                    },
                    {
                        type: "date",
                        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                        localIdentifier: "date.localId",
                        overTimeComparisonType: "nothing",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                ],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            };

            expect(filterBarState).toEqual(expectedState);
        });
    });

    describe("removeFilters", () => {
        let state = getInitializedState();
        state = FilterBarService.addFilter(state, PRODUCT_ATTRIBUTE_FILTER);
        state = FilterBarService.addFilter(state, COUNTRY_ATTRIBUTE_FILTER);

        it("should remove filter", () => {
            const updatedState = FilterBarService.removeFilters(state, [
                PRODUCT_ATTRIBUTE_FILTER.localIdentifier,
            ]);
            expect(getFilterItems(updatedState)).toEqual([COUNTRY_ATTRIBUTE_FILTER]);
        });

        it("should remove multiple filters", () => {
            const updatedState = FilterBarService.removeFilters(state, [
                PRODUCT_ATTRIBUTE_FILTER.localIdentifier,
                COUNTRY_ATTRIBUTE_FILTER.localIdentifier,
            ]);
            expect(getFilterItems(updatedState)).toEqual([]);
        });
    });

    describe("removeMeasureValueFilters", () => {
        let state = getInitializedState();
        state = FilterBarService.addFilter(state, COMPARISON_MEASURE_VALUE_FILTER);
        state = FilterBarService.addFilter(state, RANGE_MEASURE_VALUE_FILTER);
        state = FilterBarService.addFilter(state, COUNTRY_ATTRIBUTE_FILTER);
        state = FilterBarService.addFilter(state, DATE_FILTER);

        it("should remove only measure value filters", () => {
            const updatedState = FilterBarService.removeMeasureValueFilters(state);
            expect(getFilterItems(updatedState)).toEqual([COUNTRY_ATTRIBUTE_FILTER, DATE_FILTER]);
        });
    });

    describe("updateRankingFilter", () => {
        const state = FilterBarService.addFilter(getInitializedState(), rankingFilterWithAttributes);

        it("should update all ranking filter props", () => {
            const rankingFilter = FilterBarService.updateRankingFilter(state, {
                localIdentifier: "f5",
                type: "ranking",
                measureLocalIdentifier: "m1",
                attributes: ["a2", "a3"],
                operator: "TOP",
                value: 5,
            });
            expect(rankingFilter).toMatchSnapshot();
        });

        it("should remove attributes when All attributes option was selected", () => {
            const rankingFilter = FilterBarService.updateRankingFilter(state, {
                localIdentifier: "f5",
                type: "ranking",
                measureLocalIdentifier: "m5",
                operator: "BOTTOM",
                value: 3,
            });
            expect(rankingFilter).toMatchSnapshot();
        });

        it("should preserve measureRef when updating a ranking filter that ranks by a catalog metric", () => {
            const rankingFilter = FilterBarService.updateRankingFilter(state, {
                localIdentifier: "f5",
                type: "ranking",
                measureRef: idRef("metric.revenue", "measure"),
                operator: "TOP",
                value: 5,
            });
            expect(rankingFilter).toEqual({
                localIdentifier: "f5",
                type: "ranking",
                measureRef: idRef("metric.revenue", "measure"),
                operator: "TOP",
                value: 5,
            });
            expect(
                (rankingFilter as { measureLocalIdentifier?: string }).measureLocalIdentifier,
            ).toBeUndefined();
        });
    });

    describe("setFilterBarState", () => {
        it("should always add ranking filter as the last", () => {
            let state = FilterBarService.addFilter(getInitializedState(), DATE_FILTER);
            state = FilterBarService.addFilter(state, rankingFilterWithAttributes);
            expect(getFilterBarState(state).items).toEqual([DATE_FILTER, rankingFilterWithAttributes]);
            state = FilterBarService.addFilter(state, COUNTRY_ATTRIBUTE_FILTER);
            expect(getFilterBarState(state).items).toEqual([
                DATE_FILTER,
                COUNTRY_ATTRIBUTE_FILTER,
                rankingFilterWithAttributes,
            ]);
        });
    });

    describe("resetAdditionalDateFilters", () => {
        const globalDateFilter: IDateFilter = {
            localIdentifier: "filterItemLocalIdentifier",
            type: "date",
            cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
            filterConfig: {
                granularity: "GDC.time.year",
                interval: [0, 1],
            },
            dateDatasetRef: timelineDateDatasetRef,
        };

        const additionalDateFilter: IAttributeFilter = {
            type: "attribute",
            localIdentifier: "additional.filter",
            cacheItemIdentifier: "activity.day.in.week",
            displayFormRef: uriRef("/gdc/md/680"),
            filterConfig: {
                isInverted: false,
                totalElementsCount: 1,
                selectedElements: [
                    {
                        title: "Element 1",
                        available: true,
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623?id=1",
                    },
                ],
            },
        };

        const filterNotSupportedByNewDateDataset: IAttributeFilter = {
            type: "attribute",
            localIdentifier: "additional.filter2",
            cacheItemIdentifier: "activity.day.in.quarter",
            displayFormRef: uriRef("/gdc/md/697"),
            filterConfig: {
                isInverted: false,
                totalElementsCount: 1,
                selectedElements: [
                    {
                        title: "Element 1",
                        available: true,
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/456?id=1",
                    },
                ],
            },
        };

        const state = withData(
            withData(getInitializedState(), {
                dateDatasetsMeta: {
                    ...getInitializedState().data.dateDatasetsMeta,
                    items: dateDatasetsMetaItems,
                },
            }),
            { itemCache: itemCache },
        );
        const stateWithDateFilter = FilterBarService.addFilter(state, globalDateFilter);
        const stateWithAdditionalFilter = FilterBarService.addFilter(
            stateWithDateFilter,
            additionalDateFilter,
        );
        const stateWithAdditionalFilters = FilterBarService.addFilter(
            stateWithAdditionalFilter,
            filterNotSupportedByNewDateDataset,
        );

        it("should migrate additional date filters", () => {
            const updatedState = FilterBarService.resetAdditionalDateFilters(
                stateWithAdditionalFilter,
                timelineDateDatasetRef,
            );

            const migratedFilter = getFilterBarState(updatedState).items.find(
                (filter) => filter.type === "attribute",
            );
            expect(migratedFilter).toMatchSnapshot();
        });

        it("should not report a migrated additional date filter, its selection is kept", () => {
            const updatedState = FilterBarService.resetAdditionalDateFilters(
                stateWithAdditionalFilter,
                timelineDateDatasetRef,
            );
            expect(getFilterBarState(updatedState).migratedAdditionalFilters).toEqual([]);
        });

        it("should remove the unsupported additional date filter and report only that one", () => {
            const updatedState = FilterBarService.resetAdditionalDateFilters(
                stateWithAdditionalFilters,
                timelineDateDatasetRef,
            );
            const migratedFilter = getFilterBarState(updatedState).items.find(
                (filter) => filter.type === "attribute",
            );
            expect(migratedFilter).toMatchSnapshot();
            expect(
                getFilterBarState(updatedState).items.find(
                    (filter) => filter.localIdentifier === "additional.filter2",
                ),
            ).toBeUndefined();
            expect(getFilterBarState(updatedState).migratedAdditionalFilters).toEqual(["additional.filter2"]);
        });

        it("should not report anything when there is no filter to be migrated", () => {
            const updatedState = FilterBarService.resetAdditionalDateFilters(
                stateWithDateFilter,
                timelineDateDatasetRef,
            );
            expect(getFilterBarState(updatedState).migratedAdditionalFilters).toEqual([]);
        });
    });

    describe("migrateAdditionalDateFilters", () => {
        const filterSupportedByNewDateDataset: IAttributeFilter = {
            type: "attribute",
            localIdentifier: "additional.filter1",
            cacheItemIdentifier: "DATE1.dayOfMonth",
            displayFormRef: idRef("DATE1.dayOfMonth"),
            filterConfig: {
                isInverted: false,
                totalElementsCount: 1,
                selectedElements: [
                    {
                        title: "Element 1",
                        available: true,
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623?id=1",
                    },
                ],
            },
        };
        const filterNotSupportedByNewDateDataset: IAttributeFilter = {
            type: "attribute",
            localIdentifier: "additional.filter2",
            cacheItemIdentifier: "DATE1.minuteOfHour",
            displayFormRef: idRef("DATE1.minuteOfHour"),
            filterConfig: {
                isInverted: false,
                totalElementsCount: 1,
                selectedElements: [
                    {
                        title: "Element 1",
                        available: true,
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/456?id=1",
                    },
                ],
            },
        };
        it("should migrate provided filters and omit filters that are not supported in the new date dataset", () => {
            const migratedFilters = FilterBarService.migrateAdditionalDateFilters(
                dateDataset3,
                [filterSupportedByNewDateDataset, filterNotSupportedByNewDateDataset],
                dateDatasetRefsWithGranularities,
            );
            expect(migratedFilters).toMatchSnapshot();
        });
    });
});
