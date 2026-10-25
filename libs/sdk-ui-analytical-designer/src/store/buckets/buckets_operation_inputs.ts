// (C) 2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { METRIC } from "../../constants/bucket.js";
import { getCacheKeyForAttributeItem } from "../../models/item_cache_lookup.js";
import { filterSupportedDisplayForms } from "../../selectors/buckets_selector.js";
import {
    enableImprovedRankingFilter,
    enableNewPivotTable,
    isApproxCountEnabled,
} from "../../selectors/feature_flag_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { isSynchronizedDatesPreferred } from "../../selectors/ui_config_selector.js";
import {
    getBucketAcceptsItemType,
    getBucketTransformsAttributeItemToMeasure,
    getPrimaryDateDatasetRef,
    isBucketEnabledSecondaryAxis,
} from "../../services/buckets_service.js";
import { DateDatasetsService } from "../../services/date_datasets_service.js";
import { convertFiltersToRefPoint } from "../../services/reference_point_service.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";
import { getCatalogItemById } from "../catalog/catalog_selector.js";
import { convertFromExtendedRefPointFilters } from "../filter_bar/filter_bar_helpers.js";
import { getFilterBarState } from "../filter_bar/filter_bar_selector.js";
import { getVisualizationPropertiesSortItems } from "../properties/properties_selectors.js";
import { getUiConfigSupportedOverTimeComparisonTypes } from "../reference_point/extended_reference_point_selectors.js";
import {
    getExtendedReferencePoint,
    getReferencePoint,
} from "../reference_point/reference_point_selectors.js";
import { type IReferencePointSyncDeps } from "../reference_point/reference_point_sync.js";
import { type IAppState } from "../types.js";

import { type IAddBucketItemDeps, type IAddBucketItemInput } from "./buckets_add_operation.js";
import {
    type AttributeDfRefResolver,
    type DateDatasetByRefResolver,
    getBucketItemDimensionalityRef,
    setBucketItemsDateDataset,
} from "./buckets_date_helpers.js";
import {
    type AttributeDisplayFormByRefResolver,
    type IBucketItemEditDeps,
    type IBucketItemEditInput,
    type IBucketsDateDatasetChangeDeps,
    type IDualAxisToggleInput,
} from "./buckets_edit_operations.js";
import { type IFilterRemovalDeps, type IFilterRemovalInput } from "./buckets_filter_removal_operation.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    type IRemoveBucketItemsOperationDeps,
    type IRemoveBucketItemsOperationInput,
    type IReplaceBucketItemDeps,
    type ISwapBucketItemDeps,
    type ISwapBucketItemInput,
    bucketHoldsDateItem,
} from "./buckets_move_operations.js";
import { type CatalogMetricRefResolver } from "./buckets_removal_helpers.js";
import { getBucketsState } from "./buckets_selectors.js";
import { findBucketItemInBuckets } from "./buckets_write_helpers.js";
import {
    type IDerivedBucketItemsPlacedInput,
    type IExtendedReferencePointAppliedDeps,
    type IExtendedReferencePointAppliedInput,
} from "./extended_reference_point_operations.js";
import { isDateBucketItem } from "./helpers/bucket_item_predicates.js";
import { type BucketItemRefResolver } from "./helpers/filter_dependencies.js";
import { type CatalogItemTypeResolver } from "./helpers/measure_format.js";
import { type IPluggableVisualizationState } from "./pluggable_visualization_state.js";

/**
 * THE SAGA BOUNDARY of the buckets operations.
 *
 * This is the ONE module of the family that is allowed to know about the root state, and it is the whole
 * reason the operations themselves do not: everything foreign an operation needs — another domain's
 * value, a feature flag, a uiConfig answer, a catalog lookup — is resolved here and handed over as a
 * typed argument, a named boolean or a lazy resolver.
 *
 * Its callers are the operation sagas: this family's, plus the properties, arithmetic, recommendation
 * and shortcut ones that compose the buckets operations on values.
 */

// --- the resolvers ---------------------------------------------------------------------------------

