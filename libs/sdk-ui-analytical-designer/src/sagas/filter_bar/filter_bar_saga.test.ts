// (C) 2019-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import {
    findBucketItemByLocalIdentifier,
    getAttributeBucketItemsByRef,
} from "../../services/buckets_service.js";
import { replaceBucketItemAt, requireBucketItemAddress } from "../../store/buckets/bucket_item_address.js";
import { watchBucketsOperations } from "../../store/buckets/buckets_operations_saga.js";
import {
    FilterBarActionTypeKeys,
    addFiltersToState,
    filtersWereChanged,
    removeFiltersFromState,
    storeFilterBarAutoOpen,
} from "../../store/filter_bar/filter_bar_actions.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import { FilterBar, type IFilter } from "../../store/filter_bar/filter_bar_types.js";
import { removeParameterFiltersFromState } from "../../store/filter_bar/parameter_filter_actions.js";
import { type IParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { withReplacedBucket } from "../../tests/buckets_builder.test.helpers.js";
import {
    categoriesBucketItems,
    dateCreated,
    defaultBuckets,
    enrichCategoriesBucketItems,
    itemCache,
    measureBucketItems,
} from "../../tests/constants.test.helpers.js";
import {
    DATE_FILTER_DATASET_REF,
    buildAttributeFilterMock,
    filterItems,
} from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type ICacheItem, type ICatalogEntry } from "../../typings/state_objects.js";
import { watchBuckets } from "../bucket_saga.js";

import {
    syncAttributeFilterDisplayFormWithMatchingBucketItem,
    syncCatalogItemDisplayFormWithMatchingBucketItem,
    watchFilterBar,
} from "./filter_bar_saga.js";
import {
    addFilter,
    addRankingFilterFromMetric,
    removeFilter,
    updateFilters,
} from "./filter_bar_ui_actions.js";
import { runSaga } from "./run_saga.test.utils.js";
import { type IItemsState } from "./types.js";

const dateCatalogItem = {
    type: "date" as const,
    ref: { identifier: "date.ref" },
    title: "Date",
    identifier: "date.identifier",
    uri: "/date/uri",
};

const dateFilterItem: IFilter = {
    type: "date",
    localIdentifier: "id",
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    overTimeComparisonType: "nothing",
    dateDatasetRef: DATE_FILTER_DATASET_REF,
};

const dateDatasetItems = [
    {
        attributes: [
            { dfRef: { uri: "/activity.days.in.week" } },
            { dfRef: { uri: "/activity.days.in.month" } },
            { dfRef: { uri: "/activity.days.in.year" } },
        ],
    },
];

const additionalDateAttribute: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.activity.day.in.week",
    localIdentifier: "activity.dayInWeek",
    displayFormRef: { uri: "/activity.days.in.week" },
});

const expectedDateFilterItem: IFilter = {
    type: "date",
    localIdentifier: expect.stringMatching(/[a-z0-9]+/),
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    overTimeComparisonType: "nothing",
    dateDatasetRef: DATE_FILTER_DATASET_REF,
};

const expectedAttributeFilterItem: IFilter = {
    type: "attribute",
    localIdentifier: expect.stringMatching(/[a-z0-9]+/),
    cacheItemIdentifier: "attr.country.id",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
    filterConfig: {
        isInverted: true,
        selectedElements: [],
        totalElementsCount: 0,
    },
};

const expectedMeasureValueFilterItem: IFilter = {
    type: "measure",
    localIdentifier: expect.stringMatching(/[a-z0-9]+/),
    measureLocalIdentifier: "m1",
    dimensionality: ["product", "week", "country"],
};

const expectedRankingFilterItem: IFilter = {
    type: "ranking",
    localIdentifier: expect.stringMatching(/[a-z0-9]+/),
    measureLocalIdentifier: "m1",
    operator: "TOP",
    value: 10,
    // With the improved ranking filter on by default, a new ranking filter seeds its "out of" attributes
    // from the current bucket items, mirroring the measure value filter dimensionality above.
    attributes: ["product", "week", "country"],
};

