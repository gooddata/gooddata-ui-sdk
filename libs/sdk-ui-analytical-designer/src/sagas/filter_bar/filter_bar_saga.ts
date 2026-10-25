// (C) 2019-2026 GoodData Corporation

import { type SagaReturnType, all, call, put, select, takeEvery } from "redux-saga/effects";
import { createSelector } from "reselect";

import { type IAttributeFilterConfigs, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { storeSetBucketItemShowInPercent } from "../../actions/buckets_actions.js";
import { ATTRIBUTE, DATE, METRIC } from "../../constants/bucket.js";
import { isComputedAttributeItem } from "../../models/bucket_item.js";
import { getAttributeByIdentifier } from "../../models/decorated_bucket_item.js";
import { attributeCacheNamespace, findAttributeCacheItemByRef } from "../../models/item_cache_lookup.js";
import { getAllMeasureBucketItems } from "../../selectors/buckets_selector.js";
import {
    enableImprovedMetricDateFilter,
    enableImprovedRankingFilter,
} from "../../selectors/feature_flag_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import {
    getAttributeBucketItemsByRef,
    getDerivedBucketItems,
    getMeasures,
    getPrimaryDateDatasetRef,
} from "../../services/buckets_service.js";
import { logAddFilterToInsight } from "../../services/telemetry/tracking_events.js";
import { getAllBucketItems } from "../../store/buckets/buckets_selectors.js";
import {
    addFiltersToState,
    filtersWereChanged,
    removeFiltersFromState,
    setMultilineFilterBar,
    storeFilterBarAutoOpen,
    updateAttributeFilterConfigsInState,
} from "../../store/filter_bar/filter_bar_actions.js";
import {
    getAdditionalDateAttributeFilters,
    getAttributeFilterConfigs,
    getDateFilterIndex,
    getFilterItems,
    getMeasureValueFilters,
    getParameterFilters,
    getRankingFilter,
    hasRankingFilter,
} from "../../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import {
    FilterBar,
    type IAttributeFilter,
    type IFilter,
    type IRankingFilter,
} from "../../store/filter_bar/filter_bar_types.js";
import { removeParameterFiltersFromState } from "../../store/filter_bar/parameter_filter_actions.js";
import { type IAppState } from "../../store/types.js";
import { type IRawBucketItem, type IRawBucketItems } from "../../typings/buckets.js";
import { type ICacheItem, type ICatalogEntries, type ICatalogEntry } from "../../typings/state_objects.js";

import {
    FilterBarUiActionTypeKeys,
    type IAddFilterAction,
    type IAddRankingFilterFromMetricAction,
    type IRemoveFilterAction,
    type ISetMultilineFilterBarAction,
    type IUpdateFiltersAction,
} from "./filter_bar_ui_actions.js";
import { type IItemState, type IItemsState } from "./types.js";

interface IFilterChanges {
    newFilters: IFilter[];
    removedFilters: IFilter[];
}

function getFirstBucketItem(item: IItemState, bucketItems: IRawBucketItems): IRawBucketItem {
    const firstBucketItemLocalIdentifier = item.bucketItemLocalIdentifiers[0];
    return bucketItems.find((item) => item.localIdentifier === firstBucketItemLocalIdentifier);
}

function buildAttributeFilterForBucketItem(
    bucketItem: IRawBucketItem,
    itemCache: ICatalogEntries,
): IAttributeFilter {
    const { identifier, dfRef } = getAttributeByIdentifier(
        bucketItem.attribute,
        itemCache,
        attributeCacheNamespace(isComputedAttributeItem(bucketItem)),
    ) as ICacheItem;
    return FilterBarService.createAttributeFilter(identifier, dfRef);
}

/**
 * Get dimensionality (local identifiers) from attribute and date bucket items.
 */
function getDimensionalityFromBucketItems(
    bucketItems: ReadonlyArray<Pick<IRawBucketItem, "type" | "localIdentifier">>,
): string[] {
    return bucketItems
        .filter((item) => item.type === ATTRIBUTE || item.type === DATE)
        .map((item) => item.localIdentifier)
        .filter((localIdentifier): localIdentifier is string => localIdentifier != null);
}