/** Resolves a date dataset by ObjRef out of the store — the lazy resolver the date helpers take. */
export function dateDatasetByRefResolver(state: IAppState): DateDatasetByRefResolver {
    return (ref: ObjRef) => DateDatasetsService.getDateDatasetByRef(state, ref);
}

/** Resolves a catalog metric's cache identifier to its display ObjRef, out of the item cache. */
function catalogMetricRefResolver(state: IAppState): CatalogMetricRefResolver {
    return (metricIdentifier: string) => getItemCache(state)[`metric.${metricIdentifier}`]?.ref ?? null;
}

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
        getBucketItemDimensionalityRef(findBucketItemInBuckets(getBucketsState(state), localIdentifier), {
            dateDatasetByRef: dateDatasetByRefResolver(state),
            attributeDfRefByIdentifier: attributeDfRefResolver(state),
        });
}

/**
 * Resolves a measure's catalog item type for the format helpers; undefined = no catalog item.
 * Exported — the arithmetic-measure operator edit asks the same format question.
 */
export function catalogItemTypeResolver(state: IAppState): CatalogItemTypeResolver {
    return (measureIdentifier: string) => getCatalogItemById(measureIdentifier)(state)?.type;
}

/** Resolves one of an attribute's cached display forms by ObjRef. */
function attributeDisplayFormByRefResolver(state: IAppState): AttributeDisplayFormByRefResolver {
    return (cacheItemIdentifier: string, displayFormRef: ObjRef, isComputedAttribute: boolean) =>
        getItemCache(state)[
            getCacheKeyForAttributeItem(cacheItemIdentifier, isComputedAttribute)
        ]?.displayForms?.find((displayForm: ICacheItemDisplayForm) =>
            areObjRefsEqual(displayForm.ref, displayFormRef),
        );
}

/**
 * The SUPPORTED display forms of a catalog item, by the cache key the built item implies.
 *
 * The key convention is not symmetrical: a DATE item is cached under its bare identifier, an item
 * built from a computed attribute under `computedAttribute.<identifier>`, everything
 * else under `attribute.<identifier>`.
 */
function supportedDisplayFormsResolver(state: IAppState): IAddBucketItemDeps["supportedDisplayForms"] {
    return (catalogItemIdentifier: string, isDate: boolean, isComputedAttribute: boolean) => {
        const itemCacheId = isDate
            ? catalogItemIdentifier
            : getCacheKeyForAttributeItem(catalogItemIdentifier, isComputedAttribute);
        const displayForms = getItemCache(state)[itemCacheId]?.displayForms;

        return displayForms ? filterSupportedDisplayForms(displayForms) : undefined;
    };
}

// --- the shared reads -----------------------------------------------------------------------------

export const readBucketsMeta = (state: IAppState): IBucketsMetaState => state.data.bucketsMeta;

export const readIsVisualizationMdObjectValid = (state: IAppState): boolean =>
    state.data.isVisualizationMdObjectValid;

export const readPluggableVisualization = (state: IAppState): IPluggableVisualizationState | undefined =>
    state.data.pluggableVisualization;

/**
 * The reference-point sync's two foreign facts as VALUES — for the operations that do not rewrite the
 * filter bar or the buckets meta on their way through (every bucket-item edit).
 */
export function readReferencePointSyncValues(state: IAppState) {
    return {
        refPointFilters: convertFiltersToRefPoint(getFilterBarState(state).items, readBucketsMeta(state)),
        sortItems: getVisualizationPropertiesSortItems(state),
    };
}

/** The same two facts as RESOLVERS — for the operations built on the removal chain. */
export function buildReferencePointSyncDeps(state: IAppState): IReferencePointSyncDeps {
    return {
        refPointFilters: (filterBar, bucketsMeta) => convertFiltersToRefPoint(filterBar.items, bucketsMeta),
        sortItems: getVisualizationPropertiesSortItems(state),
    };
}

/** The removal calculation's four foreign facts. */
export function buildRemovalDeps(state: IAppState) {
    return {
        catalogMetricRef: catalogMetricRefResolver(state),
        bucketItemRef: bucketItemRefResolver(state),
        improvedRankingFilter: enableImprovedRankingFilter(state),
        reorderByMeasures: enableNewPivotTable(state),
    };
}

