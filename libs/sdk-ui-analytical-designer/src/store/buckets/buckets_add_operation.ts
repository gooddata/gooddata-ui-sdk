// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { ATTRIBUTE } from "../../constants/bucket.js";
import {
    buildBucketItemFromCatalogItem,
    enableSecondaryAxis,
    hideFromKda,
    isComputedAttributeItem,
    isDate,
    isMeasure,
} from "../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type ICacheItemDisplayForm, type ICatalogEntry } from "../../typings/state_objects.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import { type IConfigurationPanelState } from "../configuration_panel/configuration_panel_state.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";

import {
    type DateDatasetByRefResolver,
    syncDateBucketItemGranularityAndDfRef,
} from "./buckets_date_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import { type IRemoveBucketItemsDeps } from "./buckets_removal_helpers.js";
import { addTotalsEnabledForAllMeasuresToNewMeasure, sanitizeTotals } from "./buckets_totals_helpers.js";
import { addBucketItemsInBuckets } from "./buckets_write_helpers.js";
import {
    areAllSelectedCompatible,
    getSelectedOverTimeComparisonTypeInBuckets,
    setBucketItemOverTimeComparison,
} from "./over_time_comparison_helpers.js";
import { type IPluggableVisualizationState } from "./pluggable_visualization_state.js";

/**
 * ADDING A CATALOG ITEM TO A BUCKET — `BUCKETS_DND_ITEM_INSERT`, the widest operation of the family.
 *
 * It looks like a one-liner and is not. Nine domain values can change, because of the branch at the
 * bottom: a MEASURE added while every reference-point measure already compares over time drags the
 * whole {@link setBucketItemOverTimeComparison} operation in behind it — and two of that operation's
 * four branches run the removal chain, which rewrites the filter bar, the notifications and the
 * extended reference point.
 *
 * FOUR ORDERING FACTS ARE LOAD-BEARING and none is visible from the signature:
 *
 * 1. every foreign fact is read from the state as it was ON ENTRY — the primary date dataset, the two
 *    uiConfig answers, the item cache's display forms, the dual-axis control;
 * 2. `areAllSelectedCompatible` asks about the REFERENCE POINT only, which this operation has not
 *    touched, so the entry value is the right one;
 * 3. the comparison TYPE, by contrast, is resolved against the buckets WITH the new item and the
 *    reference point WITHOUT it (see `getSelectedOverTimeComparisonTypeInBuckets`) — that asymmetry
 *    is why the two are separate calls;
 * 4. `sanitizeTotals` compares the ENTRY buckets with the final ones, and it runs LAST — after the
 *    over-time-comparison branch, which has already sanitized against the same `previous` value.
 */

export interface IAddBucketItemInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    configurationPanel: IConfigurationPanelState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface IAddBucketItemParams {
    /** the TARGET bucket */
    bucketLocalIdentifier: string;
    catalogItem: ICatalogEntry;
    /** negative appends; the drag-and-drop layer always names a position */
    bucketPosition: number;
}

/**
 * The foreign facts the add needs, all resolved by the saga at its boundary. The four booleans
 * are named rather than resolved inside, which is what keeps a helper from reaching for a selector.
 */
