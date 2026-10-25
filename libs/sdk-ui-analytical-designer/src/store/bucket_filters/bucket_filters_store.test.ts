// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { selectDateDataset } from "../../actions/measure_date_datasets_actions.js";
import { type IDateFilterOption } from "../../components/filterBar/dateFilter/dateFilterOptionFactory.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { MEASURES, METRIC } from "../../constants/bucket.js";
import { ALL_TIME } from "../../constants/presets.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import { type IPresetItem } from "../../models/preset_item.js";
import { PluggableVisualizationService } from "../../services/pluggable_visualization_service.js";
import {
    getRefPointDerivedMeasures,
    getRefPointNonDerivedMeasures,
} from "../../services/reference_point_service.js";
import { updateBucketItemsAt } from "../../store/buckets/bucket_item_address.js";
import {
    activityDateDataset,
    closedDateDataset,
    itemCache,
    seedDateDatasetsMeta,
    setupAppStateWithDateDatasetMeta,
    setupAppStateWithDateDatasets,
} from "../../tests/constants.test.helpers.js";
import {
    activityDateDatasetRef,
    dateDatasetsMetaItems,
    timelineDateDatasetRef,
} from "../../tests/date_datasets_meta.test.helpers.js";
import {
    DATE_FILTER_DATASET_REF,
    comparisonMeasureValueFilter,
    rangeMeasureValueFilter,
    rankingFilterWithAttributes,
} from "../../tests/filter.test.helpers.js";
import {
    seedMeasureDateDatasetSelection,
    seedMeasureDateDatasetStatus,
} from "../../tests/measure_date_datasets.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { dispatchAction } from "../../utils/dispatch_action.js";
import { getBucketItemsInBuckets } from "../buckets/buckets_write_helpers.js";
import { updateDerivedMeasuresOverTime } from "../buckets/over_time_comparison_helpers.js";
import { getDateDatasetUriByIdentifier } from "../date_datasets_meta/date_datasets_meta_selectors.js";
import {
    getAttributeFilter,
    getAttributeFilterById,
    getAttributeFilterConfig,
    getFilterBarState,
    getFilterItems,
    getFirstDateFilter,
    getMeasureValueFilter,
    getRankingFilter,
} from "../filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../filter_bar/filter_bar_service.js";
import { defaultFilterBarState } from "../filter_bar/filter_bar_state.js";
import {
    FilterBar,
    type IAttributeFilter,
    type IDateFilter,
    type IDateFilterConfig,
    type IFilter,
    type IRankingFilter,
} from "../filter_bar/filter_bar_types.js";
import { getMeasureDateDatasetStatus } from "../measure_date_datasets/measure_date_datasets_selectors.js";
import { type IRefPointAttributeFilterDetail } from "../reference_point/reference_point_state.js";
import { type IAppState } from "../types.js";

import { addGlobalDateFilter } from "./bucket_filters.test.helpers.js";
import {
    type IUpdateDateFilterActionPayload,
    type IUpdateMeasureValueFilterAction,
    type IUpdateRankingFilterAction,
    commandAddOrUpdateFilterItems,
    setBucketItemAddMetricFilter,
    setBucketItemAddMetricFilters,
    setBucketItemApplyMetricDateFilter,
    setBucketItemRemoveMetricFilter,
    setBucketItemUpdateMetricFilter,
    setBucketItemUpdateMetricFilterDisplayForm,
    storeUpdateDateFilter,
    storeUpdateDateFilterDateDataset,
    updateAttributeFilter,
    updateAttributeFilterDisplayForm,
    updateMeasureValueFilter,
    updateRankingFilter,
} from "./bucket_filters_actions.js";
import { isSameMetricDateFilter } from "./bucket_filters_operations.js";
import {
    buildBucketFiltersDerivedChainDeps,
    readBucketFiltersDerivedChainInput,
} from "./bucket_filters_operations_saga.js";
import {
    mapAttributeFilterToExternalAttributeFilter,
    mapDateFilterIdToExternalDateFilter,
} from "./bucket_filters_sagas.js";

describe("isSameMetricDateFilter", () => {
    const dateFilter = (localIdentifier: string | undefined, dimension = "closed"): IBucketItemMetricFilter =>
        ({ attribute: DATE_DATASET_ATTRIBUTE, localIdentifier, dimension }) as IBucketItemMetricFilter;

    it("tells date filters apart by their local identifier only", () => {
        expect(isSameMetricDateFilter(dateFilter("a"), dateFilter("a"))).toBe(true);
        expect(isSameMetricDateFilter(dateFilter("a"), dateFilter("b"))).toBe(false);
        // two filters on one dataset (and even one period) are different filters
        expect(isSameMetricDateFilter(dateFilter(undefined), dateFilter(undefined))).toBe(false);
    });

    it("recognizes the same record and never an attribute filter", () => {
        const record = dateFilter("a");
        expect(isSameMetricDateFilter(record, record)).toBe(true);
        expect(
            isSameMetricDateFilter(
                { attribute: "region", localIdentifier: "a" } as IBucketItemMetricFilter,
                dateFilter("a"),
            ),
        ).toBe(false);
    });
});