// --- the bucket-item edits ------------------------------------------------------------------------

export const readBucketItemEditInput = (state: IAppState): IBucketItemEditInput => ({
    buckets: getBucketsState(state),
    referencePoint: getReferencePoint(state),
});

export const buildBucketItemEditDeps = (state: IAppState): IBucketItemEditDeps => ({
    ...readReferencePointSyncValues(state),
    catalogItemType: catalogItemTypeResolver(state),
    dateDatasetByRef: dateDatasetByRefResolver(state),
    attributeDisplayFormByRef: attributeDisplayFormByRefResolver(state),
});

export const buildBucketsDateDatasetChangeDeps = (state: IAppState): IBucketsDateDatasetChangeDeps => ({
    ...readReferencePointSyncValues(state),
    dateDatasetByRef: dateDatasetByRefResolver(state),
});

export const readDualAxisToggleInput = (state: IAppState): IDualAxisToggleInput => ({
    ...readBucketItemEditInput(state),
    visualizationProperties: state.data.visualizationProperties,
});

// --- picking a visualization type -----------------------------------------------------------------

// --- adding a catalog item -------------------------------------------------------------------------

export const readAddBucketItemInput = (state: IAppState): IAddBucketItemInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    configurationPanel: state.data.configurationPanel,
    filterBar: getFilterBarState(state),
    bucketNotifications: state.data.bucketNotifications,
    extendedReferencePoint: getExtendedReferencePoint(state),
    pluggableVisualization: readPluggableVisualization(state),
    referencePoint: getReferencePoint(state),
    isVisualizationMdObjectValid: readIsVisualizationMdObjectValid(state),
});

/**
 * The add's foreign facts. The three uiConfig answers are about the TARGET bucket, so they are resolved
 * per gesture rather than handed over as a uiConfig value — which is what keeps the operation from having
 * to know that "accepts" and "transformAttributeToMeasure" live in the extended reference point.
 *
 * BOTH callers — the drag-in saga and the `addItem` adapter — take the same three answers. The replace
 * path wants a different answer and says so directly: see `bucketEnablesSecondaryAxis: false` in
 * {@link buildReplaceBucketItemDeps}.
 */
export const buildAddBucketItemDeps = (
    state: IAppState,
    bucketLocalIdentifier: string,
): IAddBucketItemDeps => ({
    ...buildRemovalDeps(state),
    ...buildReferencePointSyncDeps(state),
    primaryDateDatasetRef: getPrimaryDateDatasetRef(state),
    dateDatasetByRef: dateDatasetByRefResolver(state),
    bucketAcceptsMeasures: getBucketAcceptsItemType(bucketLocalIdentifier, METRIC, state),
    bucketTransformsAttributeToMeasure: getBucketTransformsAttributeItemToMeasure(
        bucketLocalIdentifier,
        state,
    ),
    bucketEnablesSecondaryAxis: isBucketEnabledSecondaryAxis(state, bucketLocalIdentifier),
    approxCount: isApproxCountEnabled(state),
    supportedDisplayForms: supportedDisplayFormsResolver(state),
    supportedOverTimeComparisonTypes: getUiConfigSupportedOverTimeComparisonTypes(state, []),
});

// --- removing items --------------------------------------------------------------------------------

export const readRemoveBucketItemsInput = (state: IAppState): IRemoveBucketItemsOperationInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    filterBar: getFilterBarState(state),
    bucketNotifications: state.data.bucketNotifications,
    extendedReferencePoint: getExtendedReferencePoint(state),
    referencePoint: getReferencePoint(state),
});

export const buildRemoveBucketItemsDeps = (state: IAppState): IRemoveBucketItemsOperationDeps => ({
    ...buildRemovalDeps(state),
    ...buildReferencePointSyncDeps(state),
});

// --- replacing an item -----------------------------------------------------------------------------