export interface IAddBucketItemDeps extends IRemoveBucketItemsDeps, IReferencePointSyncDeps {
    /** the date dataset a new date item points at, or `undefined` when the catalog has none */
    primaryDateDatasetRef: ObjRef | undefined;
    dateDatasetByRef: DateDatasetByRefResolver;
    /** the target bucket's `accepts` includes `metric` */
    bucketAcceptsMeasures: boolean;
    /** the target bucket's uiConfig `transformAttributeToMeasure` (defaults TRUE when unset) */
    bucketTransformsAttributeToMeasure: boolean;
    /** the target bucket allows the secondary axis AND the dual-axis control is on */
    bucketEnablesSecondaryAxis: boolean;
    /** `enableApproximateCount` */
    approxCount: boolean;
    /**
     * The added catalog item's SUPPORTED display forms, or `undefined` when the item cache has no
     * entry — in which case the built item keeps its own display forms.
     *
     * A resolver rather than a value because the cache KEY depends on what the built item turned out to
     * be — `<identifier>` for a date, `computedAttribute.<identifier>` for an item built from a computed
     * attribute, `attribute.<identifier>` otherwise — and only the operation knows that. The key
     * convention and the `isSupportedDisplayFormType` filter stay on the item-cache side, where they
     * belong.
     */
    supportedDisplayForms: (
        catalogItemIdentifier: string,
        isDateBucketItem: boolean,
        isComputedAttributeBucketItem: boolean,
    ) => ReadonlyArray<ICacheItemDisplayForm> | undefined;
    /** the visualization's uiConfig `supportedOverTimeComparisonTypes`, `[]` when it has none */
    supportedOverTimeComparisonTypes: OverTimeComparisonType[];
}

export interface IAddBucketItemResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    configurationPanel: IConfigurationPanelState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

/** Builds the item the drop produces, before anything is written. */
export function buildAddedBucketItem(
    { catalogItem }: Pick<IAddBucketItemParams, "catalogItem">,
    deps: Pick<
        IAddBucketItemDeps,
        | "primaryDateDatasetRef"
        | "dateDatasetByRef"
        | "bucketAcceptsMeasures"
        | "bucketTransformsAttributeToMeasure"
        | "bucketEnablesSecondaryAxis"
        | "supportedDisplayForms"
    >,
): IRawBucketItem {
    const { hiddenFromKda = false } = catalogItem;
    const shouldTransformAttributeToMeasure =
        deps.bucketAcceptsMeasures && deps.bucketTransformsAttributeToMeasure;

    let bucketItem = buildBucketItemFromCatalogItem(
        catalogItem,
        shouldTransformAttributeToMeasure,
        deps.primaryDateDatasetRef,
    );

    const displayForms = deps.supportedDisplayForms(
        catalogItem.identifier,
        isDate(bucketItem),
        isComputedAttributeItem(bucketItem),
    );
    if (displayForms && bucketItem.displayForms !== displayForms) {
        bucketItem = { ...bucketItem, displayForms };
    }

    // a date item added with a dateDatasetRef but no granularity yet gets both resolved here
    const dateDatasetRef: ObjRef | undefined = bucketItem?.dateDatasetRef;
    bucketItem = syncDateBucketItemGranularityAndDfRef(
        bucketItem,
        dateDatasetRef ? deps.dateDatasetByRef(dateDatasetRef) : undefined,
    );

    if (deps.bucketEnablesSecondaryAxis) {
        bucketItem = enableSecondaryAxis(bucketItem, true);
    }
    if (hiddenFromKda) {
        bucketItem = hideFromKda(bucketItem, true);
    }

    return bucketItem;
}

/**
 * The expansion markers a drop sets: a date-dataset attribute expands the ATTRIBUTE slot, and an
 * attribute dropped into a measure bucket with approximate count enabled expands the MEASURE slot (that
 * is where the aggregation picker lives).
 */
function bucketsMetaAfterAdd(
    bucketsMeta: IBucketsMetaState,
    bucketItem: IRawBucketItem,
    catalogItem: ICatalogEntry,
    deps: Pick<IAddBucketItemDeps, "bucketAcceptsMeasures" | "approxCount">,
): IBucketsMetaState {
    let updated = bucketsMeta;
    const localIdentifier: string = bucketItem?.localIdentifier;

    if (catalogItem.identifier === DATE_DATASET_ATTRIBUTE && updated.attributeExpanded !== localIdentifier) {
        updated = { ...updated, attributeExpanded: localIdentifier };
    }

    if (
        deps.bucketAcceptsMeasures &&
        deps.approxCount &&
        catalogItem?.type === ATTRIBUTE &&
        updated.measureExpanded !== localIdentifier
    ) {
        updated = { ...updated, measureExpanded: localIdentifier };
    }

    return updated;
}

