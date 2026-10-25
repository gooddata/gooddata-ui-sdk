// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { Axis, type IExtendedReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { METRIC } from "../constants/bucket.js";
import { COMBO, COMBO2 } from "../constants/visualization_types.js";
import {
    bucketItemBase,
    buildBucketItemFromCatalogItem,
    isDate,
    isDerived,
    isDerivedFrom,
} from "../models/bucket_item.js";
import { generateBucketItemIdentifier } from "../models/bucket_item_identifier.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { getCacheKeyForAttributeItem } from "../models/item_cache_lookup.js";
import { enableImprovedRankingFilter, enableNewPivotTable } from "../selectors/feature_flag_selector.js";
import { getItemCache } from "../selectors/item_cache_selector.js";
import { getReferencePointExtendedBucketsUiConfig } from "../selectors/ui_config_selector.js";
import {
    getBucketIndexInBuckets,
    getBucketItemIndexInBuckets,
    insertBucketItem,
} from "../store/buckets/bucket_item_address.js";
import {
    type AttributeDfRefResolver,
    type DateDatasetByRefResolver,
    getBucketItemDimensionalityRef,
    getPrimaryDateDatasetRefInBuckets,
    getUsedDateDatasetRefsInBuckets,
    setBucketItemsDateDataset as setBucketItemsDateDatasetInBuckets,
    syncDateBucketItemGranularityAndDfRef as syncDateBucketItemGranularityAndDfRefInItem,
} from "../store/buckets/buckets_date_helpers.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import {
    findAllReferencingArithmeticMeasuresInBuckets,
    getAttributeBucketItemsByRefInBuckets,
    getAttributesInBuckets,
    getBucketByLocalIdentifierInBuckets,
    getBucketIdentifierByItemIdInBuckets,
    getDerivedBucketItemsInBuckets,
    getFirstMasterMeasureInBuckets,
    getMasterMeasuresInBuckets,
    getMeasuresInBuckets,
    getPrimaryMeasuresFromMeasureBucketInBuckets,
    hasDateBucketItemInBuckets,
    isDerivedMeasurePresentInBuckets,
    isSelectedViewByDateOfWeekGranularityInBuckets,
} from "../store/buckets/buckets_read_helpers.js";
import {
    type CatalogMetricRefResolver,
    type IRemoveBucketItemsDeps,
    type IRemoveBucketItemsInput,
    type IRemoveBucketItemsResult,
    findInvalidArithmeticMeasuresForRemoval as findInvalidArithmeticMeasuresForRemovalInBuckets,
    getAllDependantBucketItems as getAllDependantBucketItemsInBuckets,
    getUneditedFilters as getUneditedFiltersInFilterBar,
    removeBucketItemsWithDependencies as removeBucketItemsWithDependenciesInValues,
} from "../store/buckets/buckets_removal_helpers.js";
import { getBucketsState } from "../store/buckets/buckets_selectors.js";
import {
    addTotalsEnabledForAllMeasuresToNewMeasure as addTotalsEnabledForAllMeasuresToNewMeasureInBuckets,
    mirrorTotalsToDerivedMeasures as mirrorTotalsToDerivedMeasuresInBuckets,
    replaceDerivedTotalItems as replaceDerivedTotalItemsInBuckets,
    sanitizeTotals as sanitizeTotalsInBuckets,
} from "../store/buckets/buckets_totals_helpers.js";
import {
    findBucketItemInBuckets,
    findDerivedBucketItemsInBuckets,
    getBucketLocalIdentifierInBuckets,
} from "../store/buckets/buckets_write_helpers.js";
import { createDerivedMeasure as createDerivedMeasureFromMaster } from "../store/buckets/derived_measure_helpers.js";
import {
    containsDateBucketItem,
    containsMetricWithDateFilter,
    isCategoriesOrStacks,
} from "../store/buckets/helpers/bucket_item_predicates.js";
import { findReplacedBucketItemInsertionIndex } from "../store/buckets/helpers/bucket_layout.js";
import { type BucketItemRefResolver } from "../store/buckets/helpers/filter_dependencies.js";
import {
    type CatalogItemTypeResolver,
    type IPreviousMeasureFormats,
    sanitizeReferencePointFormats,
} from "../store/buckets/helpers/measure_format.js";
import {
    insertReplacementDerivedMeasure,
    setBucketItemOverTimeComparison as setBucketItemOverTimeComparisonInValues,
} from "../store/buckets/over_time_comparison_helpers.js";
import { getCatalogItemById } from "../store/catalog/catalog_selector.js";
import { getFirstAvailableDateDataset } from "../store/date_datasets/date_datasets_selectors.js";
import { getFilterBarState, getFilterItems } from "../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../store/filter_bar/filter_bar_service.js";
import { FilterBar, type IFilter } from "../store/filter_bar/filter_bar_types.js";
import {
    getVisualizationPropertiesControl,
    getVisualizationPropertiesSortItems,
} from "../store/properties/properties_selectors.js";
import { validateVisualizationProperties as validateVisualizationPropertiesInErp } from "../store/reference_point/extended_reference_point_helpers.js";
import {
    getUiConfigAxis,
    getUiConfigBucketFlag,
    getUiConfigSupportedOverTimeComparisonTypes,
    isUiConfigExportConfigSupported,
    isUiConfigNoMetricSupported,
    isUiConfigOptionalStackingSupported,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { type IExtendedRefPointBuckets } from "../store/reference_point/extended_reference_point_state.js";
import {
    getExtendedReferencePoint,
    getReferencePoint,
    getReferencePointBuckets,
} from "../store/reference_point/reference_point_selectors.js";
import { syncReferencePoint } from "../store/reference_point/reference_point_sync.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassUrl } from "../store/visualization_classes/visualization_classes_selectors.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import {
    type IRawBucket,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IDateDataset, type IUsedDateDatasets } from "../typings/datasets.js";
import { type IBucketItem } from "../typings/metadata.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import { DateDatasetsService } from "./date_datasets_service.js";
import { PluggableVisualizationService } from "./pluggable_visualization_service.js";
import { convertFiltersToRefPoint } from "./reference_point_service.js";

function getBucketsFromReferencePoint(state: IAppState): IRawBuckets {
    return getReferencePointBuckets(state);
}

function getUneditedFilters(state: IAppState, cacheItemIdentifier: string): string[] {
    return getUneditedFiltersInFilterBar(
        getFilterBarState(state),
        getBucketsMeta(state),
        cacheItemIdentifier,
    );
}

/** Whole-root adapter over the value-level sync. The dataset lookup is the caller's job. */
function syncDateBucketItemGranularityAndDfRef(
    bucketItem: IRawBucketItem,
    state: IAppState,
    granularityOverride?: string,
): IRawBucketItem {
    // the isDate guard is repeated here only to keep the lookup off the non-date path; the helper
    // makes the same check, because identity for a non-date item is part of ITS contract
    const dateDatasetRef: ObjRef | undefined = isDate(bucketItem) ? bucketItem?.dateDatasetRef : undefined;
    const dateDataset = dateDatasetRef
        ? DateDatasetsService.getDateDatasetByRef(state, dateDatasetRef)
        : undefined;

    return syncDateBucketItemGranularityAndDfRefInItem(bucketItem, dateDataset, granularityOverride);
}

export function removeUneditedAttributeAndDateFilters(state: IAppState, cacheItemIdentifier: string) {
    const uneditedFilters = getUneditedFilters(state, cacheItemIdentifier);
    return FilterBarService.removeFilters(state, uneditedFilters);
}

/**
 * Are these `data` leaves already holding the identical references?
 *
 * The identity short-circuit at each write below is the no-op contract, not an optimization: the
 * value-level helpers answer the ORIGINAL reference when nothing changed, so a caller that rebuilt
 * the root unconditionally would turn every no-op into a store notification — `combineReducers`
 * stops short-circuiting, and the render/undo behavior built on that goes with it.
 *
 * The PREDICATE is value-level on purpose: it takes the branch, not the root, because a
 * `(state) => state` helper here is a shape the architecture gate rejects.
 */
function dataUnchanged(data: IAppState["data"], patch: Partial<IAppState["data"]>): boolean {
    return (Object.keys(patch) as (keyof IAppState["data"])[]).every((key) => data[key] === patch[key]);
}

export function bucketsWereChanged(state: IAppState, valid = false) {
    const referencePoint = syncReferencePoint(
        getReferencePoint(state),
        getBuckets(state),
        convertFiltersToRefPoint(getFilterItems(state), getBucketsMeta(state)),
        getVisualizationPropertiesSortItems(state),
    );

    return {
        ...state,
        data: { ...state.data, referencePoint, isVisualizationMdObjectValid: valid },
    };
}

/** Resolves a catalog metric's cache identifier to its display ObjRef, out of the item cache. */
function catalogMetricRefResolver(state: IAppState): CatalogMetricRefResolver {
    return (metricIdentifier: string) => getItemCache(state)[`metric.${metricIdentifier}`]?.ref ?? null;
}

/**
 * Everything that would be removed together with `localIdentifier` — transitively. A read, so it stays
 * a whole-root entry point delegating to the one implementation (the 4.10 rule).
 */
export const getAllDependantBucketItems = (state: IAppState, localIdentifier: string): string[] =>
    getAllDependantBucketItemsInBuckets(getBuckets(state), localIdentifier);

/** The arithmetic measures that would be left without enough operands. Read, same treatment. */
export const findInvalidArithmeticMeasuresForRemoval = (
    state: IAppState,
    removedBucketItemLocalIdentifier: string,
): string[] =>
    findInvalidArithmeticMeasuresForRemovalInBuckets(getBuckets(state), removedBucketItemLocalIdentifier);

/** Resolves an attribute cache-item identifier to its display-form ObjRef, out of the item cache. */
function attributeDfRefResolver(state: IAppState): AttributeDfRefResolver {
    return (cacheItemIdentifier: string, isComputedAttribute: boolean) => {
        // the caller reads the namespace off the bucket item, so this is exact - no fallback needed
        const cacheItem =
            getItemCache(state)[getCacheKeyForAttributeItem(cacheItemIdentifier, isComputedAttribute)];
        return cacheItem ? (cacheItem.dfRef ?? null) : null;
    };
}

/** Resolves a removed bucket item's local identifier to the ObjRef a dimensionality entry keeps. */
function bucketItemRefResolver(state: IAppState): BucketItemRefResolver {
    return (localIdentifier: string) =>
        getBucketItemDimensionalityRef(findBucketItemByLocalIdentifier(state, localIdentifier), {
            dateDatasetByRef: dateDatasetByRefResolver(state),
            attributeDfRefByIdentifier: attributeDfRefResolver(state),
        });
}

/**
 * The five domain values the removal calculation reads, and the four foreign facts it needs — the
 * whole-root half of the adapter. The operation itself is
 * `store/buckets/buckets_removal_helpers.ts`.
 */
function readRemovalInput(state: IAppState): IRemoveBucketItemsInput {
    return {
        buckets: getBuckets(state),
        bucketsMeta: getBucketsMeta(state),
        filterBar: getFilterBarState(state),
        bucketNotifications: state.data.bucketNotifications,
        extendedReferencePoint: getExtendedReferencePoint(state),
    };
}

function buildRemovalDeps(state: IAppState): IRemoveBucketItemsDeps {
    return {
        catalogMetricRef: catalogMetricRefResolver(state),
        bucketItemRef: bucketItemRefResolver(state),
        improvedRankingFilter: enableImprovedRankingFilter(state),
        reorderByMeasures: enableNewPivotTable(state),
    };
}

/**
 * Writes the ERP back only when the operation actually produced a new value. The helpers speak
 * `undefined` for "absent" while the store holds `null` at rest, so an unconditional write-back
 * of an unchanged read would dirty the state with a shape change that means the same thing —
 * and a genuine CLEAR is normalized to `null` on the way in, so the written shape always matches
 * the store's at-rest shape.
 */
function writeExtendedReferencePoint(
    state: IAppState,
    extendedReferencePoint: ReturnType<typeof getExtendedReferencePoint>,
): IAppState {
    return extendedReferencePoint === getExtendedReferencePoint(state)
        ? state
        : {
              ...state,
              data: { ...state.data, extendedReferencePoint: extendedReferencePoint ?? null },
          };
}

/**
 * Writes the five domain values back. Each write is unconditional and that is safe BECAUSE the helpers
 * preserve identity: `setIn` short-circuits on an unchanged value, so a removal that changed
 * only the buckets does not touch the other four subtrees. The filter bar is written raw rather than
 * through `setFilterBarState` — the value already went through the ranking-filters-last normalization
 * inside `removeFilters`, and normalizing twice would rebuild `items` for nothing.
 */
function writeRemovalResult(state: IAppState, result: IRemoveBucketItemsResult): IAppState {
    const newState: IAppState = {
        ...state,
        data: {
            ...state.data,
            buckets: result.buckets,
            bucketsMeta: result.bucketsMeta,
            filterBar: result.filterBar,
            bucketNotifications: result.bucketNotifications,
        },
    };

    return writeExtendedReferencePoint(newState, result.extendedReferencePoint);
}

export function removeMultipleBucketItemsWithDependencies(
    state: IAppState,
    localIdentifiers: ReadonlyArray<string>,
    notifyOnlyAboutRemovedDependencies = false,
): IAppState {
    const result = removeBucketItemsWithDependenciesInValues(
        readRemovalInput(state),
        { localIdentifiers, notifyOnlyAboutRemovedDependencies },
        buildRemovalDeps(state),
    );

    // the tail stays here: the calculation decides the five domains, the reference-point sync and the
    // md-object flag belong to the OPERATION and travel in its event
    return bucketsWereChanged(writeRemovalResult(state, result));
}

export function getBucketLocalIdentifier(state: IAppState, item: IRawBucketItem): string {
    return getBucketLocalIdentifierInBuckets(getBuckets(state), item);
}

export function replaceBucketItemWithCatalogItem(
    state: IAppState,
    bucketItem: IRawBucketItem,
    catalogItem: ICatalogEntry,
): IAppState {
    const { bucket } = getBucketItemIndex(state, bucketItem.localIdentifier);

    if (!bucket) {
        return state;
    }

    const bucketLocalIdentifier = bucket.localIdentifier;
    const dateDatasetRef = getPrimaryDateDatasetRef(state);
    const bucketAcceptsMeasures = getBucketAcceptsItemType(bucketLocalIdentifier, METRIC, state);
    const bucketTransformsAttributeToMeasure = getBucketTransformsAttributeItemToMeasure(
        bucketLocalIdentifier,
        state,
    );
    const shouldTransformAttributeToMeasure = bucketAcceptsMeasures && bucketTransformsAttributeToMeasure;

    let newBucketItem = buildBucketItemFromCatalogItem(
        catalogItem,
        shouldTransformAttributeToMeasure,
        dateDatasetRef,
    );

    // Sync granularity and dfRef for date bucket items
    newBucketItem = syncDateBucketItemGranularityAndDfRef(newBucketItem, state);

    const newInsertionIndex = findReplacedBucketItemNewInsertionIndex(bucketItem, bucket, bucket);

    const bucketIndex = getBucketIndex(state, bucketLocalIdentifier);
    let newState: IAppState = {
        ...state,
        data: {
            ...state.data,
            buckets: state.data.buckets.map((candidate, index) =>
                index === bucketIndex
                    ? {
                          ...candidate,
                          items: insertBucketItem(bucket.items, newInsertionIndex, newBucketItem),
                      }
                    : candidate,
            ),
        },
    };

    newState = removeMultipleBucketItemsWithDependencies(newState, [bucketItem.localIdentifier], true);

    if (isCategoriesOrStacks(bucketLocalIdentifier)) {
        newState = removeUneditedAttributeAndDateFilters(newState, bucketItem.attribute);
    }

    newState = bucketsWereChanged(newState);
    return newState;
}

/**
 * Whole-root adapter over the over-time-comparison operation
 * (`store/buckets/over_time_comparison_helpers.ts`).
 *
 * It reads three domain values more than the removal adapter does — the derived-measure queue, the
 * reference point and the md-object validity flag — because two of the operation's four branches run
 * the removal chain and then keep going, so the reference-point sync happens INSIDE the operation
 * rather than after it. The operation's doc comment has the full argument; the short version is that
 * moving that sync to the end would change which buckets value the reference point holds.
 */
export function setBucketItemOverTimeComparison(
    state: IAppState,
    measure: IRawBucketItem,
    isEnabled: boolean,
    targetType: OverTimeComparisonType,
): IAppState {
    const result = setBucketItemOverTimeComparisonInValues(
        {
            ...readRemovalInput(state),
            pluggableVisualization: PluggableVisualizationService.getQueueState(state),
            referencePoint: getReferencePoint(state),
            isVisualizationMdObjectValid: state.data.isVisualizationMdObjectValid,
        },
        { measure, isEnabled, targetType },
        {
            ...buildRemovalDeps(state),
            refPointFilters: (filterBar, bucketsMeta) =>
                convertFiltersToRefPoint(filterBar.items, bucketsMeta),
            sortItems: getVisualizationPropertiesSortItems(state),
        },
    );

    let newState = writeRemovalResult(state, result);
    newState = PluggableVisualizationService.setQueueState(newState, result.pluggableVisualization);
    return {
        ...newState,
        data: {
            ...newState.data,
            referencePoint: result.referencePoint,
            isVisualizationMdObjectValid: result.isVisualizationMdObjectValid,
        },
    };
}

export function sanitizeTotals(previousState: IAppState, currentState: IAppState): IAppState {
    const patch = {
        buckets: sanitizeTotalsInBuckets(getBuckets(previousState), getBuckets(currentState), {
            // a visualization-specific feature flag is legitimate here: totals is only used in the
            // pivot table. It arrives NAMED at the helper instead of being read inside it
            reorderByMeasures: enableNewPivotTable(currentState),
        }),
    };

    return dataUnchanged(currentState.data, patch)
        ? currentState
        : { ...currentState, data: { ...currentState.data, ...patch } };
}

/** Resolves a measure's catalog item type for the format helpers; undefined = no catalog item. */
function catalogItemTypeResolver(state: IAppState): CatalogItemTypeResolver {
    return (measureIdentifier: string) => getCatalogItemById(measureIdentifier)(state)?.type;
}

export function sanitizeFormats(
    previousExtendedReferencePoint: IPreviousMeasureFormats,
    extendedReferencePoint: IExtendedReferencePoint,
    state: IAppState,
): IExtendedReferencePoint {
    return sanitizeReferencePointFormats(
        previousExtendedReferencePoint,
        extendedReferencePoint,
        catalogItemTypeResolver(state),
    );
}

export function mirrorTotalsToDerivedMeasures(
    state: IAppState,
    derivedMeasureAddedToItem: IRawBucketItem,
): IAppState {
    const patch = {
        buckets: mirrorTotalsToDerivedMeasuresInBuckets(getBuckets(state), derivedMeasureAddedToItem),
    };

    return dataUnchanged(state.data, patch) ? state : { ...state, data: { ...state.data, ...patch } };
}

export function validateVisualizationProperties(state: IAppState): IAppState {
    return writeExtendedReferencePoint(
        state,
        validateVisualizationPropertiesInErp(getExtendedReferencePoint(state), getBuckets(state)),
    );
}

export function getBucketItemIndex(state: IAppState, localIdentifier: string) {
    return getBucketItemIndexInBuckets(getBuckets(state), localIdentifier);
}

export function getBucketIndex(state: IAppState, bucketLocalIdentifier: string) {
    return getBucketIndexInBuckets(state.data.buckets, bucketLocalIdentifier);
}

export function findDerivedBucketItems(state: IAppState, masterBucketItem: IRawBucketItem): IRawBucketItems {
    return findDerivedBucketItemsInBuckets(getBuckets(state), masterBucketItem);
}

export function getDerivedBucketItems(state: IAppState): IRawBucketItems {
    return getDerivedBucketItemsInBuckets(getBuckets(state));
}

export function getMasterMeasures(state: IAppState): IRawBucketItems {
    return getMasterMeasuresInBuckets(getBuckets(state));
}

export function removeDerivedBucketItems(state: IAppState, item: IRawBucketItem) {
    return removeMultipleBucketItemsWithDependencies(
        state,
        [...(findDerivedBucketItems(state, item) ?? [])].map((item) => item.localIdentifier),
    );
}

export function removeAllDerivedBucketItems(state: IAppState): IAppState {
    return removeMultipleBucketItemsWithDependencies(
        state,
        [...(getDerivedBucketItems(state) ?? [])].map((item) => item.localIdentifier),
    );
}

/** The whole-root-facing name of the value-level rule in `store/buckets/helpers/bucket_layout.ts`. */
export function findReplacedBucketItemNewInsertionIndex(
    replacedItem: IRawBucketItem,
    bucketBeforeRemoval: IRawBucket,
    bucketAfterRemoval: IRawBucket,
): number {
    return findReplacedBucketItemInsertionIndex(replacedItem, bucketBeforeRemoval, bucketAfterRemoval);
}

/**
 * Whole-root adapter over the derived-measure swap. `insertReplacementDerivedMeasure` answers the SAME
 * buckets when the item being replaced is in no bucket, and the removal chain has to be skipped in
 * that case too, not just the insertion.
 */
export function replaceDerivedMeasure(
    state: IAppState,
    derivedItem: IRawBucketItem,
    newDerivedItem: IRawBucketItem,
): IAppState {
    const buckets = getBuckets(state);
    const bucketsWithReplacement = insertReplacementDerivedMeasure(buckets, derivedItem, newDerivedItem);

    if (bucketsWithReplacement === buckets) {
        return state;
    }

    return removeMultipleBucketItemsWithDependencies(
        { ...state, data: { ...state.data, buckets: bucketsWithReplacement } },
        [derivedItem.localIdentifier],
        true,
    );
}

export function replaceDerivedTotalItems(
    state: IAppState,
    oldDerivedItem: IRawBucketItem,
    newDerivedItem: IRawBucketItem,
): IAppState {
    const patch = {
        buckets: replaceDerivedTotalItemsInBuckets(getBuckets(state), oldDerivedItem, newDerivedItem),
    };

    return dataUnchanged(state.data, patch) ? state : { ...state, data: { ...state.data, ...patch } };
}

/**
 * The whole-root-facing name of the derived-measure factory, which lives in
 * `store/buckets/derived_measure_helpers.ts` because it never takes the root state.
 */
export function createDerivedMeasure(
    masterBucketItem: IRawBucketItem,
    overTimeComparisonType: OverTimeComparisonType,
): IRawBucketItem {
    return createDerivedMeasureFromMaster(masterBucketItem, overTimeComparisonType);
}

export function isExportConfigSupported(state: IAppState): boolean {
    return isUiConfigExportConfigSupported(state);
}

export function isNoMetricConfigSupported(state: IAppState): boolean {
    return isUiConfigNoMetricSupported(state);
}

export function isOptionalStackingSupported(state: IAppState): boolean {
    return isUiConfigOptionalStackingSupported(state);
}

export function getSupportedOverTimeComparisonTypes(state: IAppState): OverTimeComparisonType[] {
    return getUiConfigSupportedOverTimeComparisonTypes(state, []);
}

function hasMasterMeasureInBucketItems(derivedMeasure: IRawBucketItem, bucketItems: IRawBucketItems) {
    return bucketItems.some((masterMeasure) => isDerivedFrom(derivedMeasure, masterMeasure));
}

export function getCompatibleDerivedMeasures(state: IAppState): IRawBucketItems {
    const bucketMeasures = getMeasuresInBuckets(getBuckets(state));
    const referencePointMeasures = getMeasuresInBuckets(getBucketsFromReferencePoint(state));

    return referencePointMeasures.filter(
        (derivedMeasure: IRawBucketItem) =>
            isDerived(derivedMeasure) && hasMasterMeasureInBucketItems(derivedMeasure, bucketMeasures),
    ) as IRawBucketItems;
}

export function getSelectedOverTimeComparisonType(state: IAppState): OverTimeComparisonType {
    const supportedTypes = getSupportedOverTimeComparisonTypes(state);
    const derivedMeasure = getCompatibleDerivedMeasures(state)?.[0];
    const comparisonType = derivedMeasure?.overTimeComparisonType as OverTimeComparisonType | undefined;

    if (comparisonType && supportedTypes.includes(comparisonType)) {
        return comparisonType;
    }

    return OverTimeComparisonTypes.NOTHING;
}

export function isSelectedViewByDateOfWeekGranularity(state: IAppState): boolean {
    return isSelectedViewByDateOfWeekGranularityInBuckets(getBuckets(state));
}

export const getBucketsMeta = (state: IAppState): IBucketsMetaState => state.data.bucketsMeta;

export function getAttributes(state: IAppState): IRawBucketItems {
    return getAttributesInBuckets(getBuckets(state));
}

export function getAttributeBucketItemsByRef(state: IAppState, ref: ObjRef): IBucketItem[] {
    return getAttributeBucketItemsByRefInBuckets(getBuckets(state), ref);
}

export function getMeasures(state: IAppState): IRawBucketItems {
    return getMeasuresInBuckets(getBuckets(state));
}

export function getPrimaryMeasuresFromMeasureBucket(state: IAppState): IRawBucketItems {
    return getPrimaryMeasuresFromMeasureBucketInBuckets(getBuckets(state));
}

export function getBucketByLocalIdentifier(state: IAppState, localIdentifier: string): IRawBucket {
    return getBucketByLocalIdentifierInBuckets(getBuckets(state), localIdentifier);
}

// The domain's ONE input accessor is store/buckets/buckets_selectors.ts; this wrapper delegates to
// it for its many importers.
export function getBuckets(state: IAppState): IRawBuckets {
    return getBucketsState(state);
}

// getInsightLayers / getInsightLayersOwner moved to store/insight/insight_selectors.ts in

export function getBucketIdentifierByItemId(state: IAppState, itemIdentifier: string): string {
    return getBucketIdentifierByItemIdInBuckets(getBuckets(state), itemIdentifier);
}

export function getBucketAcceptsItemType(bucketLocalIdentifier: string, itemType: string, state: IAppState) {
    const uiConfig = getReferencePointExtendedBucketsUiConfig(state);
    // `?? []` for the same reason as in swapBucketItem: an externally reported
    // `accepts: undefined` is PRESENT, so notSetValue would not fire and `.includes` would throw
    const acceptedItemTypes = uiConfig?.[bucketLocalIdentifier]?.accepts ?? [];
    return acceptedItemTypes.includes(itemType);
}

export function getBucketTransformsAttributeItemToMeasure(bucketLocalIdentifier: string, state: IAppState) {
    const uiConfig = getReferencePointExtendedBucketsUiConfig(state);
    return uiConfig?.[bucketLocalIdentifier]?.transformAttributeToMeasure ?? true;
}

export function isRenamingBucketItem(state: IAppState): boolean {
    return state.appState.renamingBucketItem || false;
}

export function isSomeDateInBuckets(state: IAppState) {
    return (
        containsMetricWithDateFilter(getMeasures(state)) ||
        bucketsHaveCategoriesWithDateItem(state) ||
        hasDateFilterInFilterBar(state)
    );
}

export function bucketsHaveCategoriesWithDateItem(state: IAppState) {
    return containsDateBucketItem(getAttributes(state));
}

export function hasDateFilterInFilterBar(state: IAppState) {
    const filters = getFilterItems(state);
    return filters.some(FilterBar.isDateFilter);
}

export function bucketsHaveMetricsWithDateFilter(state: IAppState) {
    return containsMetricWithDateFilter(getMeasures(state));
}

export const isDerivedMeasurePresent = (state: IAppState): boolean =>
    isDerivedMeasurePresentInBuckets(getBuckets(state));

export function getFirstMasterMeasure(state: IAppState): IRawBucketItem | null {
    return getFirstMasterMeasureInBuckets(getBuckets(state));
}

export function createArithmeticMeasure(format: string = null): IRawBucketItem {
    return {
        ...bucketItemBase,
        type: METRIC,
        localIdentifier: generateBucketItemIdentifier(),
        filters: [],
        operandLocalIdentifiers: [null, null],
        operator: ArithmeticOperatorType.RATIO,
        format,
    };
}

export function findBucketItemByLocalIdentifier(state: IAppState, localIdentifier: string): IRawBucketItem {
    return findBucketItemInBuckets(getBuckets(state), localIdentifier);
}

export function getVisualizationType(state: IAppState) {
    return getVisualizationClassUrl(state);
}

export function isAllMeasuresShowOnPrimaryAxis(state: IAppState) {
    const { AXIS } = Axis;
    const axis = getUiConfigAxis(state, AXIS.PRIMARY);
    return axis === AXIS.PRIMARY;
}

export function findAllReferencingArithmeticMeasures(
    state: IAppState,
    operandBucketItem: IRawBucketItem,
): IRawBucketItems {
    return findAllReferencingArithmeticMeasuresInBuckets(getBuckets(state), operandBucketItem);
}

export function isBucketAllowShowOnSecondaryAxis(state: IAppState, localIdentifier: string): boolean {
    return getUiConfigBucketFlag(state, localIdentifier, "allowShowOnSecondaryAxis", false);
}

export function isBucketEnabledSecondaryAxis(state: IAppState, localIdentifier: string): boolean {
    const isDualAxisEnabled = getVisualizationPropertiesControl(state, "dualAxis", true);
    return isBucketAllowShowOnSecondaryAxis(state, localIdentifier) && isDualAxisEnabled;
}

export function getMeasureVisualizationTypeName(state: IAppState) {
    const type = (getVisualizationType(state) || "").split(":")[1] || "";

    return type.replace(COMBO2, COMBO);
}

export function addTotalsEnabledForAllMeasuresToNewMeasure(
    newMeasure: IRawBucketItem,
    state: IAppState,
): IAppState {
    return {
        ...state,
        data: {
            ...state.data,
            buckets: addTotalsEnabledForAllMeasuresToNewMeasureInBuckets(getBuckets(state), newMeasure),
        },
    };
}

/**
 * Syncs granularity and dfRef for a date bucket item based on its dateDatasetRef.
 * If granularity is provided, uses it; otherwise uses default (first available).
 * Always updates dfRef to match the resolved granularity attribute.
 *
 * @param bucketItem - The date bucket item to sync
 * @param state - Application state for accessing date datasets
 * @param granularityOverride - Optional granularity to use instead of default
 * @returns Updated bucket item with synced granularity and dfRef, or original item if not a date item
 */
/** Resolves a date dataset by ObjRef out of the store — the lazy resolver the date helpers take. */
function dateDatasetByRefResolver(state: IAppState): DateDatasetByRefResolver {
    return (ref: ObjRef) => DateDatasetsService.getDateDatasetByRef(state, ref);
}

export function setBucketItemsDateDataset(
    state: IAppState,
    ref: ObjRef,
    bucketItemLocalIdentifier?: string,
    bucketLocalIdentifier?: string,
): IAppState {
    return {
        ...state,
        data: {
            ...state.data,
            buckets: setBucketItemsDateDatasetInBuckets(
                getBuckets(state),
                ref,
                { bucketItemLocalIdentifier, bucketLocalIdentifier },
                dateDatasetByRefResolver(state),
            ),
        },
    };
}

export function getPrimaryDateDataset(state: IAppState): IDateDataset {
    const dateDatasetRef = getPrimaryDateDatasetRef(state);
    if (dateDatasetRef) {
        return DateDatasetsService.getDateDatasetByRef(state, dateDatasetRef);
    }

    return undefined;
}

export function getPrimaryDateDatasetRef(state: IAppState): ObjRef {
    return getPrimaryDateDatasetRefInBuckets(
        getBuckets(state),
        getFilterItems(state),
        getFirstAvailableDateDataset(state),
    );
}

/**
 * Returns all dateDatasets used in date bucket items and date filter
 * @param state -
 */
export function getUsedDateDatasets(state: IAppState): IUsedDateDatasets {
    const dateDatasetRefs = getUsedDateDatasetRefsInBuckets(getBuckets(state), getFilterItems(state));
    return buildUsedDateDatasets(dateDatasetRefs, state);
}

/**
 * Returns all dateDatasets used in date bucket items and date filter in extended ref. point
 * @param buckets -
 * @param extendedBuckets -
 * @param filterItemsExtended -
 * @param availableDateDatasets -
 * @param datasetsMeta -
 */
export function getUsedDateDatasetsExtendedFromBuckets(
    buckets: IRawBuckets,
    // `undefined` (no plug-viz answer yet) is what selects the regular buckets below, so the
    // parameter is deliberately optional
    extendedBuckets: IRawBuckets | IExtendedRefPointBuckets | undefined,
    filterItemsExtended: ReadonlyArray<IFilter>,
    availableDateDatasets: IDateDataset[],
    datasetsMeta: IDateDatasetsMeta,
): IUsedDateDatasets {
    const finalBuckets = (extendedBuckets || buckets) as IRawBuckets;
    const dateDatasetRefs = getUsedDateDatasetRefsInBuckets(finalBuckets, filterItemsExtended);

    return buildUsedDateDatasetsFromItems(dateDatasetRefs, availableDateDatasets, datasetsMeta);
}

function buildUsedDateDatasets(usedDateDatasetRefs: ObjRef[], state: IAppState): IUsedDateDatasets {
    return {
        used: usedDateDatasetRefs
            .map((dateDatasetRef: ObjRef) => DateDatasetsService.getDateDatasetByRef(state, dateDatasetRef))
            .filter(Boolean),
    };
}

function buildUsedDateDatasetsFromItems(
    usedDateDatasetRefs: ObjRef[],
    items: IDateDataset[],
    dateDatasetsMeta: IDateDatasetsMeta,
): IUsedDateDatasets {
    return {
        used: usedDateDatasetRefs
            .map((dateDatasetRef: ObjRef) =>
                DateDatasetsService.getDateDatasetByRefFromItems(items, dateDatasetRef, dateDatasetsMeta),
            )
            .filter(Boolean),
    };
}

export function hasBucketDateItem(state: IAppState): boolean {
    return hasDateBucketItemInBuckets(getBuckets(state));
}