describe("Bucket Filters Reducer", () => {
    const DATE_DATASET_ID = "sample_dataset_id";
    const CATALOG_ITEM_ID = "sample_catalog_item_id";
    const ATTRIBUTE_ID = "sample_filter_attribute_id";
    const ATTRIBUTE_DF_REF = uriRef("sample_filter_attribute/displayForm/uri");
    const MEASURE_LOCAL_IDENTIFIER = "m1";

    const defaultBucketItemDefinition = {
        attribute: CATALOG_ITEM_ID,
        localIdentifier: MEASURE_LOCAL_IDENTIFIER,
    };

    const measureFilter = {
        identifier: ATTRIBUTE_ID,
        dfRef: ATTRIBUTE_DF_REF,
    };

    const COMPUTED_ATTRIBUTE_ID = "sample_filter_computed_attribute_id";
    const COMPUTED_ATTRIBUTE_DF_REF = idRef(COMPUTED_ATTRIBUTE_ID, "computedAttribute");

    const computedAttributeMeasureFilter = {
        identifier: COMPUTED_ATTRIBUTE_ID,
        type: "computedAttribute",
        ref: COMPUTED_ATTRIBUTE_DF_REF,
        dfRef: COMPUTED_ATTRIBUTE_DF_REF,
    };

    const dateFilter = {
        identifier: DATE_DATASET_ATTRIBUTE,
        interval: {
            name: "foo",
        },
    };

    const globalAttributeFilter: IAttributeFilter = {
        localIdentifier: "product_local_id",
        type: "attribute",
        cacheItemIdentifier: "product.id",
        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        filterConfig: {
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 123,
        },
    };

    const attributeFilter: IAttributeFilter = {
        localIdentifier: "country_local_id",
        type: "attribute",
        cacheItemIdentifier: "country.id",
        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
        filterConfig: {
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 123,
        },
    };

    const attributeFilterWithElements: IAttributeFilter = {
        localIdentifier: "country_local_id",
        type: "attribute",
        cacheItemIdentifier: "country.id",
        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
        filterConfig: {
            selectedElements: [{ title: "title1", uri: "uri1" }],
            isInverted: false,
            totalElementsCount: 123,
        },
    };

    const rankingFilter: IRankingFilter = {
        type: "ranking",
        localIdentifier: "rankingFilter1",
        measureLocalIdentifier: "m1",
        operator: "TOP",
        value: 10,
        attributes: ["a1"],
    };

    const dateDatasetFilter = {
        localIdentifier: "date1",
        type: "date",
        cacheItemIdentifier: "attr.dateDataset",
        filterConfig: {
            name: "all_time",
        },
        overTimeComparisonType: "nothing",
    };

    function getBucketIndex(state: IAppState, bucketName: string): number {
        const buckets = state.data.buckets;
        return buckets.findIndex((bucket: IRawBucket) => bucket?.localIdentifier === bucketName);
    }

    function bucketsAddMeasuresItem(state: IAppState, bucketItemObj: IRawBucketItem) {
        const measuresBucketIndex = getBucketIndex(state, MEASURES);
        return withData(state, {
            buckets: updateBucketItemsAt(state.data.buckets, measuresBucketIndex, (metric) => [
                ...(metric ?? []),
                bucketItemObj,
            ]),
        });
    }

    function bucketsGetItem(state: IAppState, bucketName: string, itemIndex: number) {
        const bucketIndex = getBucketIndex(state, bucketName);
        return state.data.buckets[bucketIndex].items[itemIndex];
    }

    function addBucket(state: IAppState, bucketName: string) {
        const bucket: IRawBucket = {
            localIdentifier: bucketName,
            items: [],
        };
        return withData(state, {
            buckets: [...(state.data.buckets ?? []), bucket],
        });
    }

    function addMeasureToMeasureBucket(state: IAppState, identifier: string, localIdentifier: string) {
        const measureCached = {
            type: METRIC,
        };
        const measureBucketItem = buildBucketItem({
            attribute: identifier,
            localIdentifier,
            type: METRIC,
        });
        const stateWithCache = withData(state, {
            itemCache: { ...state.data.itemCache, [identifier]: measureCached },
        });

        return bucketsAddMeasuresItem(stateWithCache, measureBucketItem);
    }

    describe("updateDateFilter", () => {
        const testFilterConfig: IDateFilterConfig = {
            granularity: "GDC.time.year",
            interval: [0, 1],
        };

        const testGlobalDateFilter: IDateFilter = {
            localIdentifier: "filterItemLocalIdentifier",
            type: "date",
            cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
            filterConfig: testFilterConfig,
            dateDatasetRef: DATE_FILTER_DATASET_REF,
        };

        const stateWithDateDatasets = setupAppStateWithDateDatasets(getInitializedState());
        const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(stateWithDateDatasets);
        const stateWithDateFilter = addGlobalDateFilter(stateWithDateDatasetMeta, testGlobalDateFilter);
        const stateWithMeasureBucketAndDateFilter = addBucket(stateWithDateFilter, MEASURES);

        it("should add derived measure when comparison enabled on master measure", async () => {
            const state = addMeasureToMeasureBucket(stateWithMeasureBucketAndDateFilter, "a1", "m1");

            const firstDateFilter = getFirstDateFilter(state);

            const action = storeUpdateDateFilter({
                localIdentifier: firstDateFilter.localIdentifier,
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                overTimeComparisonMeasures: ["m1"],
                filterConfig: testFilterConfig,
                dateDatasetRef: activityDateDataset.ref,
            });
            const reducedState = await dispatchAction(state, action);

            expect(getRefPointNonDerivedMeasures(reducedState)).toHaveLength(1);
            expect(getRefPointDerivedMeasures(reducedState)).toHaveLength(0);
            expect(PluggableVisualizationService.getNewDerivedBucketItems(reducedState)).toHaveLength(1);
        });

        describe("derived measures with comparison type", () => {
            it("should set proper comparison type to added derived measure", async () => {
                const state = addMeasureToMeasureBucket(stateWithMeasureBucketAndDateFilter, "a1", "m1");

                const firstDateFilter = getFirstDateFilter(state);

                const action = storeUpdateDateFilter({
                    localIdentifier: firstDateFilter.localIdentifier,
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    overTimeComparisonMeasures: ["m1"],
                    filterConfig: testFilterConfig,
                    dateDatasetRef: activityDateDataset.ref,
                });

                const reducedState = await dispatchAction(state, action);

                expect(getRefPointDerivedMeasures(reducedState)).toHaveLength(0);
                const firstDerivedMeasure =
                    PluggableVisualizationService.getNewDerivedBucketItems(reducedState)?.[0];

                expect(firstDerivedMeasure?.overTimeComparisonType).toEqual(
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                );
            });

            it("should set proper comparison type to added previous period measure", async () => {
                const state = addMeasureToMeasureBucket(stateWithMeasureBucketAndDateFilter, "a1", "m1");

                const firstDateFilter = getFirstDateFilter(state);

                const action = storeUpdateDateFilter({
                    localIdentifier: firstDateFilter.localIdentifier,
                    overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                    overTimeComparisonMeasures: ["m1"],
                    filterConfig: testFilterConfig,
                    dateDatasetRef: activityDateDataset.ref,
                });
                const reducedState = await dispatchAction(state, action);

                expect(getRefPointDerivedMeasures(reducedState)).toHaveLength(0);
                const firstDerivedMeasure =
                    PluggableVisualizationService.getNewDerivedBucketItems(reducedState)?.[0];

                expect(firstDerivedMeasure?.overTimeComparisonType).toEqual(
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                );
            });
        });

        it("should remove derived measure when comparison disabled on master measure", async () => {
            const state = addMeasureToMeasureBucket(stateWithMeasureBucketAndDateFilter, "a1", "m1");
            const derivedMeasureItem = {
                attribute: "a1",
                localIdentifier: "m1_pop",
                masterLocalIdentifier: "m1",
            };
            const stateWithDerivedMeasure = bucketsAddMeasuresItem(state, derivedMeasureItem);

            const firstDateFilter = getFirstDateFilter(stateWithDerivedMeasure);

            const action = storeUpdateDateFilter({
                localIdentifier: firstDateFilter.localIdentifier,
                overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
                overTimeComparisonMeasures: [],
                filterConfig: testFilterConfig,
                dateDatasetRef: activityDateDataset.ref,
            });
            const reducedState = await dispatchAction(stateWithDerivedMeasure, action);

            expect(getRefPointNonDerivedMeasures(reducedState)).toHaveLength(1);
            expect(getRefPointDerivedMeasures(reducedState)).toHaveLength(0);
        });
    });

    describe("updateDateFilterDateDataset", () => {
        const testFilterConfig: IDateFilterConfig = {
            granularity: "GDC.time.year",
            interval: [0, 1],
        };

        const testGlobalDateFilter: IDateFilter = {
            localIdentifier: "filterItemLocalIdentifier",
            type: "date",
            cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            filterConfig: testFilterConfig,
            dateDatasetRef: timelineDateDatasetRef,
        };

        const updatedGlobalDateFilter: IDateFilterConfig = {
            name: ALL_TIME,
            interval: undefined,
            granularity: undefined,
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
                        uri: "/gdc/md/obj/679?id=1",
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
        const stateWithDateFilter = addGlobalDateFilter(state, testGlobalDateFilter);
        const stateWithAdditionalFilters = FilterBarService.addFilter(
            stateWithDateFilter,
            additionalDateFilter,
        );

        it("should set new date dataset in date filter as well as dependencies that were reset", async () => {
            const action = storeUpdateDateFilterDateDataset(
                "filterItemLocalIdentifier",
                activityDateDatasetRef,
                updatedGlobalDateFilter,
                OverTimeComparisonTypes.NOTHING,
            );
            const reducedState = await dispatchAction(stateWithDateFilter, action);

            expect(getFirstDateFilter(reducedState).dateDatasetRef).toEqual(activityDateDatasetRef);
            expect(getFirstDateFilter(reducedState).filterConfig).toEqual(updatedGlobalDateFilter);
            expect(getFirstDateFilter(reducedState).overTimeComparisonType).toEqual(
                OverTimeComparisonTypes.NOTHING,
            );
        });

        it("should keep empty values filter mode when changing date dataset", async () => {
            const stateWithEmptyValues = addGlobalDateFilter(state, {
                ...testGlobalDateFilter,
                emptyDateValuesFilter: "exclude",
            });
            const action = storeUpdateDateFilterDateDataset(
                "filterItemLocalIdentifier",
                activityDateDatasetRef,
                updatedGlobalDateFilter,
                OverTimeComparisonTypes.NOTHING,
            );
            const reducedState = await dispatchAction(stateWithEmptyValues, action);

            expect(getFirstDateFilter(reducedState).emptyDateValuesFilter).toEqual("exclude");
        });

        it("should migrate additional filters", async () => {
            const action = storeUpdateDateFilterDateDataset(
                "filterItemLocalIdentifier",
                activityDateDatasetRef,
                updatedGlobalDateFilter,
                OverTimeComparisonTypes.NOTHING,
            );
            const reducedState = await dispatchAction(stateWithAdditionalFilters, action);

            const migratedFilter = getFilterBarState(reducedState).items.find(
                (filter) => filter.type === "attribute",
            );
            expect(migratedFilter).toMatchSnapshot();
        });

        it("should keep the selection of a migrated additional filter and not flag it", async () => {
            const action = storeUpdateDateFilterDateDataset(
                "filterItemLocalIdentifier",
                activityDateDatasetRef,
                updatedGlobalDateFilter,
                OverTimeComparisonTypes.NOTHING,
            );
            const reducedState = await dispatchAction(stateWithAdditionalFilters, action);

            const migratedFilter = getFilterBarState(reducedState).items.find(
                (filter) => filter.type === "attribute",
            );
            expect(migratedFilter.filterConfig).toEqual(additionalDateFilter.filterConfig);
            expect(getFilterBarState(reducedState).migratedAdditionalFilters).toEqual([]);
        });

        it("should remove an additional filter the new date dataset has no granularity for and flag it", async () => {
            // Day of Quarter exists on Activity only, so moving the filter to Timeline drops it
            const dayOfQuarterFilter: IAttributeFilter = {
                ...additionalDateFilter,
                localIdentifier: "additional.dayOfQuarter",
                cacheItemIdentifier: "activity.day.in.quarter",
                displayFormRef: uriRef("/gdc/md/697"),
            };
            const stateOnActivity = FilterBarService.addFilter(
                addGlobalDateFilter(state, {
                    ...testGlobalDateFilter,
                    dateDatasetRef: activityDateDatasetRef,
                }),
                dayOfQuarterFilter,
            );
            const action = storeUpdateDateFilterDateDataset(
                "filterItemLocalIdentifier",
                timelineDateDatasetRef,
                updatedGlobalDateFilter,
                OverTimeComparisonTypes.NOTHING,
            );
            const reducedState = await dispatchAction(stateOnActivity, action);

            expect(
                getFilterBarState(reducedState).items.find(
                    (filter) => filter.localIdentifier === "additional.dayOfQuarter",
                ),
            ).toBeUndefined();
            expect(getFilterBarState(reducedState).migratedAdditionalFilters).toEqual([
                "additional.dayOfQuarter",
            ]);
        });

        it("should not migrate additional filters when new date dataset is the same as the current one", async () => {
            const action = storeUpdateDateFilterDateDataset(
                testGlobalDateFilter.localIdentifier,
                timelineDateDatasetRef,
            );
            const reducedState = await dispatchAction(stateWithAdditionalFilters, action);

            expect(getFilterBarState(reducedState)).toBe(getFilterBarState(stateWithAdditionalFilters));
        });
    });

    describe("updateAttributeFilter", () => {
        const action = updateAttributeFilter({
            filterLocalIdentifier: "product_local_id",
            totalElementsCount: 100,
            selectedElements: [
                {
                    title: "title",
                    uri: "uri",
                },
            ],
            isInverted: false,
        });

        const stateWithAttributeFilter = addGlobalDateFilter(getInitializedState(), globalAttributeFilter);

        it("should update the the attribute filter configuration in the state", async () => {
            const reducedState = await dispatchAction(stateWithAttributeFilter, action);

            const updatedAttributeFilter = getAttributeFilter(
                reducedState,
                globalAttributeFilter.localIdentifier,
            );
            expect(updatedAttributeFilter.filterConfig.selectedElements).toEqual(
                action.payload.selectedElements,
            );
            expect(updatedAttributeFilter.filterConfig.isInverted).toEqual(action.payload.isInverted);
            expect(updatedAttributeFilter.filterConfig.totalElementsCount).toEqual(
                action.payload.totalElementsCount,
            );
        });

        it("should mark the filter as modified in the BUCKETSMETA_MODIFIED", async () => {
            const reducedState = await dispatchAction(stateWithAttributeFilter, action);

            const isModified =
                reducedState.data.bucketsMeta.modified[globalAttributeFilter.cacheItemIdentifier];
            expect(isModified).toBe(true);
        });

        it("should reflect updated filter in the reference point", async () => {
            const reducedState = await dispatchAction(stateWithAttributeFilter, action);

            const newRefPoint = reducedState.data.referencePoint.filters;
            expect(newRefPoint?.items?.[0]?.filters?.[0]).toMatchObject({
                totalElementsCount: 100,
                selectedElements: [
                    {
                        title: "title",
                        uri: "uri",
                    },
                ],
                isInverted: false,
            });
        });
    });

    describe("updateAttributeFilterDisplayForm", () => {
        const action = updateAttributeFilterDisplayForm({
            filterLocalIdentifier: "country_local_id",
            displayAsDfRef: uriRef("/updatedDisplayFormUri"),
        });

        const actionWithPrimaryDf = updateAttributeFilterDisplayForm({
            filterLocalIdentifier: "country_local_id",
            displayAsDfRef: uriRef("/updatedDisplayFormUri"),
            primaryDfRef: uriRef("/updatedDisplayFormUri"),
            selectedElements: [],
        });

        it("should update attribute filter display form, selected elements and inverted prop in state", async () => {
            const stateWithAttributeFilter = addGlobalDateFilter(
                getInitializedState(),
                attributeFilterWithElements,
            );

            const reducedState = await dispatchAction(stateWithAttributeFilter, actionWithPrimaryDf);
            const updatedAttributeFilter = getAttributeFilter(
                reducedState,
                attributeFilterWithElements.localIdentifier,
            );

            expect(updatedAttributeFilter.displayFormRef).toEqual(actionWithPrimaryDf.payload.displayAsDfRef);
            expect(updatedAttributeFilter.filterConfig).toEqual({
                totalElementsCount: 123,
                selectedElements: [],
                isInverted: true,
            });
        });

        it("should update attribute filter display form in config, and keep original selection in state", async () => {
            const stateWithAttributeFilter = addGlobalDateFilter(
                getInitializedState(),
                attributeFilterWithElements,
            );

            const reducedState = await dispatchAction(stateWithAttributeFilter, action);
            const updatedAttributeFilter = getAttributeFilter(
                reducedState,
                attributeFilterWithElements.localIdentifier,
            );
            const updatedFilterConfig = getAttributeFilterConfig(
                reducedState,
                attributeFilterWithElements.localIdentifier,
            );
            expect(updatedAttributeFilter.displayFormRef).toEqual(attributeFilterWithElements.displayFormRef);
            expect(updatedFilterConfig.displayAsLabel).toEqual(actionWithPrimaryDf.payload.displayAsDfRef);
            expect(updatedAttributeFilter.filterConfig).toEqual({
                totalElementsCount: 123,
                selectedElements: attributeFilterWithElements.filterConfig.selectedElements,
                isInverted: attributeFilterWithElements.filterConfig.isInverted,
            });
        });

        it("should set filter in reference point", async () => {
            const stateWithAttributeFilter = addGlobalDateFilter(
                getInitializedState(),
                attributeFilterWithElements,
            );

            const reducedState = await dispatchAction(stateWithAttributeFilter, actionWithPrimaryDf);
            const referencePointFilters = reducedState.data.referencePoint.filters;

            const attributeFilterDetail = referencePointFilters.items[0]
                .filters[0] as IRefPointAttributeFilterDetail;
            expect(attributeFilterDetail.displayFormRef).toEqual(actionWithPrimaryDf.payload.displayAsDfRef);
        });
    });

    describe("updateOrAddNewFilterItems", () => {
        // the embedded command is a saga OPERATION: the suite drives the real
        // STORE_ADD_OR_UPDATE_FILTER_ITEMS trigger through the full production path instead of
        // calling the deleted whole-root handler.
        it("should update the filters on filter bar", async () => {
            const stateWithFilters = withData(getInitializedState(), {
                filterBar: {
                    ...defaultFilterBarState,
                    items: [
                        globalAttributeFilter,
                        attributeFilter,
                        dateDatasetFilter as IFilter,
                        rankingFilter,
                    ],
                    isMultiline: false,
                },
            });
            const updatedState = await dispatchAction(
                stateWithFilters,
                commandAddOrUpdateFilterItems({
                    attributeFilters: [
                        {
                            filterLocalIdentifier: "country_local_id",
                            totalElementsCount: 100,
                            selectedElements: [
                                {
                                    title: "element1",
                                    uri: "/uri1",
                                },
                            ],
                            isInverted: true,
                        },
                    ],
                    dateFilter: {
                        localIdentifier: "date1",
                        filterConfig: {
                            interval: ["2020-01-01", "2020-01-02"],
                            type: "absolute",
                            granularity: GRANULARITY.DATE,
                        },
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                    rankingFilter: {
                        filter: rankingFilter,
                    },
                }),
            );
            const updatedAttributeFilter = getAttributeFilter(updatedState, "country_local_id");
            const updatedDateFilter = getFirstDateFilter(updatedState);
            const updatedRankingFilter = getRankingFilter(updatedState);
            expect(updatedAttributeFilter.localIdentifier).toBe("country_local_id");
            expect(updatedAttributeFilter.filterConfig).toEqual({
                totalElementsCount: 100,
                selectedElements: [
                    {
                        title: "element1",
                        uri: "/uri1",
                    },
                ],
                isInverted: true,
            });
            expect(updatedDateFilter.filterConfig).toEqual({
                interval: ["2020-01-01", "2020-01-02"],
                type: "absolute",
                granularity: GRANULARITY.DATE,
            });
            expect(updatedRankingFilter).toEqual(rankingFilter);
        });

        it("should not update the filters on filter bar", async () => {
            const stateWithFilters = withData(getInitializedState(), {
                filterBar: {
                    ...defaultFilterBarState,
                    items: [globalAttributeFilter, dateDatasetFilter as IFilter],
                    isMultiline: false,
                },
            });
            const updatedState = await dispatchAction(
                stateWithFilters,
                commandAddOrUpdateFilterItems({ attributeFilters: [] }),
            );
            const updatedGlobalAttribute = getAttributeFilter(updatedState, "product_local_id");
            const updatedDateFilter = getFirstDateFilter(updatedState);

            expect(updatedGlobalAttribute.filterConfig).toEqual({
                totalElementsCount: 123,
                selectedElements: [],
                isInverted: true,
            });
            expect(updatedDateFilter.filterConfig).toEqual({
                name: "all_time",
            });
        });

        it("should add new filter into filter bar", async () => {
            const stateWithFilters = withData(getInitializedState(), {
                filterBar: {
                    ...getInitializedState().data.filterBar,
                    items: [globalAttributeFilter],
                    isMultiline: false,
                },
            });
            const updatedState = await dispatchAction(
                stateWithFilters,
                commandAddOrUpdateFilterItems({
                    attributeFilters: [
                        {
                            filterLocalIdentifier: undefined,
                            totalElementsCount: 100,
                            selectedElements: [
                                {
                                    title: "element1",
                                    uri: "/uri1",
                                },
                            ],
                            isInverted: true,
                            dfUri: "dfUri1",
                            cacheItemIdentifier: "att1.identifier",
                        },
                    ],
                    dateFilter: {
                        localIdentifier: "id",
                        filterConfig: {
                            interval: ["2020-01-01", "2020-01-02"],
                            type: "absolute",
                            granularity: GRANULARITY.DATE,
                        },
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                    rankingFilter: {
                        filter: rankingFilter,
                    },
                }),
            );
            const updatedAttributeFilter = getAttributeFilterById(updatedState, "att1.identifier");
            const updatedDateFilter = getFirstDateFilter(updatedState);
            const updatedRankingFilter = getRankingFilter(updatedState);

            expect(updatedAttributeFilter.filterConfig).toEqual({
                selectedElements: [
                    {
                        title: "element1",
                        uri: "/uri1",
                    },
                ],
                isInverted: true,
                totalElementsCount: 100,
            });
            expect(updatedDateFilter.filterConfig).toEqual({
                interval: ["2020-01-01", "2020-01-02"],
                type: "absolute",
                granularity: GRANULARITY.DATE,
            });
            expect(updatedRankingFilter).toEqual(rankingFilter);
        });
    });

    describe("setBucketItemAddMetricFilter", () => {
        let stateWithBucket: IAppState;

        beforeEach(() => {
            stateWithBucket = addBucket(getInitializedState(), MEASURES);
        });

        it("should add filter to bucket item", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );
            const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filters).toHaveLength(1);
            expect(filters[0].attribute).toEqual(ATTRIBUTE_ID);
        });

        it("should give the legacy date filter a local identifier, as the picker's add does", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(
                    item,
                    { identifier: DATE_DATASET_ATTRIBUTE, interval: { name: "this_year" } } as never,
                    DATE_DATASET_ID,
                ),
            );

            const [filter] = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filter.attribute).toEqual(DATE_DATASET_ATTRIBUTE);
            expect(typeof filter.localIdentifier).toBe("string");
        });

        it("should add attribute to the item cache", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );
            expect(reducedState.data.itemCache[`attribute.${ATTRIBUTE_ID}`]).toBeDefined();
        });

        it("should add a computed attribute to its own item cache namespace", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, computedAttributeMeasureFilter, DATE_DATASET_ID),
            );

            // merging it under `attribute.<id>` would shadow a regular attribute sharing the id
            expect(reducedState.data.itemCache[`computedAttribute.${COMPUTED_ATTRIBUTE_ID}`]).toBeDefined();
            expect(reducedState.data.itemCache[`attribute.${COMPUTED_ATTRIBUTE_ID}`]).toBeUndefined();
        });

        it("should keep the computed attribute type on the filter's display form ref", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, computedAttributeMeasureFilter, DATE_DATASET_ID),
            );

            const [filter] = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filter.attribute).toEqual(COMPUTED_ATTRIBUTE_ID);
            expect(filter.displayFormRef).toEqual(COMPUTED_ATTRIBUTE_DF_REF);
        });

        describe("several attribute filters at once", () => {
            it("should add a filter per attribute in one dispatch", async () => {
                const item = buildBucketItem(defaultBucketItemDefinition);
                const state = bucketsAddMeasuresItem(stateWithBucket, item);
                const reducedState = await dispatchAction(
                    state,
                    setBucketItemAddMetricFilters(item, [measureFilter, computedAttributeMeasureFilter]),
                );

                const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
                expect(filters.map((filter) => filter.attribute)).toEqual([
                    ATTRIBUTE_ID,
                    COMPUTED_ATTRIBUTE_ID,
                ]);
                // each gets its own local identifier and display form config
                expect(new Set(filters.map((filter) => filter.localIdentifier)).size).toBe(2);
                expect(reducedState.data.itemCache[`attribute.${ATTRIBUTE_ID}`]).toBeDefined();
                expect(
                    reducedState.data.itemCache[`computedAttribute.${COMPUTED_ATTRIBUTE_ID}`],
                ).toBeDefined();
            });

            it("should leave the state alone when nothing is picked", async () => {
                const item = buildBucketItem(defaultBucketItemDefinition);
                const state = bucketsAddMeasuresItem(stateWithBucket, item);
                const reducedState = await dispatchAction(state, setBucketItemAddMetricFilters(item, []));

                expect(bucketsGetItem(reducedState, MEASURES, 0).filters).toHaveLength(0);
            });
        });

        describe("external (post message) filters", () => {
            it("should type the display form ref of an external filter by what it references", async () => {
                const reducedState = await dispatchAction(
                    getInitializedState(),
                    commandAddOrUpdateFilterItems({
                        attributeFilters: [
                            {
                                filterLocalIdentifier: undefined,
                                isInverted: false,
                                selectedElements: [],
                                totalElementsCount: 0,
                                dfIdentifier: COMPUTED_ATTRIBUTE_ID,
                                dfType: "computedAttribute",
                                cacheItemIdentifier: COMPUTED_ATTRIBUTE_ID,
                            },
                            {
                                filterLocalIdentifier: undefined,
                                isInverted: false,
                                selectedElements: [],
                                totalElementsCount: 0,
                                dfIdentifier: "label.id",
                                cacheItemIdentifier: "attribute.id",
                            },
                        ],
                        arbitraryFilters: [
                            {
                                dfIdentifier: COMPUTED_ATTRIBUTE_ID,
                                dfType: "computedAttribute",
                                cacheItemIdentifier: COMPUTED_ATTRIBUTE_ID,
                                values: ["a"],
                                negativeSelection: false,
                            },
                        ],
                        matchFilters: [
                            {
                                dfIdentifier: "label.id",
                                dfType: "displayForm",
                                cacheItemIdentifier: "attribute.id",
                                operator: "contains",
                                literal: "a",
                            },
                        ],
                    }),
                );

                const displayFormRefs = getFilterItems(reducedState)
                    .filter(FilterBar.isAttributeFilter)
                    .map((filter) => filter.displayFormRef);

                // a computed attribute is referenced directly; a missing type means a label
                expect(displayFormRefs).toEqual([
                    COMPUTED_ATTRIBUTE_DF_REF,
                    idRef("label.id", "displayForm"),
                    COMPUTED_ATTRIBUTE_DF_REF,
                    idRef("label.id", "displayForm"),
                ]);
            });
        });

        it("should add metricDateFilter to bucket item", async () => {
            const item = buildBucketItem({
                attribute: CATALOG_ITEM_ID,
            });
            const state = bucketsAddMeasuresItem(stateWithBucket, item);

            const metricWithoutFilter = bucketsGetItem(state, MEASURES, 0);
            expect(metricWithoutFilter.filters).toHaveLength(0);

            const reduced = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, dateFilter, DATE_DATASET_ID),
            );

            const metricWithFilter = bucketsGetItem(reduced, MEASURES, 0);
            expect(metricWithFilter.filters).toHaveLength(1);
        });

        it("should set reference point", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);
            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );

            const buckets = reducedState.data.buckets;
            const referencePoint = reducedState.data.referencePoint.buckets;

            expect(buckets).toEqual(referencePoint);
        });

        it('should set selected date dataset URI from the "dateFilter" object', async () => {
            const item = buildBucketItem({
                attribute: CATALOG_ITEM_ID,
                localIdentifier: MEASURE_LOCAL_IDENTIFIER,
            });
            let state = bucketsAddMeasuresItem(stateWithBucket, item);
            const availableMeasureDatasets = [activityDateDataset, closedDateDataset];
            state = seedMeasureDateDatasetStatus(
                state,
                MEASURE_LOCAL_IDENTIFIER,
                availableMeasureDatasets,
                1,
            );

            const originalStatus = getMeasureDateDatasetStatus(state, MEASURE_LOCAL_IDENTIFIER);
            expect(originalStatus.selectedDateDatasetUri).toBeUndefined();

            const reducedState = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, dateFilter, closedDateDataset.identifier),
            );

            const updatedStatus = getMeasureDateDatasetStatus(reducedState, MEASURE_LOCAL_IDENTIFIER);
            expect(updatedStatus.selectedDateDatasetUri).toEqual(closedDateDataset.uri);
            // the filter names its dataset itself as well
            expect(bucketsGetItem(reducedState, MEASURES, 0).filters[0].dimension).toEqual(
                closedDateDataset.identifier,
            );
        });

        it("stamps a legacy date dataset selection on the metric's primary date filter", async () => {
            const item = buildBucketItem({
                attribute: CATALOG_ITEM_ID,
                localIdentifier: MEASURE_LOCAL_IDENTIFIER,
            });
            let state = bucketsAddMeasuresItem(stateWithBucket, item);
            state = seedMeasureDateDatasetStatus(
                state,
                MEASURE_LOCAL_IDENTIFIER,
                [activityDateDataset, closedDateDataset],
                1,
            );
            const withDateFilter = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, dateFilter, closedDateDataset.identifier),
            );

            const reducedState = await dispatchAction(
                withDateFilter,
                selectDateDataset(MEASURE_LOCAL_IDENTIFIER, activityDateDataset.identifier),
            );

            expect(bucketsGetItem(reducedState, MEASURES, 0).filters[0].dimension).toEqual(
                activityDateDataset.identifier,
            );
            expect(reducedState.data.referencePoint.buckets).toEqual(reducedState.data.buckets);
        });
    });

    describe("setBucketItemRemoveMetricFilter", () => {
        let stateWithBucket: IAppState;

        beforeEach(() => {
            stateWithBucket = addBucket(getInitializedState(), MEASURES);
        });

        it("should remove filter from bucket item", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);

            const stateAddedFilter = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );

            const metric = bucketsGetItem(stateAddedFilter, MEASURES, 0);

            const filterToRemove = metric.filters[0];
            const stateRemovedFilter = await dispatchAction(
                stateAddedFilter,
                setBucketItemRemoveMetricFilter(metric, filterToRemove),
            );

            const filters = bucketsGetItem(stateRemovedFilter, MEASURES, 0).filters;
            expect(filters).toHaveLength(0);
        });

        it("should set reference point", async () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const state = bucketsAddMeasuresItem(stateWithBucket, item);

            const stateAddedFilter = await dispatchAction(
                state,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );

            const metric = bucketsGetItem(stateAddedFilter, MEASURES, 0);

            const filterToRemove = metric.filters[0];
            const reducedState = await dispatchAction(
                stateAddedFilter,
                setBucketItemRemoveMetricFilter(metric, filterToRemove),
            );

            const buckets = reducedState.data.buckets;
            const referencePoint = reducedState.data.referencePoint.buckets;

            expect(buckets).toEqual(referencePoint);
        });

        describe("selected date dataset reset", () => {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const localIdentifier = item.localIdentifier;

            it("should reset when removing date filter", async () => {
                let state = bucketsAddMeasuresItem(stateWithBucket, item);

                state = await dispatchAction(
                    state,
                    setBucketItemAddMetricFilter(item, dateFilter, DATE_DATASET_ID),
                );

                const metric = bucketsGetItem(state, MEASURES, 0);

                const filterToRemove = metric.filters[0];
                state = await dispatchAction(state, setBucketItemRemoveMetricFilter(metric, filterToRemove));

                const selectedDateDataset = getMeasureDateDatasetStatus(state, localIdentifier);

                expect(selectedDateDataset.selectedDateDatasetUri).toBeUndefined();
            });

            it("should not reset when removing some other attribute filter", async () => {
                let state = bucketsAddMeasuresItem(stateWithBucket, item);
                state = await dispatchAction(
                    state,
                    setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
                );
                const availableMeasureDatasets = [activityDateDataset, closedDateDataset];
                state = seedMeasureDateDatasetStatus(
                    state,
                    MEASURE_LOCAL_IDENTIFIER,
                    availableMeasureDatasets,
                    1,
                );
                state = seedMeasureDateDatasetSelection(state, localIdentifier, closedDateDataset.identifier);

                const metric = bucketsGetItem(state, MEASURES, 0);

                const filterToRemove = metric.filters[0];
                state = await dispatchAction(state, setBucketItemRemoveMetricFilter(metric, filterToRemove));

                const selectedDateDataset = getMeasureDateDatasetStatus(state, localIdentifier);

                expect(selectedDateDataset.selectedDateDatasetUri).toEqual(closedDateDataset.uri);
            });
        });
    });

    describe("setBucketItemUpdateMetricFilter", () => {
        async function getStateAndBucketItem(filter = measureFilter) {
            const item = buildBucketItem(defaultBucketItemDefinition);
            const stateWithBucketItem = bucketsAddMeasuresItem(
                addBucket(getInitializedState(), MEASURES),
                item,
            );
            const stateWithFilter = await dispatchAction(
                stateWithBucketItem,
                setBucketItemAddMetricFilter(item, filter, DATE_DATASET_ID),
            );

            return {
                state: stateWithFilter,
                item: bucketsGetItem(stateWithFilter, MEASURES, 0),
            };
        }

        it("should update filter of bucket item", async () => {
            const { state, item } = await getStateAndBucketItem();

            const filterToUpdate = item?.filters?.[0];
            const filterChanges = {
                isInverted: false,
                totalElementsCount: 3,
            };
            const reducedState = await dispatchAction(
                state,
                setBucketItemUpdateMetricFilter(item, filterToUpdate, filterChanges),
            );

            const filter = bucketsGetItem(reducedState, MEASURES, 0).filters[0];
            expect(filter.isInverted).toEqual(false);
            expect(filter.totalElementsCount).toEqual(3);
        });

        it("should set bucketsMeta modified flag", async () => {
            const catalogFilter = {
                identifier: CATALOG_ITEM_ID,
                dfRef: ATTRIBUTE_DF_REF,
            };
            const { state, item } = await getStateAndBucketItem(catalogFilter);

            const filterToUpdate = item?.filters?.[0];
            const filterChanges = {};

            const reducedState = await dispatchAction(
                state,
                setBucketItemUpdateMetricFilter(item, filterToUpdate, filterChanges),
            );

            const bucketsMetaModified = reducedState.data.bucketsMeta.modified;
            expect(bucketsMetaModified["sample_catalog_item_id"]).toEqual(true);
        });

        it("should set buckets in reference point", async () => {
            const { state, item } = await getStateAndBucketItem();

            const filterToUpdate = item?.filters?.[0];
            const filterChanges = {};

            const reducedState = await dispatchAction(
                state,
                setBucketItemUpdateMetricFilter(item, filterToUpdate, filterChanges),
            );

            const referencePointBuckets = reducedState.data.referencePoint.buckets;
            const buckets = reducedState.data.buckets;
            expect(referencePointBuckets).toEqual(buckets);
        });
    });

    describe("setBucketItemApplyMetricDateFilter", () => {
        // the activity date dataset's "Month (Activity)" and "Day of Week (Activity)" attributes
        const monthOfYearDfRef = uriRef("/gdc/md/607");
        const dayOfWeekDfRef = uriRef("/gdc/md/680");

        const additionalDateFilter = (
            localIdentifier: string,
            cacheItemIdentifier: string,
            displayFormRef: ReturnType<typeof uriRef>,
            selectedElements: Array<{ uri: string; title: string }>,
        ): IAttributeFilter => ({
            type: "attribute",
            localIdentifier,
            cacheItemIdentifier,
            displayFormRef,
            filterConfig: { selectedElements, isInverted: false, totalElementsCount: 12 },
        });

        const monthOfYear = additionalDateFilter("moy", "activity.month.in.year", monthOfYearDfRef, [
            { uri: "1", title: "January" },
        ]);
        const dayOfWeek = additionalDateFilter("dow", "activity.day.in.week", dayOfWeekDfRef, [
            { uri: "2", title: "Tuesday" },
        ]);
        // what the shared picker hands over, and the interval the store keeps for it
        const yearOption = (from: number, to: number, localIdentifier: string): IDateFilterOption => ({
            filterOption: {
                type: "relativePreset",
                granularity: "GDC.time.year",
                from,
                to,
                localIdentifier,
                name: "",
                visible: true,
            },
            excludeCurrentPeriod: false,
        });
        const thisYear = yearOption(0, 0, "THIS_YEAR");
        const lastYear = yearOption(-1, -1, "LAST_YEAR");
        const storedYear = (from: number, to: number, name: string): IPresetItem => ({
            type: "relative",
            granularity: "GDC.time.year",
            interval: [from, to],
            name,
        });
        // the metric date filter picker's gesture is one whitelisted UI action, so every snapshot the
        // gesture leaves in the history was taken before THAT action (dispatchAction reduces the
        // action twice, so counting snapshots would only pin the helper)
        const snapshotActionTypes = (before: IAppState, after: IAppState) =>
            after.timeTravel.past.slice(before.timeTravel.past.length).map((snapshot) => snapshot.actionType);

        let item: IRawBucketItem;
        let stateWithMeasure: IAppState;

        beforeEach(() => {
            item = buildBucketItem(defaultBucketItemDefinition);
            const state = seedDateDatasetsMeta(addBucket(getInitializedState(), MEASURES), {
                items: dateDatasetsMetaItems,
            });
            stateWithMeasure = seedMeasureDateDatasetStatus(
                bucketsAddMeasuresItem(state, item),
                item.localIdentifier,
                [activityDateDataset, closedDateDataset],
                0,
            );
        });

        it("adds the date filter, selects the date dataset and adds the additional date filters at once", async () => {
            const reducedState = await dispatchAction(
                stateWithMeasure,
                setBucketItemApplyMetricDateFilter(item, {
                    dateFilter: undefined,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: closedDateDataset.identifier,
                    additionalDateFilters: [monthOfYear],
                }),
            );

            const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filters).toHaveLength(2);
            expect(filters[0]).toMatchObject({
                attribute: DATE_DATASET_ATTRIBUTE,
                interval: storedYear(0, 0, "THIS_YEAR"),
                dimension: closedDateDataset.identifier,
            });
            expect(filters[1]).toMatchObject({
                localIdentifier: "moy",
                attribute: "activity.month.in.year",
                displayFormRef: monthOfYearDfRef,
                selectedElements: [{ uri: "1", title: "January" }],
                isInverted: false,
                totalElementsCount: 12,
            });
            expect(
                getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
            ).toEqual(closedDateDataset.uri);
            expect(reducedState.data.filterBar.attributeFilterConfigs["moy"]).toEqual({
                displayAsLabel: monthOfYearDfRef,
            });
        });

        it("stores the empty date values mode on the date filter and drops it when applied without one", async () => {
            const withMode = await dispatchAction(
                stateWithMeasure,
                setBucketItemApplyMetricDateFilter(item, {
                    dateFilter: undefined,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: closedDateDataset.identifier,
                    additionalDateFilters: [],
                    emptyDateValuesFilter: "exclude",
                }),
            );
            const stored = bucketsGetItem(withMode, MEASURES, 0).filters[0];
            expect(stored).toMatchObject({
                attribute: DATE_DATASET_ATTRIBUTE,
                interval: storedYear(0, 0, "THIS_YEAR"),
                emptyDateValuesFilter: "exclude",
            });

            const withoutMode = await dispatchAction(
                withMode,
                setBucketItemApplyMetricDateFilter(bucketsGetItem(withMode, MEASURES, 0), {
                    dateFilter: stored,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: closedDateDataset.identifier,
                    additionalDateFilters: [],
                }),
            );
            const filters = bucketsGetItem(withoutMode, MEASURES, 0).filters;
            expect(filters).toHaveLength(1);
            expect(filters[0]).not.toHaveProperty("emptyDateValuesFilter");
        });

        it("stores All time as the bare preset name next to the additional date filters", async () => {
            const allTime: IDateFilterOption = {
                filterOption: { type: "allTime", localIdentifier: "ALL_TIME", name: "", visible: true },
                excludeCurrentPeriod: false,
            };

            const reducedState = await dispatchAction(
                stateWithMeasure,
                setBucketItemApplyMetricDateFilter(item, {
                    dateFilter: undefined,
                    dateFilterOption: allTime,
                    dateDatasetIdentifier: closedDateDataset.identifier,
                    additionalDateFilters: [monthOfYear],
                }),
            );

            const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filters[0]).toMatchObject({
                attribute: DATE_DATASET_ATTRIBUTE,
                interval: { name: ALL_TIME },
            });
            expect(filters[1]).toMatchObject({ attribute: "activity.month.in.year" });
        });

        it("is a single undo step", async () => {
            const reducedState = await dispatchAction(
                stateWithMeasure,
                setBucketItemApplyMetricDateFilter(item, {
                    dateFilter: undefined,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: DATE_DATASET_ID,
                    additionalDateFilters: [monthOfYear],
                }),
            );

            expect(new Set(snapshotActionTypes(stateWithMeasure, reducedState))).toEqual(
                new Set([ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER]),
            );
        });

        it("updates the period of an existing date filter and replaces only the additional date filters", async () => {
            const withRegularFilter = await dispatchAction(
                stateWithMeasure,
                setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
            );
            const withMonthOfYear = await dispatchAction(
                withRegularFilter,
                setBucketItemApplyMetricDateFilter(bucketsGetItem(withRegularFilter, MEASURES, 0), {
                    dateFilter: undefined,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: DATE_DATASET_ID,
                    additionalDateFilters: [monthOfYear],
                }),
            );

            const storedDateFilter = bucketsGetItem(withMonthOfYear, MEASURES, 0).filters.find(
                (filter: IBucketItemMetricFilter) => filter.attribute === DATE_DATASET_ATTRIBUTE,
            );
            const reducedState = await dispatchAction(
                withMonthOfYear,
                setBucketItemApplyMetricDateFilter(bucketsGetItem(withMonthOfYear, MEASURES, 0), {
                    dateFilter: storedDateFilter,
                    dateFilterOption: lastYear,
                    dateDatasetIdentifier: DATE_DATASET_ID,
                    additionalDateFilters: [dayOfWeek],
                }),
            );

            const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
            expect(filters.map((filter: IBucketItemMetricFilter) => filter.attribute)).toEqual([
                ATTRIBUTE_ID,
                DATE_DATASET_ATTRIBUTE,
                "activity.day.in.week",
            ]);
            expect(filters[1].interval).toEqual(storedYear(-1, -1, "LAST_YEAR"));
            expect(reducedState.data.filterBar.attributeFilterConfigs["moy"]).toBeUndefined();
            expect(reducedState.data.filterBar.attributeFilterConfigs["dow"]).toEqual({
                displayAsLabel: dayOfWeekDfRef,
            });
        });

        it("syncs the reference point", async () => {
            const reducedState = await dispatchAction(
                stateWithMeasure,
                setBucketItemApplyMetricDateFilter(item, {
                    dateFilter: undefined,
                    dateFilterOption: thisYear,
                    dateDatasetIdentifier: DATE_DATASET_ID,
                    additionalDateFilters: [monthOfYear],
                }),
            );

            expect(reducedState.data.referencePoint.buckets).toEqual(reducedState.data.buckets);
        });

        describe("several date filters", () => {
            const dateFilterOf = (state: IAppState) =>
                bucketsGetItem(state, MEASURES, 0).filters.filter(
                    (filter: IBucketItemMetricFilter) => filter.attribute === DATE_DATASET_ATTRIBUTE,
                );

            let withPrimary: IAppState;

            beforeEach(async () => {
                withPrimary = await dispatchAction(
                    stateWithMeasure,
                    setBucketItemApplyMetricDateFilter(item, {
                        dateFilter: undefined,
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: closedDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
            });

            it("adds a further date filter on another dataset, keeping the selection on the primary one", async () => {
                const reducedState = await dispatchAction(
                    withPrimary,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withPrimary, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );

                expect(dateFilterOf(reducedState)).toMatchObject([
                    { dimension: closedDateDataset.identifier, interval: storedYear(0, 0, "THIS_YEAR") },
                    { dimension: activityDateDataset.identifier, interval: storedYear(-1, -1, "LAST_YEAR") },
                ]);
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(closedDateDataset.uri);
            });

            it("leaves the primary date filter's additional date filters alone when a further one is added or edited", async () => {
                const withAdditional = await dispatchAction(
                    stateWithMeasure,
                    setBucketItemApplyMetricDateFilter(item, {
                        dateFilter: undefined,
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: closedDateDataset.identifier,
                        additionalDateFilters: [monthOfYear],
                    }),
                );
                const withSecond = await dispatchAction(
                    withAdditional,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withAdditional, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
                const reducedState = await dispatchAction(
                    withSecond,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withSecond, MEASURES, 0), {
                        dateFilter: { ...dateFilterOf(withSecond)[1] },
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );

                const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
                expect(filters.map((filter: IBucketItemMetricFilter) => filter.attribute)).toEqual([
                    DATE_DATASET_ATTRIBUTE,
                    "activity.month.in.year",
                    DATE_DATASET_ATTRIBUTE,
                ]);
                expect(reducedState.data.filterBar.attributeFilterConfigs["moy"]).toEqual({
                    displayAsLabel: monthOfYearDfRef,
                });
            });

            it("adds a further date filter on the same dataset, told apart by its local identifier", async () => {
                const withSecond = await dispatchAction(
                    withPrimary,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withPrimary, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: closedDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
                const [primary, second] = dateFilterOf(withSecond);
                expect(second.localIdentifier).toBeDefined();
                expect(second.localIdentifier).not.toEqual(primary.localIdentifier);

                const reducedState = await dispatchAction(
                    withSecond,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withSecond, MEASURES, 0), {
                        dateFilter: { ...second },
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: closedDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );

                expect(dateFilterOf(reducedState)).toMatchObject([
                    { dimension: closedDateDataset.identifier, interval: storedYear(0, 0, "THIS_YEAR") },
                    { dimension: closedDateDataset.identifier, interval: storedYear(0, 0, "THIS_YEAR") },
                ]);
                expect(dateFilterOf(reducedState)[0]).toBe(primary);
            });

            it("edits the further date filter by its record without touching the primary one", async () => {
                const withSecond = await dispatchAction(
                    withPrimary,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withPrimary, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
                const second = dateFilterOf(withSecond)[1];

                const reducedState = await dispatchAction(
                    withSecond,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withSecond, MEASURES, 0), {
                        dateFilter: { ...second },
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );

                expect(dateFilterOf(reducedState)).toMatchObject([
                    { dimension: closedDateDataset.identifier, interval: storedYear(0, 0, "THIS_YEAR") },
                    { dimension: activityDateDataset.identifier, interval: storedYear(0, 0, "THIS_YEAR") },
                ]);
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(closedDateDataset.uri);
            });

            it("moves the selection to the next date filter when the primary one is removed", async () => {
                const withSecond = await dispatchAction(
                    withPrimary,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withPrimary, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
                const bucketItem = bucketsGetItem(withSecond, MEASURES, 0);

                const reducedState = await dispatchAction(
                    withSecond,
                    setBucketItemRemoveMetricFilter(bucketItem, dateFilterOf(withSecond)[0], true),
                );

                expect(dateFilterOf(reducedState)).toMatchObject([
                    { dimension: activityDateDataset.identifier },
                ]);
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(activityDateDataset.uri);
            });

            it("moves the selection to the next one of several date filters on the same dataset", async () => {
                const add = (state: IAppState) =>
                    dispatchAction(
                        state,
                        setBucketItemApplyMetricDateFilter(bucketsGetItem(state, MEASURES, 0), {
                            dateFilter: undefined,
                            dateFilterOption: thisYear,
                            dateDatasetIdentifier: closedDateDataset.identifier,
                            additionalDateFilters: [],
                        }),
                    );
                const withThree = await add(await add(withPrimary));
                expect(dateFilterOf(withThree)).toHaveLength(3);
                const bucketItem = bucketsGetItem(withThree, MEASURES, 0);

                const reducedState = await dispatchAction(
                    withThree,
                    setBucketItemRemoveMetricFilter(bucketItem, dateFilterOf(withThree)[0], true),
                );

                expect(dateFilterOf(reducedState)).toHaveLength(2);
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(closedDateDataset.uri);
            });

            it("hands the selection over through the date datasets meta when the measure's datasets are not loaded", async () => {
                // a reopened insight: date filters without local identifiers, datasets never requested
                // (a dataset the meta knows; the measure's own availability stays empty)
                const metaDateDatasetIdentifier = dateDatasetsMetaItems[0].identifier;
                const reopened = {
                    attribute: DATE_DATASET_ATTRIBUTE,
                    interval: { name: ALL_TIME },
                    dimension: metaDateDatasetIdentifier,
                };
                const notLoaded = bucketsAddMeasuresItem(
                    seedDateDatasetsMeta(addBucket(getInitializedState(), MEASURES), {
                        items: dateDatasetsMetaItems,
                    }),
                    { ...item, filters: [{ ...reopened }, { ...reopened }] },
                );
                const bucketItem = bucketsGetItem(notLoaded, MEASURES, 0);

                const reducedState = await dispatchAction(
                    notLoaded,
                    setBucketItemRemoveMetricFilter(bucketItem, bucketItem.filters[0], true),
                );

                expect(dateFilterOf(reducedState)).toHaveLength(1);
                const expectedUri = getDateDatasetUriByIdentifier(reducedState, metaDateDatasetIdentifier);
                expect(expectedUri).toBeDefined();
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(expectedUri);
            });

            it("keeps the selection when a further date filter is removed", async () => {
                const withSecond = await dispatchAction(
                    withPrimary,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withPrimary, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: lastYear,
                        dateDatasetIdentifier: activityDateDataset.identifier,
                        additionalDateFilters: [],
                    }),
                );
                const bucketItem = bucketsGetItem(withSecond, MEASURES, 0);

                const reducedState = await dispatchAction(
                    withSecond,
                    setBucketItemRemoveMetricFilter(bucketItem, dateFilterOf(withSecond)[1]),
                );

                expect(dateFilterOf(reducedState)).toMatchObject([
                    { dimension: closedDateDataset.identifier },
                ]);
                expect(
                    getMeasureDateDatasetStatus(reducedState, item.localIdentifier).selectedDateDatasetUri,
                ).toEqual(closedDateDataset.uri);
            });
        });

        describe("removing the date filter", () => {
            let withDateFilter: IAppState;

            beforeEach(async () => {
                const withRegularFilter = await dispatchAction(
                    stateWithMeasure,
                    setBucketItemAddMetricFilter(item, measureFilter, DATE_DATASET_ID),
                );
                withDateFilter = await dispatchAction(
                    withRegularFilter,
                    setBucketItemApplyMetricDateFilter(bucketsGetItem(withRegularFilter, MEASURES, 0), {
                        dateFilter: undefined,
                        dateFilterOption: thisYear,
                        dateDatasetIdentifier: DATE_DATASET_ID,
                        additionalDateFilters: [monthOfYear],
                    }),
                );
            });

            it("takes the additional date filters with it as one undo step when asked to", async () => {
                const bucketItem = bucketsGetItem(withDateFilter, MEASURES, 0);
                const dateFilter = bucketItem.filters.find(
                    (filter: IBucketItemMetricFilter) => filter.attribute === DATE_DATASET_ATTRIBUTE,
                );

                const reducedState = await dispatchAction(
                    withDateFilter,
                    setBucketItemRemoveMetricFilter(bucketItem, dateFilter, true),
                );

                const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
                expect(filters.map((filter: IBucketItemMetricFilter) => filter.attribute)).toEqual([
                    ATTRIBUTE_ID,
                ]);
                expect(reducedState.data.filterBar.attributeFilterConfigs["moy"]).toBeUndefined();
                expect(new Set(snapshotActionTypes(withDateFilter, reducedState))).toEqual(
                    new Set([ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER]),
                );
            });

            it("keeps the additional date filters by default", async () => {
                const bucketItem = bucketsGetItem(withDateFilter, MEASURES, 0);
                const dateFilter = bucketItem.filters.find(
                    (filter: IBucketItemMetricFilter) => filter.attribute === DATE_DATASET_ATTRIBUTE,
                );

                const reducedState = await dispatchAction(
                    withDateFilter,
                    setBucketItemRemoveMetricFilter(bucketItem, dateFilter),
                );

                const filters = bucketsGetItem(reducedState, MEASURES, 0).filters;
                expect(filters.map((filter: IBucketItemMetricFilter) => filter.attribute)).toEqual([
                    ATTRIBUTE_ID,
                    "activity.month.in.year",
                ]);
                expect(reducedState.data.filterBar.attributeFilterConfigs["moy"]).toEqual({
                    displayAsLabel: monthOfYearDfRef,
                });
            });
        });
    });

    describe("setBucketItemUpdateMetricFilterDisplayForm", () => {
        const action = setBucketItemUpdateMetricFilterDisplayForm({
            itemLocalIdentifier: "m1",
            filterLocalIdentifier: "country_local_id",
            filterAttribute: "country_local_id",
            displayAsDfRef: uriRef("/updatedDisplayFormUri"),
            primaryDfRef: uriRef("/updatedDisplayFormUri"),
            selectedElements: [],
        });

        const bucketItem = buildBucketItem({
            attribute: "a1",
            localIdentifier: "m1",
            filters: [
                {
                    localIdentifier: "country_local_id",
                    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                    selectedElements: [{ title: "title1", uri: "uri1" }],
                    isInverted: false,
                    totalElementsCount: 123,
                },
            ],
        });

        it("should update bucket item measure filter display form, selected elements and inverted prop in state", async () => {
            const state = bucketsAddMeasuresItem(addBucket(getInitializedState(), MEASURES), bucketItem);

            const reducedState = await dispatchAction(state, action);
            const updatedFilter = bucketsGetItem(reducedState, MEASURES, 0).filters[0];

            expect(updatedFilter.displayFormRef).toEqual(action.payload.displayAsDfRef);
            expect(updatedFilter.selectedElements).toEqual([]);
            expect(updatedFilter.isInverted).toEqual(true);
            expect(updatedFilter.totalElementsCount).toEqual(123);
        });

        it("should set buckets in reference point", async () => {
            const state = bucketsAddMeasuresItem(addBucket(getInitializedState(), MEASURES), bucketItem);

            const reducedState = await dispatchAction(state, action);
            const referencePointBuckets = reducedState.data.referencePoint.buckets;
            const buckets = reducedState.data.buckets;

            expect(referencePointBuckets).toEqual(buckets);
        });
    });

    describe("updateDerivedMeasures", () => {
        function getDefaultStateWithDerivedMeasure() {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1_pop",
                            masterLocalIdentifier: "m1",
                        },
                        {
                            localIdentifier: "m1",
                        },
                        {
                            localIdentifier: "m2",
                        },
                    ],
                },
            ];

            return withData(getInitializedState(), { buckets: buckets });
        }

        function getDefaultStateWithArithmeticMeasureMadeFromDerived() {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "am1",
                            operandLocalIdentifiers: ["m1_pop", "m2"],
                            type: METRIC,
                        },
                        {
                            localIdentifier: "m1_pop",
                            masterLocalIdentifier: "m1",
                            type: METRIC,
                        },
                        {
                            localIdentifier: "m1",
                            type: METRIC,
                        },
                        {
                            localIdentifier: "m2",
                            type: METRIC,
                        },
                    ],
                },
            ];

            return withData(getInitializedState(), { buckets: buckets });
        }

        it("should remove all derived bucket items if compare is disabled", () => {
            const state = getDefaultStateWithDerivedMeasure();

            // VALUE-LEVEL: the whole-root `updateDerivedMeasures` died with the
            // wrapper; this is the same composition the date-filter / metric-filter operations run,
            // over the same input and deps the production saga reads.
            const result = updateDerivedMeasuresOverTime(
                readBucketFiltersDerivedChainInput(state),
                [],
                OverTimeComparisonTypes.NOTHING,
                buildBucketFiltersDerivedChainDeps(state),
            );

            expect(getBucketItemsInBuckets(result.buckets)).toEqual([
                { localIdentifier: "m1" },
                { localIdentifier: "m2" },
            ]);
        });

        it("should remove all dependant buckets items and set removed items", () => {
            const state = getDefaultStateWithArithmeticMeasureMadeFromDerived();

            const result = updateDerivedMeasuresOverTime(
                readBucketFiltersDerivedChainInput(state),
                [],
                OverTimeComparisonTypes.NOTHING,
                buildBucketFiltersDerivedChainDeps(state),
            );

            expect(getBucketItemsInBuckets(result.buckets)).toEqual([
                { localIdentifier: "m1", type: METRIC },
                { localIdentifier: "m2", type: METRIC },
            ]);
            expect(result.bucketNotifications.removedItems).toStrictEqual({
                measures: 2,
                measureValueFilters: 0,
                rankingFilter: false,
            });
        });
    });

    describe("update measure value filter", () => {
        it("should update measure value filter", async () => {
            const state = FilterBarService.addFilter(getInitializedState(), comparisonMeasureValueFilter);
            const action: IUpdateMeasureValueFilterAction = updateMeasureValueFilter({
                ...rangeMeasureValueFilter,
                localIdentifier: comparisonMeasureValueFilter.localIdentifier,
            });
            const reducedState = await dispatchAction(state, action);
            const updatedMeasureValueFilter = getMeasureValueFilter(
                reducedState,
                comparisonMeasureValueFilter.localIdentifier,
            );
            expect(updatedMeasureValueFilter).toMatchSnapshot();
        });
    });

    describe("update ranking filter", () => {
        it("should update ranking filter", async () => {
            const state = FilterBarService.addFilter(getInitializedState(), rankingFilterWithAttributes);
            const action: IUpdateRankingFilterAction = updateRankingFilter({
                ...rankingFilterWithAttributes,
                operator: "TOP",
                value: 5,
            });
            const reducedState = await dispatchAction(state, action);
            const updatedRankingFilter = getRankingFilter(reducedState);
            expect(updatedRankingFilter).toMatchSnapshot();
        });
    });

    describe("mapAttributeFilterToExternalAttributeFilter", () => {
        it("should return negative attribute filter", () => {
            const attributeFilter = {
                isInverted: true,
                selectedElements: [
                    {
                        uri: "/uri1",
                        title: "title1",
                    },
                ],
                filterLocalIdentifier: "123",
                dfUri: "dfUri1",
            };
            const negativeAttribute = mapAttributeFilterToExternalAttributeFilter(attributeFilter);

            expect(negativeAttribute).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        uri: "dfUri1",
                    },
                    notIn: ["/uri1"],
                },
            });
        });

        it("should return positive attribute filter", () => {
            const attributeFilter = {
                isInverted: false,
                selectedElements: [
                    {
                        uri: "/uri1",
                        title: "title1",
                    },
                ],
                filterLocalIdentifier: "123",
                dfUri: "dfUri1",
            };
            const positiveAttribute = mapAttributeFilterToExternalAttributeFilter(attributeFilter);

            expect(positiveAttribute).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        uri: "dfUri1",
                    },
                    in: ["/uri1"],
                },
            });
        });
    });

    describe("mapDateFilterIdToExternalDateFilter", () => {
        it("should return all time date filter", () => {
            const filter: Parameters<typeof mapDateFilterIdToExternalDateFilter>[0] = {
                localIdentifier: undefined,
                filterConfig: {
                    name: "all_time",
                    granularity: undefined,
                    interval: undefined,
                },
                dateDatasetRef: {
                    uri: "/obj/708",
                },
            };
            const dateAbsolute = mapDateFilterIdToExternalDateFilter(filter);

            expect(dateAbsolute).toEqual({
                relativeDateFilter: {
                    dataSet: {
                        uri: "/obj/708",
                    },
                    granularity: "ALL_TIME_GRANULARITY",
                    from: 0,
                    to: 0,
                },
            });
        });

        it("should return absolute date filter", () => {
            const interval: [string, string] = ["2010-10-10", "2011-10-10"];
            const filter: IUpdateDateFilterActionPayload = {
                localIdentifier: "id",
                filterConfig: {
                    type: "absolute",
                    interval,
                    granularity: "GDC.time.date",
                },
                dateDatasetRef: {
                    uri: "/obj/708",
                },
            };
            const dateAbsolute = mapDateFilterIdToExternalDateFilter(filter);

            expect(dateAbsolute).toEqual({
                absoluteDateFilter: {
                    dataSet: {
                        uri: "/obj/708",
                    },
                    from: "2010-10-10",
                    to: "2011-10-10",
                },
                localIdentifier: "id",
            });
        });

        it("should return relative date filter", () => {
            const interval: [number, number] = [-1, -1];
            const filter: IUpdateDateFilterActionPayload = {
                localIdentifier: "id",
                filterConfig: {
                    type: "relative",
                    interval,
                    granularity: "GDC.time.month",
                },
                dateDatasetRef: {
                    uri: "/obj/708",
                },
            };
            const dateRelative = mapDateFilterIdToExternalDateFilter(filter);

            expect(dateRelative).toEqual({
                relativeDateFilter: {
                    dataSet: {
                        uri: "/obj/708",
                    },
                    granularity: "GDC.time.month",
                    from: -1,
                    to: -1,
                },
                localIdentifier: "id",
            });
        });
    });
});
