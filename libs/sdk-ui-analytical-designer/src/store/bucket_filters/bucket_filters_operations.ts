// (C) 2026 GoodData Corporation

import { isEqual, omit } from "lodash-es";

import { type DisplayFormRefType } from "@gooddata/sdk-embedding/internal";
import { type ObjRef, areObjRefsEqual, idRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { COMPUTED_ATTRIBUTE } from "../../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { metricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { getCacheKeyForAttributeItem } from "../../models/item_cache_lookup.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IDateDatasetRefWithGranularities } from "../../typings/datasets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import {
    type IBucketItemAddress,
    getBucketItemAddress,
    updateBucketItemAt,
} from "../buckets/bucket_item_address.js";
import { setModifiedMarker } from "../buckets/buckets_meta_helpers.js";
import { type IBucketsMetaState } from "../buckets/buckets_meta_state.js";
import { findBucketItemInBuckets } from "../buckets/buckets_write_helpers.js";
import {
    type ISetOverTimeComparisonDeps,
    type ISetOverTimeComparisonInput,
    updateDerivedMeasuresOverTime,
} from "../buckets/over_time_comparison_helpers.js";
import { type IPluggableVisualizationState } from "../buckets/pluggable_visualization_state.js";
import {
    type IDateAttributeWithDisplayForm,
    addFilter,
    createDateFilter,
    createMeasureValueFilter,
    findAttributeFilter,
    findDateFilter,
    findDateFilterIndex,
    findFirstDateFilter,
    findMeasureValueFilters,
    findRankingFilter,
    resetAdditionalDateFilters,
    storeAttributeFilterConfigs,
    storeFilter,
    updateAttributeFilter,
    updateDateFilter,
    updateFilters,
} from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import {
    type IAttributeFilter,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
} from "../filter_bar/filter_bar_types.js";
import { mergeItemsIntoCache } from "../item_cache/item_cache_helpers.js";
import { type IItemCacheState, itemCacheInitialState } from "../item_cache/item_cache_state.js";
import {
    setSelectedByIdentifierInState,
    setSelectedInState,
} from "../measure_date_datasets/measure_date_datasets_helpers.js";
import {
    type IMeasureDateDatasetsState,
    measureDateDatasetsInitialState,
} from "../measure_date_datasets/measure_date_datasets_state.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";

import {
    type ICommandUpdateFilterItemsActionPayload,
    type IMetricDateFilterStorePayload,
    type IMetricFilterChanges,
    type IStoreUpdateDateFilterDateDatasetAction,
    type IUpdateAttributeFilterActionPayload,
    type IUpdateDateFilterActionPayload,
    type IUpdateRankingFilterActionPayload,
} from "./bucket_filters_actions.js";
import {
    isMetricAdditionalDateFilter,
    replaceMetricAdditionalDateFilters,
} from "./metric_additional_date_filters.js";

/**
 * THE BUCKET-FILTERS OPERATIONS — nine operations behind nine `STORE_*` triggers; the two
 * display-form triggers are plain filter-bar cases and not here. Every operation is a pure
 * calculation over an explicit named input, params and deps, answering an explicit named result —
 * the saga (`bucket_filters_operations_saga.ts`) selects the input, resolves the deps and commits
 * the result with ONE semantic event (`bucket_filters_operation_events.ts`).
 *
 * The tail every operation ends with — the reference-point sync plus
 * `isVisualizationMdObjectValid = false` — is spelled out per operation, because the sync is over
 * exactly the values that operation just decided.
 *
 * THREE COMMIT-NOTHING CASES, each of them deliberate rather than an oversight:
 *
 * - an attribute-filter update addressing a filter that does not exist COMMITS NOTHING. A throw out
 *   of the saga would kill the family's watcher;
 * - a metric-filter operation addressing a bucket item that is in no bucket COMMITS NOTHING;
 * - a date-filter payload without `overTimeComparisonType` leaves the derived measures UNTOUCHED.
 *   Embed hosts legitimately send date updates without the two OTC fields, and a silent removal is
 *   not a defensible reading of that. An absent measure LIST with the type present reads as "no
 *   measure compares".
 */

// --- the shared tail -------------------------------------------------------------------------------

/** The `bucketsWereChanged` tail as a value: sync the reference point, clear the md-object flag. */
function syncTail(
    referencePoint: IReferencePointState | undefined,
    buckets: IRawBuckets,
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
    deps: IReferencePointSyncDeps,
): {
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
} {
    return {
        referencePoint: syncReferencePointForBuckets(referencePoint, buckets, filterBar, bucketsMeta, deps),
        isVisualizationMdObjectValid: false,
    };
}

// --- updating an attribute filter (STORE_UPDATE_ATTRIBUTE_FILTER) ----------------------------------

export interface IAttributeFilterUpdateInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
}