/**
 * The "out of" attributes to seed into a newly created ranking filter: the insight's bucket
 * attributes/dates in the improved flow (so it ranks out of the existing attributes, mirroring the
 * measure value filter), or undefined in the classic single-attribute flow.
 */
function* getRankingSeedDimensionality() {
    const improved: ReturnType<typeof enableImprovedRankingFilter> =
        yield select(enableImprovedRankingFilter);
    if (!improved) {
        return undefined;
    }
    const bucketItems: ReturnType<typeof getAllBucketItems> = yield select(getAllBucketItems);
    return getDimensionalityFromBucketItems(bucketItems);
}

function buildNewFilter(
    itemState: IItemState,
    allBucketItems: IRawBucketItems,
    itemCache: ICatalogEntries,
    dimensionality?: string[],
): IFilter {
    const bucketItem = getFirstBucketItem(itemState, allBucketItems);
    if (!bucketItem) {
        throw new Error(
            `Bucket item not found for localIdentifiers: ${itemState.bucketItemLocalIdentifiers.join(", ")}`,
        );
    }

    switch (bucketItem.type) {
        case ATTRIBUTE:
            return buildAttributeFilterForBucketItem(bucketItem, itemCache);
        case DATE:
            return FilterBarService.createDateFilter(bucketItem.dateDatasetRef);
        case METRIC:
            return FilterBarService.createMeasureValueFilter(bucketItem.localIdentifier, dimensionality);
        default:
            throw new Error(`Unsupported bucket item type "${bucketItem.type}" provided!`);
    }
}

function findFilter(itemState: IItemState, filters: ReadonlyArray<IFilter>): IFilter {
    return filters.find((filter) => filter.localIdentifier === itemState.filterLocalIdentifier);
}

function* appendRankingFilterIfEnabled(newFilters: IFilter[], rankingFilterState: boolean) {
    const rankingFilterExists: ReturnType<typeof hasRankingFilter> = yield select(hasRankingFilter);
    if (!rankingFilterExists && rankingFilterState) {
        const measuresRaw: ReturnType<typeof getMeasures> = yield select(getMeasures);
        const measures: IRawBucketItems = measuresRaw;
        if (measures.length === 0) {
            return newFilters;
        }
        const dimensionality: SagaReturnType<typeof getRankingSeedDimensionality> = yield call(
            getRankingSeedDimensionality,
        );
        const rankingFilter = FilterBarService.createDefaultRankingFilter(
            measures[0].localIdentifier,
            dimensionality,
        );
        return [...newFilters, rankingFilter];
    }
    return newFilters;
}

function* appendRankingFilterIfDisabled(removedFilters: IFilter[], rankingFilterState: boolean) {
    const rankingFilterExists: ReturnType<typeof hasRankingFilter> = yield select(hasRankingFilter);
    if (rankingFilterExists && !rankingFilterState) {
        const rankingFilter: IRankingFilter = yield select(getRankingFilter);
        return [...removedFilters, rankingFilter];
    }
    return removedFilters;
}

function* getFiltersChanges(itemStates: IItemsState, rankingFilterState: boolean) {
    const filters: ReadonlyArray<IFilter> = yield select(getFilterItems);
    const allBucketItems: ReturnType<typeof getAllBucketItems> = yield select(getAllBucketItems);
    const itemCache: ReturnType<typeof getItemCache> = yield select(getItemCache);
    const dimensionality = getDimensionalityFromBucketItems(allBucketItems);
    const bucketItems = allBucketItems;

    const { newFilters, removedFilters } = Object.keys(itemStates).reduce(
        (changes: IFilterChanges, key: string) => {
            const { newFilters, removedFilters } = changes;
            const itemState = itemStates[key];
            const filterExists = itemState.filterLocalIdentifier !== null;

            if (itemState.enabled && !filterExists) {
                newFilters.push(buildNewFilter(itemState, bucketItems, itemCache, dimensionality));
            } else if (!itemState.enabled && filterExists) {
                removedFilters.push(findFilter(itemState, filters));
            }

            return changes;
        },
        { newFilters: [], removedFilters: [] },
    );

    const newWithAppended: SagaReturnType<typeof appendRankingFilterIfEnabled> = yield call(
        appendRankingFilterIfEnabled,
        newFilters,
        rankingFilterState,
    );
    const removedWithAppended: SagaReturnType<typeof appendRankingFilterIfDisabled> = yield call(
        appendRankingFilterIfDisabled,
        removedFilters,
        rankingFilterState,
    );
    return {
        newFilters: newWithAppended,
        removedFilters: removedWithAppended,
    };
}