export const buildReplaceBucketItemDeps = (
    state: IAppState,
    bucketLocalIdentifier: string,
): IReplaceBucketItemDeps => ({
    ...buildRemoveBucketItemsDeps(state),
    primaryDateDatasetRef: getPrimaryDateDatasetRef(state),
    dateDatasetByRef: dateDatasetByRefResolver(state),
    bucketAcceptsMeasures: getBucketAcceptsItemType(bucketLocalIdentifier, METRIC, state),
    bucketTransformsAttributeToMeasure: getBucketTransformsAttributeItemToMeasure(
        bucketLocalIdentifier,
        state,
    ),
    bucketEnablesSecondaryAxis: false,
    supportedDisplayForms: supportedDisplayFormsResolver(state),
});

// --- swapping and reordering -----------------------------------------------------------------------

export const readSwapBucketItemInput = (state: IAppState): ISwapBucketItemInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    filterBar: getFilterBarState(state),
    referencePoint: getReferencePoint(state),
});

/**
 * The swap's foreign facts. `synchronizedDatesPreferred` folds together the uiConfig preference AND
 * the "does the target bucket already hold a date item" question, both asked of the PRE-move buckets:
 * they gate the same branch, and resolving them here keeps the operation from reading either.
 */
export const buildSwapBucketItemDeps = (
    state: IAppState,
    targetBucketLocalIdentifier: string | undefined,
): ISwapBucketItemDeps => {
    const buckets = getBucketsState(state);

    return {
        ...buildReferencePointSyncDeps(state),
        acceptsItemType: (bucketLocalIdentifier: string, itemType: string) =>
            getBucketAcceptsItemType(bucketLocalIdentifier, itemType, state),
        secondaryAxisEnabled: targetBucketLocalIdentifier
            ? isBucketEnabledSecondaryAxis(state, targetBucketLocalIdentifier)
            : false,
        synchronizedDatesPreferred: Boolean(
            targetBucketLocalIdentifier &&
            isSynchronizedDatesPreferred(state, targetBucketLocalIdentifier) &&
            bucketHoldsDateItem(buckets, targetBucketLocalIdentifier, (item: IRawBucketItem) =>
                isDateBucketItem(item),
            ),
        ),
        primaryDateDatasetRef: getPrimaryDateDatasetRef(state),
        setDateDatasetForItem: (currentBuckets, ref, localIdentifier) =>
            setBucketItemsDateDataset(
                currentBuckets,
                ref,
                { bucketItemLocalIdentifier: localIdentifier },
                dateDatasetByRefResolver(state),
            ),
        reorderByMeasures: enableNewPivotTable(state),
    };
};

export const buildReorderBucketItemDeps = (state: IAppState) => ({
    ...buildReferencePointSyncDeps(state),
    reorderByMeasures: enableNewPivotTable(state),
});

// --- the pluggable-visualization answer ------------------------------------------------------------

export const readExtendedReferencePointAppliedInput = (
    state: IAppState,
): IExtendedReferencePointAppliedInput => ({
    buckets: getBucketsState(state),
    filterBar: getFilterBarState(state),
    referencePoint: getReferencePoint(state),
    sortItems: getVisualizationPropertiesSortItems(state),
});

export const buildExtendedReferencePointAppliedDeps = (
    state: IAppState,
): IExtendedReferencePointAppliedDeps => ({
    convertFromExtendedRefPointFilters,
    catalogItemType: catalogItemTypeResolver(state),
    dateDatasetByRef: dateDatasetByRefResolver(state),
    reorderByMeasures: enableNewPivotTable(state),
});

export const readDerivedBucketItemsPlacedInput = (state: IAppState): IDerivedBucketItemsPlacedInput => ({
    extendedReferencePoint: getExtendedReferencePoint(state),
    pluggableVisualization: readPluggableVisualization(state),
    referencePoint: getReferencePoint(state),
});

// --- filters were removed --------------------------------------------------------------------------

/** The filter-removal reaction shares the removal chain's input and deps — it can widen into it. */
export const readFilterRemovalInput = (state: IAppState): IFilterRemovalInput =>
    readRemoveBucketItemsInput(state);

export const buildFilterRemovalDeps = (state: IAppState): IFilterRemovalDeps =>
    buildRemoveBucketItemsDeps(state);