export interface IAttributeFilterUpdateResult {
    filterBar: IFilterBarState;
    bucketsMeta: IBucketsMetaState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/**
 * The filter update plus the `modified` marker — shared with the command path, which composes it
 * per attribute-filter entry. `undefined` when the filter does not exist (see the module note).
 */
function updateAttributeFilterValues(
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
    payload: IUpdateAttributeFilterActionPayload,
): { filterBar: IFilterBarState; bucketsMeta: IBucketsMetaState } | undefined {
    const {
        filterLocalIdentifier,
        selectedElements,
        totalElementsCount,
        isInverted,
        displayFormRef,
        textModeFilter,
    } = payload;

    if (!findAttributeFilter(filterBar, filterLocalIdentifier)) {
        return undefined;
    }

    const updatedFilterBar = updateAttributeFilter(
        filterBar,
        filterLocalIdentifier,
        selectedElements,
        totalElementsCount,
        isInverted,
        displayFormRef,
        textModeFilter,
    );
    const updatedFilter = findAttributeFilter(updatedFilterBar, filterLocalIdentifier);

    return {
        filterBar: updatedFilterBar,
        // identity-preserving: an already-true marker is the same meta
        bucketsMeta: setModifiedMarker(bucketsMeta, updatedFilter.cacheItemIdentifier, true),
    };
}

export function applyAttributeFilterUpdate(
    input: IAttributeFilterUpdateInput,
    payload: IUpdateAttributeFilterActionPayload,
    deps: IReferencePointSyncDeps,
): IAttributeFilterUpdateResult | undefined {
    const updated = updateAttributeFilterValues(input.filterBar, input.bucketsMeta, payload);
    if (!updated) {
        return undefined;
    }

    return {
        ...updated,
        ...syncTail(input.referencePoint, input.buckets, updated.filterBar, updated.bucketsMeta, deps),
    };
}

// --- storing a measure-value / ranking filter (STORE_UPDATE_{MEASURE_VALUE,RANKING}_FILTER) ---------

export interface IFilterStoreInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
}