/**
 * Drops the `collapsedByDragging` marker outright rather than setting it to `false`: the flag is
 * deliberately UNSEEDED on the configuration panel state, and both readers coerce with `|| false`, so
 * absent is what "no drag collapsed this" looks like there.
 */
function withoutCollapsedByDragging(configurationPanel: IConfigurationPanelState): IConfigurationPanelState {
    const { collapsedByDragging: _dropped, ...rest } = configurationPanel;
    return rest;
}

export function addBucketItemFromCatalog(
    input: IAddBucketItemInput,
    params: IAddBucketItemParams,
    deps: IAddBucketItemDeps,
): IAddBucketItemResult {
    const bucketItem = buildAddedBucketItem(params, deps);

    const bucketsWithItem = addBucketItemsInBuckets(
        input.buckets,
        params.bucketLocalIdentifier,
        [bucketItem],
        params.bucketPosition,
    );

    // the panel pops back open once the drop it was collapsed for has landed. The marker is only
    // dropped when it is actually set, so a drop that did not collapse anything touches nothing
    const configurationPanel = input.configurationPanel?.collapsedByDragging
        ? withoutCollapsedByDragging(input.configurationPanel)
        : input.configurationPanel;

    const bucketsMeta = bucketsMetaAfterAdd(input.bucketsMeta, bucketItem, params.catalogItem, deps);

    // the over-time-comparison branch, over the values as they stand HALF WAY through — see fact 2/3
    const afterComparison = isMeasure(bucketItem)
        ? applyOverTimeComparisonForAddedMeasure(
              { ...input, buckets: bucketsWithItem, bucketsMeta },
              bucketItem,
              deps,
          )
        : undefined;

    const base = afterComparison ?? { ...input, buckets: bucketsWithItem, bucketsMeta };

    // a new measure inherits "totals enabled for all measures" from the bucket it landed in
    const bucketsWithTotals = isMeasure(bucketItem)
        ? addTotalsEnabledForAllMeasuresToNewMeasure(base.buckets, bucketItem)
        : base.buckets;

    const buckets = sanitizeTotals(input.buckets, bucketsWithTotals, {
        reorderByMeasures: deps.reorderByMeasures,
    });

    return {
        buckets,
        bucketsMeta: base.bucketsMeta,
        configurationPanel,
        filterBar: base.filterBar,
        bucketNotifications: base.bucketNotifications,
        extendedReferencePoint: base.extendedReferencePoint,
        pluggableVisualization: base.pluggableVisualization,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            buckets,
            base.filterBar,
            base.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/**
 * Runs the over-time-comparison operation for a measure that has just been added — but only when EVERY
 * compatible measure of the reference point is already comparing over time, i.e. the new measure
 * should join them.
 *
 * Answers `undefined` when the condition does not hold, so the caller can keep its own values by
 * reference instead of routing them through a no-op transaction.
 */
function applyOverTimeComparisonForAddedMeasure(
    input: IAddBucketItemInput,
    bucketItem: IRawBucketItem,
    deps: IAddBucketItemDeps,
): (IAddBucketItemInput & { extendedReferencePoint: IExtendedReferencePointState }) | undefined {
    const refPointBuckets = input.referencePoint?.buckets ?? [];
    const refPointMeasures = refPointBuckets.flatMap((bucket) => bucket.items ?? []).filter(isMeasure);

    if (!areAllSelectedCompatible(refPointBuckets, refPointMeasures)) {
        return undefined;
    }

    const targetType = getSelectedOverTimeComparisonTypeInBuckets(
        input.buckets,
        refPointBuckets,
        deps.supportedOverTimeComparisonTypes,
    );

    const result = setBucketItemOverTimeComparison(
        input,
        { measure: bucketItem, isEnabled: true, targetType },
        deps,
    );

    return { ...input, ...result };
}