const getDerivedMeasuresWithMeasureValueFilter = createSelector(
    getMeasureValueFilters,
    getDerivedBucketItems,
    (measureValueFilters, derivedBucketItems) =>
        measureValueFilters
            .map((filter) =>
                derivedBucketItems.find(
                    (bucketItem) => bucketItem.localIdentifier === filter.measureLocalIdentifier,
                ),
            )
            .filter((bucketItem) => !!bucketItem),
);

function* disableShownInPercentOnFilteredDerivedMeasures() {
    const filteredDerivedMeasures: ReturnType<typeof getDerivedMeasuresWithMeasureValueFilter> = yield select(
        getDerivedMeasuresWithMeasureValueFilter,
    );
    const masterMeasuresLocalIdentifiers = filteredDerivedMeasures.map(
        (derived) => derived.masterLocalIdentifier,
    );

    for (const localIdentifier of masterMeasuresLocalIdentifiers) {
        yield put(storeSetBucketItemShowInPercent(localIdentifier, false));
    }
}

export function* sanitizeFilters() {
    yield call(disableShownInPercentOnFilteredDerivedMeasures);
}

export function* syncAttributeFilterDisplayFormWithMatchingBucketItem(filter: IFilter) {
    if (!FilterBar.isAttributeFilter(filter)) {
        return filter;
    }

    const itemCache: ReturnType<typeof getItemCache> = yield select(getItemCache);
    const filterRef = findAttributeCacheItemByRef(
        itemCache,
        filter.cacheItemIdentifier,
        filter.displayFormRef,
    )?.ref;
    const matchingBucketAttributes: ReturnType<typeof getAttributeBucketItemsByRef> = yield select(
        getAttributeBucketItemsByRef,
        filterRef,
    );

    if (matchingBucketAttributes.length === 1) {
        return { ...filter, displayFormRef: matchingBucketAttributes[0].dfRef };
    }

    return filter;
}

export function* syncCatalogItemDisplayFormWithMatchingBucketItem(catalogItem: ICatalogEntry) {
    if (catalogItem.type !== "attribute" && catalogItem.type !== "computedAttribute") {
        return catalogItem;
    }

    const matchingBucketAttributes: ReturnType<typeof getAttributeBucketItemsByRef> = yield select(
        getAttributeBucketItemsByRef,
        catalogItem.ref,
    );

    if (matchingBucketAttributes.length === 1) {
        return {
            ...catalogItem,
            dfRef: matchingBucketAttributes[0].dfRef,
        };
    }

    return catalogItem;
}

export function* updateFilters(action: IUpdateFiltersAction) {
    const { itemsState, rankingFilterState } = action.payload;

    const filterChanges: IFilterChanges = yield call(getFiltersChanges, itemsState, rankingFilterState);
    const { newFilters, removedFilters } = filterChanges;

    let filtersToUpdate = [...newFilters];
    let filtersToDelete = [...removedFilters];
    const isDateFilterRemoved = filtersToDelete.some(FilterBar.isDateFilter);
    if (isDateFilterRemoved) {
        const state: IAppState = yield select();
        filtersToDelete = [...getAdditionalDateAttributeFilters(state), ...filtersToDelete];
    }

    if (filtersToUpdate.length > 0) {
        filtersToUpdate = yield all(
            filtersToUpdate.map((filter) =>
                call(syncAttributeFilterDisplayFormWithMatchingBucketItem, filter),
            ),
        );
        yield put(addFiltersToState(filtersToUpdate, true));
        // a new ranking filter always opens its configuration right away (not gated by any flag)
        const addedRankingFilter = filtersToUpdate.find(FilterBar.isRankingFilter);
        if (addedRankingFilter) {
            yield put(storeFilterBarAutoOpen(addedRankingFilter.localIdentifier));
        }
    }

    if (filtersToDelete.length > 0) {
        yield put(
            removeFiltersFromState(
                filtersToDelete.map((filter) => filter.localIdentifier),
                true,
            ),
        );
    }

    if (filtersToUpdate.length > 0 || filtersToDelete.length > 0) {
        yield put(filtersWereChanged(filtersToUpdate, filtersToDelete));
        yield call(sanitizeFilters);
    }
}