describe("watchFilterBar", () => {
    describe("Adding and removing", () => {
        describe("addFilter", () => {
            it("should add filter to state and call filters were changed", async () => {
                const { effects } = await expectSaga(watchFilterBar)
                    .withState(
                        withData(getInitializedState(), {
                            dateDatasets: {
                                ...getInitializedState().data.dateDatasets,
                                available: [dateCreated],
                            },
                        }),
                    )
                    .dispatch(addFilter(dateCatalogItem))
                    .silentRun(0);

                expect(effects.put).toEqual([
                    put(addFiltersToState([expectedDateFilterItem], false)),
                    put(filtersWereChanged([expectedDateFilterItem], [])),
                ]);
                expect(effects.call).toContainEqual(
                    call(syncCatalogItemDisplayFormWithMatchingBucketItem, dateCatalogItem),
                );
            });

            describe("auto-open of the added filter", () => {
                const stateWithDateDataset = (improvedMetricDateFilter: boolean) =>
                    withRoot(
                        withData(getInitializedState(), {
                            dateDatasets: {
                                ...getInitializedState().data.dateDatasets,
                                available: [dateCreated],
                            },
                        }),
                        { featureFlags: { enableImprovedMetricDateFilter: improvedMetricDateFilter } },
                    );

                it("should hand the filter added by a single gesture over for auto-open", async () => {
                    const { storeState } = await expectSaga(watchFilterBar)
                        .withReducer(rootReducer, stateWithDateDataset(true))
                        .dispatch(addFilter(dateCatalogItem, undefined, true))
                        .put.actionType(FilterBarActionTypeKeys.STORE_FILTER_BAR_AUTO_OPEN)
                        .silentRun(0);

                    const [addedFilter] = storeState.data.filterBar.items;
                    expect(storeState.filterBarAutoOpen).toEqual(addedFilter.localIdentifier);
                });

                it("should not hand a filter over when the gesture added several", async () => {
                    await expectSaga(watchFilterBar)
                        .withState(stateWithDateDataset(true))
                        .dispatch(addFilter(dateCatalogItem, undefined, false))
                        .not.put.actionType(FilterBarActionTypeKeys.STORE_FILTER_BAR_AUTO_OPEN)
                        .silentRun(0);
                });

                it("should not hand a filter over when the add was not a user gesture", async () => {
                    await expectSaga(watchFilterBar)
                        .withState(stateWithDateDataset(true))
                        .dispatch(addFilter(dateCatalogItem))
                        .not.put.actionType(FilterBarActionTypeKeys.STORE_FILTER_BAR_AUTO_OPEN)
                        .silentRun(0);
                });

                it("should not hand a filter over when the improved metric date filter flag is off", async () => {
                    await expectSaga(watchFilterBar)
                        .withState(stateWithDateDataset(false))
                        .dispatch(addFilter(dateCatalogItem, undefined, true))
                        .not.put.actionType(FilterBarActionTypeKeys.STORE_FILTER_BAR_AUTO_OPEN)
                        .silentRun(0);
                });
            });
        });

        describe("removeFilter", () => {
            it("should remove filter from state and call filters were changed", async () => {
                const stateWithDateFilter = FilterBarService.addFilter(getInitializedState(), dateFilterItem);

                await expectSaga(watchFilterBar)
                    .withState(stateWithDateFilter)
                    .dispatch(removeFilter("id", "date"))
                    .put(removeFiltersFromState(["id"], false))
                    .put(filtersWereChanged([], [dateFilterItem]))
                    .silentRun(0);
            });

            it("should remove date filter and additional date filter from state and call filters were changed", async () => {
                const stateWithDateFilter = FilterBarService.addFilter(getInitializedState(), dateFilterItem);
                const stateWithAdditionalDateAttribute = withData(
                    FilterBarService.addFilter(stateWithDateFilter, additionalDateAttribute),
                    {
                        dateDatasetsMeta: {
                            ...FilterBarService.addFilter(stateWithDateFilter, additionalDateAttribute).data
                                .dateDatasetsMeta,
                            items: dateDatasetItems as unknown as IDateDatasetsMetaItem[],
                        },
                    },
                );

                await expectSaga(watchFilterBar)
                    .withState(stateWithAdditionalDateAttribute)
                    .dispatch(removeFilter("id", "date"))
                    .put(removeFiltersFromState(["activity.dayInWeek", "id"], false))
                    .put(filtersWereChanged([], [additionalDateAttribute, dateFilterItem]))
                    .silentRun(0);
            });

            it("should dispatch removeParameterFiltersFromState when a parameter filter is removed", async () => {
                const parameterFilter: IParameterFilter = {
                    type: "parameter",
                    localIdentifier: "param-1",
                    parameterRef: idRef("threshold", "parameter"),
                    name: "Threshold",
                    value: 42,
                    definition: { type: "NUMBER", defaultValue: 10 },
                };
                const pristine = getInitializedState();
                const stateWithParameter = withData(pristine, {
                    filterBar: { ...pristine.data.filterBar, parameterItems: [parameterFilter] },
                });

                await expectSaga(watchFilterBar)
                    .withState(stateWithParameter)
                    .dispatch(removeFilter("param-1", "parameter"))
                    .put(removeParameterFiltersFromState(["param-1"]))
                    .not.put.actionType("STORE/REMOVE_FILTERS_FROM_STATE")
                    .silentRun(0);
            });

            it("should be a no-op when the parameter filter does not exist", async () => {
                await expectSaga(watchFilterBar)
                    .withState(getInitializedState())
                    .dispatch(removeFilter("missing", "parameter"))
                    .not.put.actionType("STORE/REMOVE_PARAMETER_FILTERS")
                    .silentRun(0);
            });
        });
    });

    describe("updateFilters", () => {
        const stateWithFilters = withData(
            withData(
                withData(
                    withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                        itemCache: itemCache,
                    }),
                    { buckets: defaultBuckets },
                ),
                {
                    buckets: withReplacedBucket(
                        withData(
                            withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                                itemCache: itemCache,
                            }),
                            { buckets: defaultBuckets },
                        ).data.buckets,
                        0,
                        { items: measureBucketItems },
                    ),
                },
            ),
            {
                buckets: withReplacedBucket(
                    withData(
                        withData(
                            withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                                itemCache: itemCache,
                            }),
                            { buckets: defaultBuckets },
                        ),
                        {
                            buckets: withReplacedBucket(
                                withData(
                                    withData(
                                        FilterBarService.addFilter(getInitializedState(), filterItems[0]),
                                        { itemCache: itemCache },
                                    ),
                                    { buckets: defaultBuckets },
                                ).data.buckets,
                                0,
                                { items: measureBucketItems },
                            ),
                        },
                    ).data.buckets,
                    1,
                    { items: enrichCategoriesBucketItems },
                ),
            },
        );

        it("should put 'addFilters' action with only filters identifiers which are not already present", async () => {
            const filterState: IItemsState = {
                "attr.product.id": {
                    enabled: true,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
                "attr.datedataset": {
                    enabled: true,
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["week"],
                },
                "attr.country.id": {
                    enabled: true,
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["country"],
                },
                "some-id-of-measure-item": {
                    enabled: true,
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["m1"],
                },
            };

            const { effects } = await expectSaga(watchFilterBar)
                .withState(stateWithFilters)
                .dispatch(updateFilters(filterState, false))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(
                    addFiltersToState(
                        [expectedDateFilterItem, expectedAttributeFilterItem, expectedMeasureValueFilterItem],
                        true,
                    ),
                ),
                put(
                    filtersWereChanged(
                        [expectedDateFilterItem, expectedAttributeFilterItem, expectedMeasureValueFilterItem],
                        [],
                    ),
                ),
            ]);
            [expectedDateFilterItem, expectedAttributeFilterItem, expectedMeasureValueFilterItem].forEach(
                (item) =>
                    expect(effects.call).toContainEqual(
                        call(syncAttributeFilterDisplayFormWithMatchingBucketItem, item),
                    ),
            );
        });

        it("should put 'removeFilters' action with only filters identifiers which are present", async () => {
            const stateWithDateFilter = FilterBarService.addFilter(stateWithFilters, dateFilterItem);

            const filterState: IItemsState = {
                "attr.product.id": {
                    enabled: true,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
                "attr.datedataset": {
                    enabled: false,
                    filterLocalIdentifier: "id",
                    bucketItemLocalIdentifiers: ["week"],
                },
            };

            const { effects } = await expectSaga(watchFilterBar)
                .withState(stateWithDateFilter)
                .dispatch(updateFilters(filterState, false))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(removeFiltersFromState([expectedDateFilterItem.localIdentifier], true)),
                put(filtersWereChanged([], [expectedDateFilterItem])),
            ]);
        });

        it("should put 'removeFilters' action with only date filter and additional date attribute identifiers", async () => {
            const stateWithDateFilter = FilterBarService.addFilter(getInitializedState(), dateFilterItem);
            const stateWithAdditionalDateAttribute = withData(
                FilterBarService.addFilter(stateWithDateFilter, additionalDateAttribute),
                {
                    dateDatasetsMeta: {
                        ...FilterBarService.addFilter(stateWithDateFilter, additionalDateAttribute).data
                            .dateDatasetsMeta,
                        items: dateDatasetItems as unknown as IDateDatasetsMetaItem[],
                    },
                },
            );

            const filterState: IItemsState = {
                "attr.datedataset": {
                    enabled: false,
                    filterLocalIdentifier: "id",
                    bucketItemLocalIdentifiers: ["week"],
                },
            };

            const { effects } = await expectSaga(watchFilterBar)
                .withState(stateWithAdditionalDateAttribute)
                .dispatch(updateFilters(filterState, false))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(removeFiltersFromState(["activity.dayInWeek", "id"], true)),
                put(filtersWereChanged([], [additionalDateAttribute, dateFilterItem])),
            ]);
        });

        it("should not put action when there are no filters to be added or removed", async () => {
            const filterState = {
                "attr.product.id": {
                    enabled: true,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
            };

            const { effects } = await expectSaga(watchFilterBar)
                .withState(stateWithFilters)
                .dispatch(updateFilters(filterState, false))
                .silentRun(0);

            expect(effects.put).toBeUndefined();
        });

        describe("ranking filter", () => {
            const filterStateWithRemovedAttributeFilter: IItemsState = {
                "attr.product.id": {
                    enabled: false,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
            };
            const filterStateWithAddedDateFilter: IItemsState = {
                "attr.product.id": {
                    enabled: true,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
                "attr.datedataset": {
                    enabled: true,
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["week"],
                },
            };

            it("should add ranking filter when it is enabled but does not exist", async () => {
                const { effects } = await expectSaga(watchFilterBar)
                    .withState(stateWithFilters)
                    .dispatch(updateFilters(filterStateWithAddedDateFilter, true))
                    .silentRun(0);
                expect(effects.put).toEqual([
                    put(addFiltersToState([expectedDateFilterItem, expectedRankingFilterItem], true)),
                    put(storeFilterBarAutoOpen(expect.stringMatching(/[a-z0-9]+/))),
                    put(filtersWereChanged([expectedDateFilterItem, expectedRankingFilterItem], [])),
                ]);
            });

            it("should hand the added ranking filter over for auto-open regardless of the flag", async () => {
                const { storeState } = await expectSaga(watchFilterBar)
                    .withReducer(
                        rootReducer,
                        withRoot(stateWithFilters, {
                            featureFlags: { enableImprovedMetricDateFilter: false },
                        }),
                    )
                    .dispatch(updateFilters(filterStateWithAddedDateFilter, true))
                    .silentRun(0);

                const rankingFilter = storeState.data.filterBar.items.find(FilterBar.isRankingFilter);
                expect(rankingFilter).toBeDefined();
                expect(storeState.filterBarAutoOpen).toEqual(rankingFilter.localIdentifier);
            });

            it("should not add ranking filter when it is enabled but already exists", async () => {
                const stateWithRankingFilter = FilterBarService.addFilter(
                    stateWithFilters,
                    expectedRankingFilterItem,
                );
                const { effects } = await expectSaga(watchFilterBar)
                    .withState(stateWithRankingFilter)
                    .dispatch(updateFilters(filterStateWithAddedDateFilter, true))
                    .silentRun(0);
                expect(effects.put).toEqual([
                    put(addFiltersToState([expectedDateFilterItem], true)),
                    put(filtersWereChanged([expectedDateFilterItem], [])),
                ]);
            });

            it("should remove ranking filter when it is not enabled and already exists", async () => {
                const stateWithRankingFilter = FilterBarService.addFilter(
                    stateWithFilters,
                    expectedRankingFilterItem,
                );
                const { effects } = await expectSaga(watchFilterBar)
                    .withState(stateWithRankingFilter)
                    .dispatch(updateFilters(filterStateWithRemovedAttributeFilter, false))
                    .silentRun(0);
                expect(effects.put).toEqual([
                    put(
                        removeFiltersFromState(
                            [filterItems[0].localIdentifier, expectedRankingFilterItem.localIdentifier],
                            true,
                        ),
                    ),
                    put(filtersWereChanged([], [filterItems[0], expectedRankingFilterItem])),
                ]);
            });

            it("should not remove ranking filter when it is not enabled but it does not exist", async () => {
                const { effects } = await expectSaga(watchFilterBar)
                    .withState(stateWithFilters)
                    .dispatch(updateFilters(filterStateWithRemovedAttributeFilter, false))
                    .silentRun(0);
                expect(effects.put).toEqual([
                    put(removeFiltersFromState([filterItems[0].localIdentifier], true)),
                    put(filtersWereChanged([], [filterItems[0]])),
                ]);
            });
        });

        describe("show percent with derived measure filters", () => {
            let state = withData(
                withData(
                    withData(withData(getInitializedState(), { itemCache: itemCache }), {
                        buckets: defaultBuckets,
                    }),
                    {
                        buckets: withReplacedBucket(
                            withData(withData(getInitializedState(), { itemCache: itemCache }), {
                                buckets: defaultBuckets,
                            }).data.buckets,
                            0,
                            { items: measureBucketItems },
                        ),
                    },
                ),
                {
                    buckets: withReplacedBucket(
                        withData(
                            withData(withData(getInitializedState(), { itemCache: itemCache }), {
                                buckets: defaultBuckets,
                            }),
                            {
                                buckets: withReplacedBucket(
                                    withData(withData(getInitializedState(), { itemCache: itemCache }), {
                                        buckets: defaultBuckets,
                                    }).data.buckets,
                                    0,
                                    { items: measureBucketItems },
                                ),
                            },
                        ).data.buckets,
                        1,
                        { items: enrichCategoriesBucketItems },
                    ),
                },
            );

            for (const localIdentifier of ["m1", "m3"]) {
                const measure = findBucketItemByLocalIdentifier(state, localIdentifier);
                state = withData(state, {
                    buckets: replaceBucketItemAt(
                        state.data.buckets,
                        requireBucketItemAddress(state.data.buckets, measure),
                        { ...measure, showInPercent: true },
                    ),
                });
            }

            // watchBucketsOperations joined the list: `watchBuckets` puts the STORE_ trigger
            // and the buckets OPERATION SAGA writes it, so a spec that
            // asserts the buckets write has to run it.
            const sagas = [watchFilterBar, watchBuckets, watchBucketsOperations];

            it("should remove show percent only from measure with derived measure with filter", async () => {
                const action = updateFilters(
                    {
                        id: {
                            enabled: true,
                            filterLocalIdentifier: null,
                            bucketItemLocalIdentifiers: ["m3_pop"],
                        },
                    },
                    false,
                );

                const resultState = await runSaga(sagas, action, state);

                expect(findBucketItemByLocalIdentifier(resultState, "m1").showInPercent).toEqual(true);
                expect(findBucketItemByLocalIdentifier(resultState, "m3").showInPercent).toEqual(false);
            });

            it("should not remove show percent from measure if measure is filtered", async () => {
                const action = updateFilters(
                    {
                        id: {
                            enabled: true,
                            filterLocalIdentifier: null,
                            bucketItemLocalIdentifiers: ["m3"],
                        },
                    },
                    false,
                );

                const resultState = await runSaga(sagas, action, state);

                expect(findBucketItemByLocalIdentifier(resultState, "m3").showInPercent).toEqual(true);
            });
        });
    });

    describe("addRankingFilterFromMetric", () => {
        it("should hand the added ranking filter over for auto-open regardless of the flag", async () => {
            const { storeState } = await expectSaga(watchFilterBar)
                .withReducer(
                    rootReducer,
                    withRoot(getInitializedState(), {
                        featureFlags: { enableImprovedMetricDateFilter: false },
                    }),
                )
                .dispatch(
                    addRankingFilterFromMetric({
                        type: "metric",
                        identifier: "metric.amount",
                        ref: idRef("metric.amount"),
                        title: "Amount",
                    } as ICacheItem),
                )
                .silentRun(0);

            const rankingFilter = storeState.data.filterBar.items.find(FilterBar.isRankingFilter);
            expect(rankingFilter).toBeDefined();
            expect(storeState.filterBarAutoOpen).toEqual(rankingFilter.localIdentifier);
        });
    });

    describe("measure filter dimensionality", () => {
        const expectedMeasureFilterWithDimensionality: IFilter = {
            type: "measure",
            localIdentifier: expect.stringMatching(/[a-z0-9]+/),
            measureLocalIdentifier: "m1",
            dimensionality: ["product", "week"],
        };

        it("should add measure filter with dimensionality", async () => {
            const stateWithImprovedFilters = withData(
                withData(
                    withData(
                        withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                            itemCache: itemCache,
                        }),
                        { buckets: defaultBuckets },
                    ),
                    {
                        buckets: withReplacedBucket(
                            withData(
                                withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                                    itemCache: itemCache,
                                }),
                                { buckets: defaultBuckets },
                            ).data.buckets,
                            0,
                            { items: measureBucketItems },
                        ),
                    },
                ),
                {
                    buckets: withReplacedBucket(
                        withData(
                            withData(
                                withData(FilterBarService.addFilter(getInitializedState(), filterItems[0]), {
                                    itemCache: itemCache,
                                }),
                                { buckets: defaultBuckets },
                            ),
                            {
                                buckets: withReplacedBucket(
                                    withData(
                                        withData(
                                            FilterBarService.addFilter(getInitializedState(), filterItems[0]),
                                            { itemCache: itemCache },
                                        ),
                                        { buckets: defaultBuckets },
                                    ).data.buckets,
                                    0,
                                    { items: measureBucketItems },
                                ),
                            },
                        ).data.buckets,
                        1,
                        { items: categoriesBucketItems },
                    ),
                },
            );

            const filterState: IItemsState = {
                "attr.product.id": {
                    enabled: true,
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: ["product"],
                },
                "some-id-of-measure-item": {
                    enabled: true,
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["m1"],
                },
            };

            const { effects } = await expectSaga(watchFilterBar)
                .withState(stateWithImprovedFilters)
                .dispatch(updateFilters(filterState, false))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(addFiltersToState([expectedMeasureFilterWithDimensionality], true)),
                put(filtersWereChanged([expectedMeasureFilterWithDimensionality], [])),
            ]);
        });
    });

    describe("syncCatalogItemDisplayFormWithMatchingBucketItem", () => {
        const ref = uriRef("/uri0");
        const displayFormRef = uriRef("/uri2");
        const defaultDisplayFormRef = uriRef("/uri1");

        it("should return unchanged catalog item when item is not of type attribute", async () => {
            const catalogItem: ICatalogEntry = { type: "measure" as const };

            const { returnValue: updatedCatalogItem } = await expectSaga(
                syncCatalogItemDisplayFormWithMatchingBucketItem,
                catalogItem,
            ).silentRun();

            expect(updatedCatalogItem).toEqual(catalogItem);
        });

        it("should return unchanged catalog item when there is no matching bucket attribute", async () => {
            const catalogItem: ICatalogEntry = {
                type: "attribute" as const,
                ref,
                dfRef: defaultDisplayFormRef,
            };

            const { returnValue: updatedCatalogItem } = await expectSaga(
                syncCatalogItemDisplayFormWithMatchingBucketItem,
                catalogItem,
            )
                .provide([[select(getAttributeBucketItemsByRef, ref), []]])
                .silentRun();

            expect(updatedCatalogItem).toEqual(catalogItem);
        });

        it("should return unchanged catalog item when there are many matching bucket attributes", async () => {
            const catalogItem: ICatalogEntry = {
                type: "attribute" as const,
                ref,
                dfRef: defaultDisplayFormRef,
            };

            const { returnValue: updatedCatalogItem } = await expectSaga(
                syncCatalogItemDisplayFormWithMatchingBucketItem,
                catalogItem,
            )
                .provide([
                    [
                        select(getAttributeBucketItemsByRef, ref),
                        [{ dfRef: defaultDisplayFormRef }, { dfRef: displayFormRef }],
                    ],
                ])
                .silentRun();

            expect(updatedCatalogItem).toEqual(catalogItem);
        });

        it("should return catalog item with changed display form when 1 matching bucket attribute item is found", async () => {
            const catalogItem: ICatalogEntry = {
                type: "attribute" as const,
                ref,
                dfRef: defaultDisplayFormRef,
            };

            const { returnValue: updatedCatalogItem } = await expectSaga(
                syncCatalogItemDisplayFormWithMatchingBucketItem,
                catalogItem,
            )
                .provide([[select(getAttributeBucketItemsByRef, ref), [{ dfRef: displayFormRef }]]])
                .silentRun();

            expect(updatedCatalogItem).toEqual({ type: "attribute", ref, dfRef: displayFormRef });
        });
    });

    describe("syncAttributeFilterDisplayFormWithMatchingBucketItem", () => {
        const ref = uriRef("/uri0");
        const displayFormRef = uriRef("/uri2");
        const defaultDisplayFormRef = uriRef("/uri1");

        const itemCache = { "attribute.attr.1": { ref } };

        const attributeFilter: IFilter = {
            type: "attribute",
            cacheItemIdentifier: "attr.1",
            localIdentifier: "attr1",
            displayFormRef: defaultDisplayFormRef,
        };

        const measureValueFilter: IFilter = {
            type: "measure",
            localIdentifier: "m1",
            measureLocalIdentifier: "m1",
        };

        it("should return unchanged filter when filter is not of type attribute", async () => {
            const { returnValue: updatedFilter } = await expectSaga(
                syncAttributeFilterDisplayFormWithMatchingBucketItem,
                measureValueFilter,
            ).silentRun();

            expect(updatedFilter).toEqual(measureValueFilter);
        });

        it("should return unchanged filter when there is no matching bucket attribute", async () => {
            const { returnValue: updatedFilter } = await expectSaga(
                syncAttributeFilterDisplayFormWithMatchingBucketItem,
                attributeFilter,
            )
                .provide([
                    [select(getItemCache), itemCache],
                    [select(getAttributeBucketItemsByRef, ref), []],
                ])
                .silentRun();

            expect(updatedFilter).toEqual(attributeFilter);
        });

        it("should return unchanged filter when there are many matching bucket attributes", async () => {
            const { returnValue: updatedFilter } = await expectSaga(
                syncAttributeFilterDisplayFormWithMatchingBucketItem,
                attributeFilter,
            )
                .provide([
                    [select(getItemCache), itemCache],
                    [
                        select(getAttributeBucketItemsByRef, ref),
                        [{ dfRef: defaultDisplayFormRef }, { dfRef: displayFormRef }],
                    ],
                ])
                .silentRun();

            expect(updatedFilter).toEqual(attributeFilter);
        });

        it("should return filter with with changed display form when 1 matching bucket attribute item is found", async () => {
            const { returnValue: updatedFilter } = await expectSaga(
                syncAttributeFilterDisplayFormWithMatchingBucketItem,
                attributeFilter,
            )
                .provide([
                    [select(getItemCache), itemCache],
                    [select(getAttributeBucketItemsByRef, ref), [{ dfRef: displayFormRef }]],
                ])
                .silentRun();

            expect(updatedFilter).toEqual({
                type: "attribute",
                cacheItemIdentifier: "attr.1",
                localIdentifier: "attr1",
                displayFormRef,
            });
        });
    });
});