export interface IFilterStoreResult {
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/** One implementation for both filters: the saga already recomputed the filter, this stores it. */
export function applyFilterStore(
    input: IFilterStoreInput,
    filter: IMeasureValueFilter | IRankingFilter,
    deps: IReferencePointSyncDeps,
): IFilterStoreResult {
    const filterBar = storeFilter(input.filterBar, filter);

    return {
        filterBar,
        ...syncTail(input.referencePoint, input.buckets, filterBar, input.bucketsMeta, deps),
    };
}

// --- the date filter (STORE_UPDATE_DATE_FILTER) -----------------------------------------------------

export interface IDateFilterUpdateInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IDateFilterUpdateResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IDateFilterUpdateDeps extends ISetOverTimeComparisonDeps {
    /** what decides which existing filters are ADDITIONAL date filters (the meta items, flattened) */
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>;
}

/**
 * Threads the over-time-comparison value: the filter-bar update, the derived-measure consequence
 * when THE date filter (index 0) changed, and the `modified` marker under the date pseudo-attribute.
 * Shared with the command path.
 */
function updateDateFilterValues(
    current: ISetOverTimeComparisonInput,
    payload: IUpdateDateFilterActionPayload,
    deps: IDateFilterUpdateDeps,
): ISetOverTimeComparisonInput {
    const {
        overTimeComparisonType,
        overTimeComparisonMeasures,
        filterConfig,
        dateDatasetRef,
        localIdentifier,
        emptyDateValuesFilter,
    } = payload;

    let next: ISetOverTimeComparisonInput = {
        ...current,
        filterBar: updateDateFilter(current.filterBar, {
            localIdentifier,
            filterConfig,
            overTimeComparisonType,
            dateDatasetRef,
            emptyDateValuesFilter,
        }),
    };

    // "the" date filter is decided against the PRE-update filter bar. The derived pass runs only
    // when the payload SAYS something about the comparison — an absent type must leave the derived
    // measures untouched, because embed hosts send date updates without the two OTC fields and
    // falling back to NOTHING here would silently remove every derived measure
    if (
        overTimeComparisonType !== undefined &&
        findDateFilterIndex(current.filterBar, localIdentifier) === 0
    ) {
        next = updateDerivedMeasuresOverTime(
            next,
            overTimeComparisonMeasures ?? [],
            overTimeComparisonType,
            deps,
        );
    }

    return {
        ...next,
        bucketsMeta: setModifiedMarker(next.bucketsMeta, DATE_DATASET_ATTRIBUTE, true),
    };
}

export function applyDateFilterUpdate(
    input: IDateFilterUpdateInput,
    payload: IUpdateDateFilterActionPayload,
    deps: IDateFilterUpdateDeps,
): IDateFilterUpdateResult {
    let value = updateDateFilterValues(input, payload, deps);

    // recomputed against the INPUT filter bar, not the updated one
    if (
        payload.additionalDateAttributeFilters &&
        findDateFilterIndex(input.filterBar, payload.localIdentifier) === 0
    ) {
        value = {
            ...value,
            filterBar: updateFilters(
                value.filterBar,
                payload.additionalDateAttributeFilters,
                deps.dateDatasetAttributes,
            ),
        };
    }

    return {
        ...value,
        ...syncTail(value.referencePoint, value.buckets, value.filterBar, value.bucketsMeta, deps),
    };
}

// --- the date filter's date dataset (STORE_UPDATE_DATE_FILTER_DATE_DATASET) ------------------------

export interface IDateFilterDateDatasetChangeInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IDateFilterDateDatasetChangeResult {
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IDateFilterDateDatasetChangeDeps extends IReferencePointSyncDeps {
    /** the resolved granularity list `resetAdditionalDateFilters` migrates against */
    dateDatasetsWithGranularities: IDateDatasetRefWithGranularities[];
}

/**
 * ALWAYS answers a result — a missing filter or an unchanged ref answers every value by reference,
 * so the event still fires and nothing that `take`s it can hang (`sagas/date_datasets` waits on it
 * before reading the filter), while every consuming reducer short-circuits on identity.
 */
export function applyDateFilterDateDatasetChange(
    input: IDateFilterDateDatasetChangeInput,
    payload: IStoreUpdateDateFilterDateDatasetAction["payload"],
    deps: IDateFilterDateDatasetChangeDeps,
): IDateFilterDateDatasetChangeResult {
    const { dateDatasetRef, filterConfig, overTimeComparisonType, localIdentifier } = payload;
    const dateFilter = findDateFilter(input.filterBar, localIdentifier);

    if (!dateFilter || areObjRefsEqual(dateFilter.dateDatasetRef, dateDatasetRef)) {
        return {
            filterBar: input.filterBar,
            referencePoint: input.referencePoint,
            isVisualizationMdObjectValid: input.isVisualizationMdObjectValid,
        };
    }

    let filterBar = updateDateFilter(input.filterBar, {
        localIdentifier,
        dateDatasetRef,
        filterConfig,
        overTimeComparisonType,
        emptyDateValuesFilter: dateFilter.emptyDateValuesFilter,
    });
    filterBar = resetAdditionalDateFilters(filterBar, dateDatasetRef, deps.dateDatasetsWithGranularities);

    return {
        filterBar,
        ...syncTail(input.referencePoint, input.buckets, filterBar, input.bucketsMeta, deps),
    };
}

// --- the embedded command (STORE_ADD_OR_UPDATE_FILTER_ITEMS) ----------------------------------------

export interface ICommandFilterItemsUpdateInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface ICommandFilterItemsUpdateResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface ICommandFilterItemsUpdateDeps extends IDateFilterUpdateDeps {
    /** the fresh-identifier impurity, injected at the saga boundary */
    generateFilterLocalIdentifier: () => string;
}

function addFilterToBar(
    current: ISetOverTimeComparisonInput,
    filterItem: IFilter,
): ISetOverTimeComparisonInput {
    return { ...current, filterBar: addFilter(current.filterBar, filterItem) };
}

/**
 * The embedded `COMMAND/*` path. Its payload shapes are external contract, so there is one branch
 * per shape: the deprecated single `dateFilter`, the `dateFilters` list (only the FIRST created one
 * drives the over-time comparison), attribute / arbitrary / match filters (update when
 * `filterLocalIdentifier` addresses an existing filter, create otherwise), the ranking filter, and
 * the measure-value filters with the bucket-level duplicate guard.
 *
 * ALWAYS answers a result: an update addressing a filter that does not exist answers the UNCHANGED
 * input by reference, because `control_filtering_saga` waits on this operation's event before
 * reading the filters the command created, and a skipped event would hang it. Unreachable from the
 * embed path anyway — its validation resolves `filterLocalIdentifier` from existing filters only.
 */
/**
 * Builds the display form ref of an externally (post message) provided attribute filter. A computed
 * attribute has no labels: its single display form is fabricated client side and shares the computed
 * attribute's own ref, typed `computedAttribute`. Everything else is a label.
 */
function toDisplayFormRef(dfIdentifier: string, dfType: DisplayFormRefType | undefined): ObjRef {
    return idRef(dfIdentifier, dfType ?? "displayForm");
}

export function applyCommandFilterItemsUpdate(
    input: ICommandFilterItemsUpdateInput,
    payload: ICommandUpdateFilterItemsActionPayload,
    deps: ICommandFilterItemsUpdateDeps,
): ICommandFilterItemsUpdateResult {
    const {
        attributeFilters,
        arbitraryFilters,
        matchFilters,
        dateFilter,
        rankingFilter,
        dateFilters,
        measureValueFilters,
    } = payload;
    let value: ISetOverTimeComparisonInput = { ...input };

    if (dateFilter) {
        if (findFirstDateFilter(value.filterBar)) {
            value = updateDateFilterValues(value, dateFilter, deps);
        } else {
            value = addFilterToBar(value, {
                ...createDateFilter(dateFilter.dateDatasetRef),
                filterConfig: dateFilter.filterConfig,
            });
        }
    }

    if (dateFilters) {
        for (const [index, currentDateFilter] of dateFilters.entries()) {
            const { localIdentifier } = currentDateFilter;
            const existingFilter = localIdentifier && findDateFilter(value.filterBar, localIdentifier);

            if (existingFilter) {
                value = updateDateFilterValues(value, currentDateFilter, deps);
            } else {
                value = addFilterToBar(value, {
                    ...createDateFilter(currentDateFilter.dateDatasetRef),
                    filterConfig: currentDateFilter.filterConfig,
                });
                // only the first date filter affects the over-time comparison — and only when the
                // external payload carries a comparison type at all (see updateDateFilterValues)
                if (index === 0 && currentDateFilter.overTimeComparisonType !== undefined) {
                    value = updateDerivedMeasuresOverTime(
                        value,
                        currentDateFilter.overTimeComparisonMeasures ?? [],
                        currentDateFilter.overTimeComparisonType,
                        deps,
                    );
                }
            }
        }
    }

    for (const attributeFilter of attributeFilters ?? []) {
        if (attributeFilter.filterLocalIdentifier) {
            const updated = updateAttributeFilterValues(value.filterBar, value.bucketsMeta, attributeFilter);
            if (!updated) {
                return { ...input };
            }
            value = { ...value, ...updated };
        } else {
            const {
                selectedElements,
                isInverted,
                totalElementsCount,
                cacheItemIdentifier,
                dfIdentifier,
                dfType,
            } = attributeFilter;
            value = addFilterToBar(value, {
                type: "attribute",
                localIdentifier: deps.generateFilterLocalIdentifier(),
                cacheItemIdentifier,
                displayFormRef: toDisplayFormRef(dfIdentifier, dfType),
                filterConfig: {
                    isInverted,
                    selectedElements,
                    totalElementsCount,
                },
            } as IAttributeFilter);
        }
    }

    for (const filter of arbitraryFilters ?? []) {
        const textModeFilter = {
            mode: "arbitrary" as const,
            values: filter.values,
            negativeSelection: filter.negativeSelection,
        };
        if (filter.filterLocalIdentifier) {
            const updated = updateAttributeFilterValues(value.filterBar, value.bucketsMeta, {
                filterLocalIdentifier: filter.filterLocalIdentifier,
                displayFormRef: toDisplayFormRef(filter.dfIdentifier, filter.dfType),
                textModeFilter,
            });
            if (!updated) {
                return { ...input };
            }
            value = { ...value, ...updated };
        } else {
            value = addFilterToBar(value, {
                type: "attribute",
                localIdentifier: deps.generateFilterLocalIdentifier(),
                cacheItemIdentifier: filter.cacheItemIdentifier,
                displayFormRef: toDisplayFormRef(filter.dfIdentifier, filter.dfType),
                textModeFilter,
            } as IAttributeFilter);
        }
    }

    for (const filter of matchFilters ?? []) {
        const textModeFilter = {
            mode: "match" as const,
            operator: filter.operator,
            literal: filter.literal,
            caseSensitive: filter.caseSensitive,
            negativeSelection: filter.negativeSelection,
        };
        if (filter.filterLocalIdentifier) {
            const updated = updateAttributeFilterValues(value.filterBar, value.bucketsMeta, {
                filterLocalIdentifier: filter.filterLocalIdentifier,
                displayFormRef: toDisplayFormRef(filter.dfIdentifier, filter.dfType),
                textModeFilter,
            });
            if (!updated) {
                return { ...input };
            }
            value = { ...value, ...updated };
        } else {
            value = addFilterToBar(value, {
                type: "attribute",
                localIdentifier: deps.generateFilterLocalIdentifier(),
                cacheItemIdentifier: filter.cacheItemIdentifier,
                displayFormRef: toDisplayFormRef(filter.dfIdentifier, filter.dfType),
                textModeFilter,
            } as IAttributeFilter);
        }
    }

    if (rankingFilter) {
        value = applyRankingFilterCommand(value, rankingFilter);
    }

    for (const mvf of measureValueFilters ?? []) {
        const measureRef = idRef(mvf.measureIdentifier, "measure");
        const conditions = mvf.conditions?.length ? mvf.conditions : undefined;
        // first, try to find an existing catalog-drag-and-drop MVF (identified by measureRef)
        const existingMvf = findMeasureValueFilters(value.filterBar).find(
            (filter) => filter.measureRef && areObjRefsEqual(filter.measureRef, measureRef),
        );
        if (existingMvf) {
            value = {
                ...value,
                filterBar: storeFilter(value.filterBar, {
                    ...existingMvf,
                    conditions,
                }),
            };
            continue;
        }
        // guard against creating a duplicate: if the insight already contains a bucket-level MVF for
        // the same measure (identified by measureLocalIdentifier), adding another measureRef-based
        // entry would produce a state unreachable via normal UI interaction
        const hasBucketLevelMvf = findMeasureValueFilters(value.filterBar).some((filter) => {
            if (!filter.measureLocalIdentifier) {
                return false;
            }
            const bucketItem = findBucketItemInBuckets(value.buckets, filter.measureLocalIdentifier);
            return bucketItem?.attribute === mvf.measureIdentifier;
        });
        if (hasBucketLevelMvf) {
            continue;
        }
        value = addFilterToBar(value, {
            ...createMeasureValueFilter(measureRef),
            ...(conditions ? { conditions } : {}),
        });
    }

    return {
        ...value,
        ...syncTail(value.referencePoint, value.buckets, value.filterBar, value.bucketsMeta, deps),
    };
}

function applyRankingFilterCommand(
    value: ISetOverTimeComparisonInput,
    rankingFilter: IUpdateRankingFilterActionPayload,
): ISetOverTimeComparisonInput {
    if (!findRankingFilter(value.filterBar)) {
        return addFilterToBar(value, rankingFilter.filter);
    }
    return {
        ...value,
        filterBar: storeFilter(value.filterBar, rankingFilter.filter),
    };
}

// --- the bucket-item metric filters (STORE_BUCKETS_SET_BUCKET_ITEM_*_METRIC_FILTER) -----------------

/**
 * Rewrites the `filters` collection of the bucket item at `address`.
 *
 * Identity when the updater answers the collection it was given — the filter edits fire per
 * interaction, so a rebuilt filters array would dirty the buckets subtree on every one.
 */
function updateBucketItemFilters(
    buckets: IRawBuckets,
    address: IBucketItemAddress,
    updater: (filters: IBucketItemMetricFilter[]) => IBucketItemMetricFilter[],
): IRawBuckets {
    return updateBucketItemAt(buckets, address, (bucketItem) => {
        const filters = updater(bucketItem.filters as IBucketItemMetricFilter[]);
        return bucketItem.filters === filters ? bucketItem : { ...bucketItem, filters };
    });
}

/** Adds one filter to the end of a bucket item's filters. */
function appendFilter(
    buckets: IRawBuckets,
    address: IBucketItemAddress,
    filter: IBucketItemMetricFilter,
): IRawBuckets {
    return updateBucketItemFilters(buckets, address, (filters) => [...(filters ?? []), filter]);
}

/**
 * Applies an update to every filter of one bucket item, keeping the filters array when none of them
 * changed — the lazy copy `Array.prototype.map` cannot give.
 */
function updateEveryFilter(
    filters: IBucketItemMetricFilter[],
    updater: (filter: IBucketItemMetricFilter) => IBucketItemMetricFilter,
): IBucketItemMetricFilter[] {
    let nextFilters: IBucketItemMetricFilter[] | undefined;

    for (let i = 0; i < filters.length; i += 1) {
        const filter = filters[i];
        const nextFilter = updater(filter);
        if (nextFilter !== filter) {
            nextFilters ??= filters.slice();
            nextFilters[i] = nextFilter;
        }
    }

    return nextFilters ?? filters;
}

export interface IMetricFilterAddInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    itemCache: IItemCacheState;
    measuresDateDatasets: IMeasureDateDatasetsState | undefined;
    referencePoint: IReferencePointState | undefined;
}

export interface IMetricFilterAddResult {
    buckets: IRawBuckets;
    filterBar: IFilterBarState;
    itemCache: IItemCacheState;
    measuresDateDatasets: IMeasureDateDatasetsState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricFilterAddParams {
    item: IRawBucketItem;
    attribute: ICatalogEntry;
    selectedDateDatasetIdentifier: string;
    /** fresh identifier for the created attribute filter, generated at the saga boundary */
    newFilterLocalIdentifier: string;
}

export function applyMetricFilterAdd(
    input: IMetricFilterAddInput,
    { item, attribute, selectedDateDatasetIdentifier, newFilterLocalIdentifier }: IMetricFilterAddParams,
    deps: IReferencePointSyncDeps,
): IMetricFilterAddResult | undefined {
    const address = getBucketItemAddress(input.buckets, item);
    if (!address) {
        return undefined;
    }

    const attributeIdentifier = attribute.identifier;
    const measuresDateDatasets = input.measuresDateDatasets ?? measureDateDatasetsInitialState;
    let buckets = input.buckets;
    let filterBar = input.filterBar;
    let itemCache = input.itemCache;
    let nextMeasureDateDatasets = measuresDateDatasets;

    if (attributeIdentifier === DATE_DATASET_ATTRIBUTE) {
        // the dataset lands on the filter itself too: it is the record's own truth, the
        // measure-level selection a synced convenience
        const dateFilter = metricAttributeFilter({
            localIdentifier: newFilterLocalIdentifier,
            attribute: attributeIdentifier,
            interval: attribute.interval,
            ...(selectedDateDatasetIdentifier ? { dimension: selectedDateDatasetIdentifier } : {}),
        });
        nextMeasureDateDatasets = setSelectedByIdentifierInState(
            measuresDateDatasets,
            item.localIdentifier,
            selectedDateDatasetIdentifier,
        );
        buckets = appendFilter(buckets, address, dateFilter);
    } else {
        // the itemCache merge is the domain's own helper — the same one the slice uses, which keeps
        // the two write paths on ONE set of semantics (field-by-field entry merge, incoming arrays
        // replace cached ones)
        itemCache = mergeItemsIntoCache(itemCache ?? itemCacheInitialState, {
            // the picked item keeps its own namespace, so a computed attribute never merges into
            // (and shadows) the entry of a regular attribute that shares its identifier
            [getCacheKeyForAttributeItem(attributeIdentifier, attribute.type === COMPUTED_ATTRIBUTE)]:
                attribute,
        });
        buckets = appendFilter(
            buckets,
            address,
            metricAttributeFilter({
                localIdentifier: newFilterLocalIdentifier,
                attribute: attributeIdentifier,
                displayFormRef: attribute.primaryRef ?? attribute.dfRef,
            }),
        );
        filterBar = storeAttributeFilterConfigs(filterBar, {
            ...input.filterBar.attributeFilterConfigs,
            [newFilterLocalIdentifier]: {
                displayAsLabel: attribute.dfRef,
            },
        });
    }

    return {
        buckets,
        filterBar,
        itemCache,
        measuresDateDatasets: nextMeasureDateDatasets,
        ...syncTail(input.referencePoint, buckets, filterBar, input.bucketsMeta, deps),
    };
}

export interface IMetricFiltersAddParams {
    item: IRawBucketItem;
    attributes: ReadonlyArray<ICatalogEntry>;
    /** a fresh identifier per picked attribute, generated at the saga boundary */
    newFilterLocalIdentifiers: ReadonlyArray<string>;
}

/**
 * Several attribute filters joining a metric as one gesture: each add runs over the previous one's
 * result, so the state lands in one event (one undo step). Nothing to add answers `undefined`.
 */
export function applyMetricFiltersAdd(
    input: IMetricFilterAddInput,
    { item, attributes, newFilterLocalIdentifiers }: IMetricFiltersAddParams,
    deps: IReferencePointSyncDeps,
): IMetricFilterAddResult | undefined {
    let result: IMetricFilterAddResult | undefined;
    let nextInput = input;
    attributes.forEach((attribute, index) => {
        const addResult = applyMetricFilterAdd(
            nextInput,
            {
                item,
                attribute,
                selectedDateDatasetIdentifier: undefined,
                newFilterLocalIdentifier: newFilterLocalIdentifiers[index],
            },
            deps,
        );
        if (!addResult) {
            return;
        }
        result = addResult;
        nextInput = {
            ...nextInput,
            buckets: addResult.buckets,
            filterBar: addResult.filterBar,
            itemCache: addResult.itemCache,
            measuresDateDatasets: addResult.measuresDateDatasets,
            referencePoint: addResult.referencePoint,
        };
    });
    return result;
}

export interface IMetricFilterRemoveInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    measuresDateDatasets: IMeasureDateDatasetsState | undefined;
    referencePoint: IReferencePointState | undefined;
}

export interface IMetricFilterRemoveResult {
    buckets: IRawBuckets;
    filterBar: IFilterBarState;
    measuresDateDatasets: IMeasureDateDatasetsState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricFilterRemoveParams {
    item: IRawBucketItem;
    filter: IBucketItemMetricFilter;
    /**
     * With the shared date filter picker, the metric's attribute filters on the date dataset's own
     * attributes belong to the date filter and leave with it.
     */
    removeAdditionalDateFilters?: boolean;
}

/** The deps of the operations that decide which of a metric's filters are ADDITIONAL date filters. */
export interface IMetricDateFilterDeps extends IReferencePointSyncDeps {
    /** the meta items, flattened — the same source the filter bar decides its additional date filters by */
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>;
    /** the id a new date filter gets, so that several on one dataset stay apart */
    generateFilterLocalIdentifier: () => string;
    /**
     * A date dataset's uri by its identifier, from the date datasets meta — the measure-level
     * selection of a reopened insight's metric must land before the measure's own date datasets
     * were ever loaded.
     */
    dateDatasetUriByIdentifier: (identifier: string) => string | undefined;
}

/**
 * Selects `dateDatasetIdentifier` for the measure: by the measure's loaded date datasets when it
 * has them, by the date datasets meta otherwise (a reopened insight's metric loads its date
 * datasets only when a picker opens).
 */
const selectMeasureDateDataset = (
    measuresDateDatasets: IMeasureDateDatasetsState,
    measureIdentifier: string,
    dateDatasetIdentifier: string,
    deps: IMetricDateFilterDeps,
): IMeasureDateDatasetsState => {
    const byAvailability = setSelectedByIdentifierInState(
        measuresDateDatasets,
        measureIdentifier,
        dateDatasetIdentifier,
    );
    if (byAvailability !== measuresDateDatasets) {
        return byAvailability;
    }
    const uri = deps.dateDatasetUriByIdentifier(dateDatasetIdentifier);
    return uri === undefined
        ? measuresDateDatasets
        : setSelectedInState(measuresDateDatasets, measureIdentifier, uri);
};

export function applyMetricFilterRemove(
    input: IMetricFilterRemoveInput,
    { item, filter, removeAdditionalDateFilters = false }: IMetricFilterRemoveParams,
    deps: IMetricDateFilterDeps,
): IMetricFilterRemoveResult | undefined {
    const address = getBucketItemAddress(input.buckets, item);
    if (!address) {
        return undefined;
    }

    const removesDateFilter = filter?.attribute === DATE_DATASET_ATTRIBUTE;
    const dropsAdditionalDateFilters = removesDateFilter && removeAdditionalDateFilters;
    const isAdditionalDateFilter = (currentFilter: IBucketItemMetricFilter) =>
        dropsAdditionalDateFilters && isMetricAdditionalDateFilter(currentFilter, deps.dateDatasetAttributes);

    let droppedAdditionalDateFilters: IBucketItemMetricFilter[] = [];
    let wasPrimaryDateFilter = false;
    let nextPrimaryDateFilter: IBucketItemMetricFilter | undefined;
    const buckets = updateBucketItemFilters(input.buckets, address, (filters) => {
        droppedAdditionalDateFilters = filters.filter(isAdditionalDateFilter);
        // the very record, or the one with its local identifier (every date filter has one)
        const isRemoved = (currentFilter: IBucketItemMetricFilter) => {
            const currentFilterIdentifier = currentFilter?.localIdentifier;
            const filterIdentifier = filter?.localIdentifier;
            return (
                currentFilter === filter ||
                (!!currentFilterIdentifier &&
                    !!filterIdentifier &&
                    currentFilterIdentifier === filterIdentifier)
            );
        };
        const remaining = filters.filter(
            (currentFilter: IBucketItemMetricFilter) =>
                !(isRemoved(currentFilter) || isAdditionalDateFilter(currentFilter)),
        );
        if (removesDateFilter) {
            const dateFilters = pickMetricDateFilters(filters);
            wasPrimaryDateFilter = dateFilters.length > 0 && isRemoved(dateFilters[0]);
            nextPrimaryDateFilter = pickMetricDateFilters(remaining)[0];
        }
        // An unchanged LENGTH means the predicate dropped nothing, so the original collection stands.
        return remaining.length === filters.length ? filters : remaining;
    });
    const measuresDateDatasets = input.measuresDateDatasets ?? measureDateDatasetsInitialState;
    let filterBar = input.filterBar;
    let nextMeasureDateDatasets = measuresDateDatasets;

    if (removesDateFilter && wasPrimaryDateFilter) {
        // the measure-level selection follows the primary date filter: it moves to the next one,
        // or — with none left — is CLEARED, so the default is recomputed on read
        nextMeasureDateDatasets = setSelectedInState(measuresDateDatasets, item.localIdentifier, undefined);
        if (nextPrimaryDateFilter?.dimension) {
            nextMeasureDateDatasets = selectMeasureDateDataset(
                nextMeasureDateDatasets,
                item.localIdentifier,
                nextPrimaryDateFilter.dimension,
                deps,
            );
        }
    }
    if (droppedAdditionalDateFilters.length > 0) {
        const droppedIdentifiers = droppedAdditionalDateFilters.map((dropped) => dropped.localIdentifier);
        filterBar = storeAttributeFilterConfigs(
            filterBar,
            Object.fromEntries(
                Object.entries(input.filterBar.attributeFilterConfigs).filter(
                    ([key]) => !droppedIdentifiers.includes(key),
                ),
            ),
        );
    }
    if (!removesDateFilter) {
        filterBar = storeAttributeFilterConfigs(
            filterBar,
            Object.fromEntries(
                Object.entries(input.filterBar.attributeFilterConfigs).filter(
                    ([key]) => key !== filter?.localIdentifier,
                ),
            ),
        );
    }

    return {
        buckets,
        filterBar,
        measuresDateDatasets: nextMeasureDateDatasets,
        ...syncTail(input.referencePoint, buckets, filterBar, input.bucketsMeta, deps),
    };
}

export interface IMetricFilterUpdateInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricFilterUpdateResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricFilterUpdateParams {
    item: IRawBucketItem;
    filter: IBucketItemMetricFilter;
    changes: IMetricFilterChanges;
    isModified: boolean;
}

/**
 * The patch: everything the dialog sent, over a cleared `textModeFilter`, minus the `dateDataset`
 * rider.
 */
function patchMetricFilter(
    filter: IBucketItemMetricFilter,
    changes: IMetricFilterChanges,
): IBucketItemMetricFilter {
    const patch: Record<string, unknown> = {
        textModeFilter: null, // helps to clear text filter when not in changes
        ...(changes as Record<string, unknown>),
    };
    delete patch["dateDataset"];

    return { ...filter, ...patch } as IBucketItemMetricFilter;
}

export function applyMetricFilterUpdate(
    input: IMetricFilterUpdateInput,
    { item, filter, changes, isModified }: IMetricFilterUpdateParams,
    deps: ISetOverTimeComparisonDeps,
): IMetricFilterUpdateResult | undefined {
    const address = getBucketItemAddress(input.buckets, item);
    if (!address) {
        return undefined;
    }

    const { overTimeComparisonMeasures, overTimeComparisonType = OverTimeComparisonTypes.NOTHING } = changes;

    const buckets = updateBucketItemFilters(input.buckets, address, (filters) =>
        updateEveryFilter(filters, (currentFilter: IBucketItemMetricFilter) => {
            const filterLocalIdentifier = filter?.localIdentifier;
            const currentLocalIdentifier = currentFilter?.localIdentifier;
            if (
                (currentLocalIdentifier && currentLocalIdentifier === filterLocalIdentifier) ||
                isEqual(currentFilter, filter)
            ) {
                return patchMetricFilter(currentFilter, changes);
            }
            return currentFilter;
        }),
    );

    let value: ISetOverTimeComparisonInput = {
        ...input,
        buckets,
    };

    if (overTimeComparisonMeasures) {
        value = updateDerivedMeasuresOverTime(
            value,
            overTimeComparisonMeasures,
            overTimeComparisonType,
            deps,
        );
    }

    const isAttrFilter = item?.attribute === item?.filters?.[0]?.attribute;
    if (isModified && isAttrFilter) {
        value = {
            ...value,
            bucketsMeta: setModifiedMarker(value.bucketsMeta, filter?.attribute, isModified),
        };
    }

    // an edit that neither drives the comparison nor marks the filter modified still rewrites the
    // filters, but does NOT re-sync the reference point or touch the md flag
    if (overTimeComparisonMeasures || isModified) {
        return {
            ...value,
            ...syncTail(value.referencePoint, value.buckets, value.filterBar, value.bucketsMeta, deps),
        };
    }

    return { ...value };
}

// --- applying the metric date filter picker (STORE_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER) ---

export interface IMetricDateFilterApplyInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    measuresDateDatasets: IMeasureDateDatasetsState | undefined;
    referencePoint: IReferencePointState | undefined;
}

export interface IMetricDateFilterApplyResult {
    buckets: IRawBuckets;
    filterBar: IFilterBarState;
    measuresDateDatasets: IMeasureDateDatasetsState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricDateFilterApplyParams extends IMetricDateFilterStorePayload {
    item: IRawBucketItem;
}

/**
 * The metric's date filters, in order (several may share a dataset, as in the filter bar). The
 * FIRST one is the metric's primary date filter: the one the measure-level date dataset selection
 * (and so the over-time comparison) follows, and the one that owns the additional date filters.
 */
export const pickMetricDateFilters = (
    filters: ReadonlyArray<IBucketItemMetricFilter> | undefined,
): IBucketItemMetricFilter[] =>
    (filters ?? []).filter((filter) => filter?.attribute === DATE_DATASET_ATTRIBUTE);

/**
 * Whether `candidate` is the stored date filter `target` names: the same record, or the one with
 * the same local identifier — the filter bar's rule. Every metric date filter has one: a new one
 * gets it when added, a loaded one when the insight is opened.
 */
export const isSameMetricDateFilter = (
    candidate: IBucketItemMetricFilter,
    target: IBucketItemMetricFilter,
): boolean => {
    if (candidate === target) {
        return true;
    }
    if (candidate?.attribute !== DATE_DATASET_ATTRIBUTE) {
        return false;
    }
    // the local identifier is the only thing telling two date filters apart (two may share a
    // dataset and a period): every metric date filter has one, stamped when added or loaded
    return candidate?.localIdentifier !== undefined && candidate.localIdentifier === target?.localIdentifier;
};

/**
 * Applies the metric date filter picker as ONE gesture, the metric counterpart of the filter bar's
 * date filter update: the period and the dataset land on the named date filter (a new one is
 * appended when none is named). For the PRIMARY date filter the measure-level date dataset
 * selection follows and the additional date filters are replaced with the applied set — kept ones
 * keep their identity, added ones get the `displayAsLabel` config the add operation stores, dropped
 * ones lose theirs; a further date filter touches neither. `undefined` when the bucket item is in no
 * bucket (see the module note).
 */
export function applyMetricDateFilterChange(
    input: IMetricDateFilterApplyInput,
    {
        item,
        dateFilter,
        interval,
        dateDatasetIdentifier,
        additionalDateFilters,
        emptyDateValuesFilter,
    }: IMetricDateFilterApplyParams,
    deps: IMetricDateFilterDeps,
): IMetricDateFilterApplyResult | undefined {
    const address = getBucketItemAddress(input.buckets, item);
    if (!address) {
        return undefined;
    }

    let added: IBucketItemMetricFilter[] = [];
    let removed: IBucketItemMetricFilter[] = [];
    let isPrimaryDateFilter = true;
    const buckets = updateBucketItemFilters(input.buckets, address, (current) => {
        const filters = current ?? [];
        const dateFilters = pickMetricDateFilters(filters);
        const edited = dateFilter
            ? dateFilters.find((candidate) => isSameMetricDateFilter(candidate, dateFilter))
            : undefined;
        // the dataset lands on the filter itself: with several date filters per metric, each
        // has its own; the empty date values mode is replaced, not merged, so applying without one
        // removes it (the key is dropped rather than kept undefined, see measureFilterToMd)
        const emptyDateValuesFilterProp = emptyDateValuesFilter ? { emptyDateValuesFilter } : {};
        const withPeriod = edited
            ? updateEveryFilter(filters, (filter) =>
                  filter === edited
                      ? {
                            ...omit(filter, "emptyDateValuesFilter"),
                            interval,
                            dimension: dateDatasetIdentifier,
                            ...emptyDateValuesFilterProp,
                        }
                      : filter,
              )
            : [
                  ...filters,
                  metricAttributeFilter({
                      localIdentifier: deps.generateFilterLocalIdentifier(),
                      attribute: DATE_DATASET_ATTRIBUTE,
                      interval,
                      dimension: dateDatasetIdentifier,
                      ...emptyDateValuesFilterProp,
                  }),
              ];
        isPrimaryDateFilter = edited ? dateFilters[0] === edited : dateFilters.length === 0;

        // the additional date filters belong to the PRIMARY date filter: a further one leaves them be
        if (!isPrimaryDateFilter) {
            return withPeriod;
        }
        const replacement = replaceMetricAdditionalDateFilters(
            withPeriod,
            additionalDateFilters,
            deps.dateDatasetAttributes,
        );
        added = replacement.added;
        removed = replacement.removed;
        return replacement.filters;
    });

    const removedIdentifiers = removed.map((filter) => filter.localIdentifier);
    const filterBar = storeAttributeFilterConfigs(input.filterBar, {
        ...Object.fromEntries(
            Object.entries(input.filterBar.attributeFilterConfigs).filter(
                ([key]) => !removedIdentifiers.includes(key),
            ),
        ),
        ...Object.fromEntries(
            added.map((filter) => [filter.localIdentifier, { displayAsLabel: filter.displayFormRef }]),
        ),
    });
    // the measure-level selection follows the PRIMARY date filter only
    const baseMeasureDateDatasets = input.measuresDateDatasets ?? measureDateDatasetsInitialState;
    const measuresDateDatasets = isPrimaryDateFilter
        ? selectMeasureDateDataset(baseMeasureDateDatasets, item.localIdentifier, dateDatasetIdentifier, deps)
        : baseMeasureDateDatasets;

    return {
        buckets,
        filterBar,
        measuresDateDatasets,
        ...syncTail(input.referencePoint, buckets, filterBar, input.bucketsMeta, deps),
    };
}

// --- the legacy date dataset selection (MEASURE_DATE_DATASETS_SELECT[_WITHOUT_TIME_TRAVEL]) ---

export interface IMetricDateFilterDateDatasetSelectionInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
}

export interface IMetricDateFilterDateDatasetSelectionResult {
    buckets: IRawBuckets;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IMetricDateFilterDateDatasetSelectionParams {
    measureLocalIdentifier: string;
    dateDatasetIdentifier: string;
}

/**
 * The legacy dropdown selects a metric's date dataset through the measure-level selection; the
 * selection is a synced convenience, the filter's own `dimension` the truth every reader follows,
 * so the selection lands on the metric's primary date filter as well. `undefined` when there is no
 * such filter or it already names the dataset.
 */
export function applyMetricDateFilterDateDatasetSelection(
    input: IMetricDateFilterDateDatasetSelectionInput,
    { measureLocalIdentifier, dateDatasetIdentifier }: IMetricDateFilterDateDatasetSelectionParams,
    deps: IReferencePointSyncDeps,
): IMetricDateFilterDateDatasetSelectionResult | undefined {
    const address = getBucketItemAddress(input.buckets, { localIdentifier: measureLocalIdentifier });
    if (!address) {
        return undefined;
    }
    const buckets = updateBucketItemFilters(input.buckets, address, (filters) => {
        const primary = pickMetricDateFilters(filters)[0];
        if (!primary || primary.dimension === dateDatasetIdentifier) {
            return filters;
        }
        return updateEveryFilter(filters, (filter) =>
            filter === primary ? { ...filter, dimension: dateDatasetIdentifier } : filter,
        );
    });
    if (buckets === input.buckets) {
        return undefined;
    }
    return {
        buckets,
        filterBar: input.filterBar,
        ...syncTail(input.referencePoint, buckets, input.filterBar, input.bucketsMeta, deps),
    };
}