function getPrimaryDf(attribute: ICatalogEntry) {
    return attribute.displayForms?.find((df) => !!df.isPrimary);
}

export function* addFilter(action: IAddFilterAction) {
    const { catalogItem, bucketItemLocalIdentifier, autoOpen } = action.payload;

    const state: IAppState = yield select();

    const dateDatasetRef: ReturnType<typeof getPrimaryDateDatasetRef> =
        yield select(getPrimaryDateDatasetRef);
    if (catalogItem.type === "date" && !dateDatasetRef) {
        return;
    }
    const syncedCatalogItem: SagaReturnType<typeof syncCatalogItemDisplayFormWithMatchingBucketItem> =
        yield call(syncCatalogItemDisplayFormWithMatchingBucketItem, catalogItem);

    const bucketMeasures: ReturnType<typeof getAllMeasureBucketItems> =
        yield select(getAllMeasureBucketItems);

    // Compute dimensionality from bucket items when improved filters are enabled
    const bucketItems: ReturnType<typeof getAllBucketItems> = yield select(getAllBucketItems);
    const dimensionality = getDimensionalityFromBucketItems(bucketItems);

    const newFilter = bucketItemLocalIdentifier
        ? FilterBarService.createMeasureValueFilter(bucketItemLocalIdentifier, dimensionality)
        : FilterBarService.createFilter(
              syncedCatalogItem,
              dateDatasetRef,
              true,
              bucketMeasures,
              dimensionality,
          );

    if (FilterBar.isAttributeFilter(newFilter)) {
        const defaultOrSyncedDfRef: ObjRef = syncedCatalogItem.dfRef;
        const primaryDf = getPrimaryDf(syncedCatalogItem);
        // Only update config if we have both a synced display form and a primary display form to compare
        if (defaultOrSyncedDfRef && primaryDf && !areObjRefsEqual(defaultOrSyncedDfRef, primaryDf.ref)) {
            const currentAttributeFilterConfigs: ReturnType<typeof getAttributeFilterConfigs> =
                yield select(getAttributeFilterConfigs);
            const newAttributeFilterConfigs: IAttributeFilterConfigs = {
                ...currentAttributeFilterConfigs,
                [newFilter.localIdentifier]: {
                    displayAsLabel: defaultOrSyncedDfRef,
                },
            };
            yield put(updateAttributeFilterConfigsInState(newAttributeFilterConfigs));
        }
    }

    yield put(addFiltersToState([newFilter], false));

    if (autoOpen) {
        // the filter the user just added opens its picker right away, like a metric's filter does;
        // gated so the flag-off filter bar behaves exactly as before
        const autoOpenEnabled: ReturnType<typeof enableImprovedMetricDateFilter> = yield select(
            enableImprovedMetricDateFilter,
        );
        if (autoOpenEnabled) {
            yield put(storeFilterBarAutoOpen(newFilter.localIdentifier));
        }
    }

    yield put(filtersWereChanged([newFilter], []));
    yield call(sanitizeFilters);
    yield call(logAddFilterToInsight, { state });
}

/**
 * Creates a ranking filter from a metric picked in the filter bar metric picker (improved ranking filter
 * flow, gated by enableImprovedRankingFilter). The metric is referenced by its bucket localIdentifier when
 * it is present in the buckets, otherwise by ObjRef so a catalog metric can be ranked without being in the
 * insight.
 */
export function* addRankingFilterFromMetric(action: IAddRankingFilterFromMetricAction) {
    const { catalogItem, bucketItemLocalIdentifier } = action.payload;

    const state: IAppState = yield select();

    const rankingFilterExists: ReturnType<typeof hasRankingFilter> = yield select(hasRankingFilter);
    if (rankingFilterExists) {
        return;
    }

    const bucketMeasures: ReturnType<typeof getAllMeasureBucketItems> =
        yield select(getAllMeasureBucketItems);

    // Prefer a matching bucket measure localIdentifier; fall back to the catalog ObjRef otherwise.
    const measureIdentifier: string | ObjRef =
        bucketItemLocalIdentifier ??
        FilterBarService.findMatchingBucketMeasureLocalIdentifier(catalogItem.ref, bucketMeasures) ??
        catalogItem.ref;

    const dimensionality: SagaReturnType<typeof getRankingSeedDimensionality> = yield call(
        getRankingSeedDimensionality,
    );
    const rankingFilter = FilterBarService.createDefaultRankingFilter(measureIdentifier, dimensionality);

    yield put(addFiltersToState([rankingFilter], false));
    yield put(storeFilterBarAutoOpen(rankingFilter.localIdentifier));
    yield put(filtersWereChanged([rankingFilter], []));
    yield call(sanitizeFilters);
    yield call(logAddFilterToInsight, { state });
}

export function* removeFilter(action: IRemoveFilterAction) {
    const { itemLocalIdentifier, itemType } = action.payload;

    const state: IAppState = yield select();

    if (itemType === "parameter") {
        const exists = getParameterFilters(state).some(
            (filter) => filter.localIdentifier === itemLocalIdentifier,
        );
        if (!exists) {
            return;
        }
        yield put(removeParameterFiltersFromState([itemLocalIdentifier]));
        return;
    }

    let filtersToDelete: IFilter[] = [];
    if (itemType === "date") {
        const isFirstDateFilter = getDateFilterIndex(state, itemLocalIdentifier) === 0;

        if (isFirstDateFilter) {
            const additionalDateAttributeFilters = getAdditionalDateAttributeFilters(state);
            filtersToDelete = [...filtersToDelete, ...additionalDateAttributeFilters];
        }
    }
    filtersToDelete = [
        ...filtersToDelete,
        getFilterItems(state).find((filter) => filter.localIdentifier === itemLocalIdentifier),
    ];

    yield put(
        removeFiltersFromState(
            filtersToDelete.map((filterToDelete) => filterToDelete.localIdentifier),
            false,
        ),
    );
    const currentAttributeFilterConfigs: ReturnType<typeof getAttributeFilterConfigs> =
        yield select(getAttributeFilterConfigs);
    const newAttributeFilterConfigs = Object.entries(currentAttributeFilterConfigs).reduce((acc, config) => {
        const [localIdentifier, attributeFilterConfig] = config;
        if (localIdentifier !== itemLocalIdentifier) {
            acc[localIdentifier] = attributeFilterConfig;
        }
        return acc;
    }, {} as IAttributeFilterConfigs);
    yield put(updateAttributeFilterConfigsInState(newAttributeFilterConfigs));
    yield put(filtersWereChanged([], filtersToDelete));
    yield call(sanitizeFilters);
}

export function* setMultilineFilterBarSaga(action: ISetMultilineFilterBarAction) {
    yield put(setMultilineFilterBar(action.payload.isMultiLine));
}

export function* watchFilterBar() {
    yield takeEvery(FilterBarUiActionTypeKeys.UI_UPDATE_FILTERS, updateFilters);
    yield takeEvery(FilterBarUiActionTypeKeys.UI_ADD_FILTER, addFilter);
    yield takeEvery(FilterBarUiActionTypeKeys.UI_ADD_RANKING_FILTER_FROM_METRIC, addRankingFilterFromMetric);
    yield takeEvery(FilterBarUiActionTypeKeys.UI_REMOVE_FILTER, removeFilter);
    yield takeEvery(FilterBarUiActionTypeKeys.UI_SET_MULTILINE_FILTER_BAR, setMultilineFilterBarSaga);
}
