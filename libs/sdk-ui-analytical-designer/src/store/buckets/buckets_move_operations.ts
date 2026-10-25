// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { removeFilters } from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";

import {
    getBucketIndexInBuckets,
    getBucketItemIndexInBuckets,
    insertBucketItem,
    resolveBucketIndexInBuckets,
    updateBucketItemsAt,
} from "./bucket_item_address.js";
import { type IAddBucketItemDeps, buildAddedBucketItem } from "./buckets_add_operation.js";
import { isPoPAvailableInBuckets } from "./buckets_date_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import { getDerivedBucketItemsInBuckets, hasDateBucketItemInBuckets } from "./buckets_read_helpers.js";
import {
    type IRemoveBucketItemsDeps,
    type IRemoveBucketItemsInput,
    type IRemoveBucketItemsResult,
    getUneditedFilters,
    removeBucketItemsWithDependencies,
} from "./buckets_removal_helpers.js";
import { sanitizeTotals } from "./buckets_totals_helpers.js";
import { removeSingleBucketItemInBuckets, swapBucketItemInBuckets } from "./buckets_write_helpers.js";
import { isCategoriesOrStacks } from "./helpers/bucket_item_predicates.js";
import { findReplacedBucketItemInsertionIndex } from "./helpers/bucket_layout.js";

/**
 * THE FOUR DRAG-AND-DROP OPERATIONS THAT MOVE ITEMS — remove, replace, swap and reorder.
 *
 * All four are built on `removeBucketItemsWithDependencies`, which is why they share this module and
 * why {@link IRemoveBucketItemsCommit} is the base of three of the four result types: replace is
 * literally "an add and a removal", reorder is "a removal and an insertion", and the swap needs the
 * removal only for the totals sanitization that follows it. It is NOT a cluster aggregate: every field
 * is a domain THIS operation decides, and the operations that decide more say so with their own
 * interface.
 */

/**
 * The removal's five domain values PLUS the two the operation itself owns — the reference-point sync
 * and the md-object flag, which belong to the gesture rather than to the calculation.
 */
export interface IRemoveBucketItemsCommit extends IRemoveBucketItemsResult {
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

export interface IRemoveBucketItemsOperationDeps extends IRemoveBucketItemsDeps, IReferencePointSyncDeps {}

/**
 * WHICH items go, and whether the user is told about the ones they asked for.
 *
 * `notifyOnlyAboutRemovedDependencies` is set by the gestures where the user knows perfectly well what
 * they just took out — the drag-out and the replace — and cleared by the ones that remove on their
 * behalf (the explicit multi-item removal, the derived-items purge).
 */
export interface IRemoveBucketItemsOperationParams {
    localIdentifiers: ReadonlyArray<string>;
    notifyOnlyAboutRemovedDependencies: boolean;
    /**
     * Run a SECOND removal pass over every remaining derived measure when period-over-period
     * comparison is no longer available but a date item is still in the buckets. Set only by the
     * drag-OUT gesture (`DND_ITEM_REMOVE`).
     */
    purgeDerivedWhenPopUnavailable?: boolean;
}

export interface IRemoveBucketItemsOperationInput extends IRemoveBucketItemsInput {
    referencePoint: IReferencePointState | undefined;
}

/**
 * Removes bucket items with everything that depends on them, then syncs.
 *
 * THE SECOND PASS is the one subtlety. `DND_ITEM_REMOVE` runs the whole chain again for every remaining
 * derived measure when the first pass left period-over-period comparison unavailable — a derived
 * measure whose comparison basis is gone is not renderable. ONE sync over the final values covers both
 * passes (the second sync's only input from the first is `referencePoint`, and every field it reads is
 * overwritten), which is what makes the whole gesture one store write.
 */
export function removeBucketItemsOperation(
    input: IRemoveBucketItemsOperationInput,
    params: IRemoveBucketItemsOperationParams,
    deps: IRemoveBucketItemsOperationDeps,
): IRemoveBucketItemsCommit {
    const firstPass = removeBucketItemsWithDependencies(input, params, deps);

    const removal = params.purgeDerivedWhenPopUnavailable
        ? purgeDerivedMeasuresIfNeeded({ ...input, ...firstPass }, deps)
        : firstPass;

    return {
        ...removal,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            removal.buckets,
            removal.filterBar,
            removal.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/**
 * The drag-out gesture's second pass. Answers its input BY REFERENCE when the condition does not hold,
 * so the common case allocates nothing.
 */
function purgeDerivedMeasuresIfNeeded(
    input: IRemoveBucketItemsOperationInput,
    deps: IRemoveBucketItemsOperationDeps,
): IRemoveBucketItemsResult {
    if (isPoPAvailableInBuckets(input.buckets, input.filterBar.items)) {
        return input;
    }
    if (!hasDateBucketItemInBuckets(input.buckets)) {
        return input;
    }

    const derivedLocalIdentifiers = getDerivedBucketItemsInBuckets(input.buckets).map(
        (item: IRawBucketItem) => item?.localIdentifier,
    );

    return removeBucketItemsWithDependencies(
        input,
        {
            localIdentifiers: derivedLocalIdentifiers,
            // the user is told about every purged measure, not only about its dependencies
            notifyOnlyAboutRemovedDependencies: false,
        },
        deps,
    );
}

// --- replacing an item with a catalog item ---------------------------------------------------------

/**
 * Replace commits everything the removal does, plus the two domains the ADD half brings: the
 * pluggable-visualization queue and the extended reference point are already in the removal's result,
 * so what is left is the filter bar's second write — see the note on
 * {@link replaceBucketItemWithCatalogItem}.
 */
export type IReplaceBucketItemResult = IRemoveBucketItemsCommit;

export interface IReplaceBucketItemInput extends IRemoveBucketItemsInput {
    referencePoint: IReferencePointState | undefined;
}

export interface IReplaceBucketItemParams {
    /** the item being replaced — it names the bucket and the insertion slot */
    bucketItem: IRawBucketItem;
    catalogItem: ICatalogEntry;
}

export interface IReplaceBucketItemDeps
    extends
        IRemoveBucketItemsOperationDeps,
        Pick<
            IAddBucketItemDeps,
            | "primaryDateDatasetRef"
            | "dateDatasetByRef"
            | "bucketAcceptsMeasures"
            | "bucketTransformsAttributeToMeasure"
            | "bucketEnablesSecondaryAxis"
            | "supportedDisplayForms"
        > {}

/**
 * Swaps a bucket item for a catalog item IN PLACE.
 *
 * Three facts are load-bearing:
 *
 * 1. an item that is in NO bucket is a no-op, which is what `undefined` means here — no event,
 *    nothing committed;
 * 2. the new item is inserted at `findReplacedBucketItemInsertionIndex` BEFORE the old one is removed,
 *    and the index is computed with the SAME bucket on both sides, which is why the helper's two
 *    parameters look redundant at this call site;
 * 3. replacing an item in a categories/stacks bucket ALSO removes the attribute filters AD created for
 *    the old item and the user never touched — a second filter-bar write, after the removal chain's.
 *
 * `bucketEnablesSecondaryAxis` is part of the deps because {@link buildAddedBucketItem} is one
 * implementation; this gesture passes `false`.
 */
export function replaceBucketItemWithCatalogItem(
    input: IReplaceBucketItemInput,
    { bucketItem, catalogItem }: IReplaceBucketItemParams,
    deps: IReplaceBucketItemDeps,
): IReplaceBucketItemResult | undefined {
    const replacedLocalIdentifier: string = bucketItem?.localIdentifier;
    const { bucket } = getBucketItemIndexInBuckets(input.buckets, replacedLocalIdentifier);

    if (!bucket) {
        return undefined;
    }

    const bucketLocalIdentifier: string = bucket?.localIdentifier;
    const newBucketItem = buildAddedBucketItem({ catalogItem }, deps);
    const insertionIndex = findReplacedBucketItemInsertionIndex(bucketItem, bucket, bucket);

    const bucketsWithReplacement = updateBucketItemsAt(
        input.buckets,
        getBucketIndexInBuckets(input.buckets, bucketLocalIdentifier),
        () => insertBucketItem(bucket?.items, insertionIndex, newBucketItem),
    );

    const removal = removeBucketItemsWithDependencies(
        { ...input, buckets: bucketsWithReplacement },
        { localIdentifiers: [replacedLocalIdentifier], notifyOnlyAboutRemovedDependencies: true },
        deps,
    );

    const filterBar = isCategoriesOrStacks(bucketLocalIdentifier)
        ? removeUneditedAttributeAndDateFilters(removal.filterBar, removal.bucketsMeta, bucketItem?.attribute)
        : removal.filterBar;

    return {
        ...removal,
        filterBar,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            removal.buckets,
            filterBar,
            removal.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/**
 * Drops the attribute/date filters AD created for `cacheItemIdentifier` and the user never touched.
 *
 * The value-level form of `services/buckets_service.ts#removeUneditedAttributeAndDateFilters`, which
 * asked the root for both halves. The "which ones" question is `getUneditedFilters` — the SAME
 * implementation the removal chain asks (the 4.10 rule; a second copy here is how the measure-value /
 * ranking exclusion gets lost). Identity is inherited: `removeFilters` answers the same filter bar for an
 * empty identifier list.
 */
export function removeUneditedAttributeAndDateFilters(
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
    cacheItemIdentifier: string,
): IFilterBarState {
    return removeFilters(filterBar, getUneditedFilters(filterBar, bucketsMeta, cacheItemIdentifier));
}

// --- swapping two items, or moving one into another bucket ----------------------------------------

export interface ISwapBucketItemInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
}

export interface ISwapBucketItemParams {
    /** the TARGET bucket, or absent for an in-place swap */
    targetBucketLocalIdentifier: string | undefined;
    from: IRawBucketItem;
    to: IRawBucketItem;
}

export interface ISwapBucketItemDeps extends IReferencePointSyncDeps {
    /** does the bucket named FIRST accept an item of the second argument's type? (ERP uiConfig) */
    acceptsItemType: (bucketLocalIdentifier: string, itemType: string) => boolean;
    /** is the TARGET bucket showing measures on the secondary axis? (ERP uiConfig + dual-axis control) */
    secondaryAxisEnabled: boolean;
    /** does the TARGET bucket prefer its date items synchronized? (ERP uiConfig) */
    synchronizedDatesPreferred: boolean;
    /** the dataset the target bucket's date items synchronize ON */
    primaryDateDatasetRef: ObjRef | undefined;
    /** re-points the moved item's date dataset — the date rules, closed over their resolver */
    setDateDatasetForItem: (buckets: IRawBuckets, ref: ObjRef, localIdentifier: string) => IRawBuckets;
    /** `enableNewPivotTable`, for the totals re-pointing */
    reorderByMeasures: boolean;
}

export interface ISwapBucketItemResult {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

/**
 * Two gestures behind one trigger — see {@link swapBucketItemInBuckets} for the split.
 *
 * WHICH STATE EACH FACT COMES FROM IS NOT UNIFORM: the secondary-axis flag, the target bucket's items
 * and the primary date dataset are read BEFORE the move, the synchronized-dates preference after it.
 * The uiConfig cannot change in between, so the difference is not observable — and with every fact an
 * argument, the question does not arise at the operation at all.
 */
export function swapBucketItems(
    input: ISwapBucketItemInput,
    { targetBucketLocalIdentifier, from, to }: ISwapBucketItemParams,
    deps: ISwapBucketItemDeps,
): ISwapBucketItemResult {
    const swappedBuckets = swapBucketItemInBuckets(input.buckets, from, to, targetBucketLocalIdentifier, {
        acceptsItemType: deps.acceptsItemType,
        secondaryAxisEnabled: deps.secondaryAxisEnabled,
    });

    const withDatesSynchronized =
        targetBucketLocalIdentifier && deps.synchronizedDatesPreferred && deps.primaryDateDatasetRef
            ? deps.setDateDatasetForItem(swappedBuckets, deps.primaryDateDatasetRef, from?.localIdentifier)
            : swappedBuckets;

    const buckets = sanitizeTotals(input.buckets, withDatesSynchronized, {
        reorderByMeasures: deps.reorderByMeasures,
    });

    return {
        buckets,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            buckets,
            input.filterBar,
            input.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/**
 * Does the target bucket already hold a date item? Asked of the buckets BEFORE the move, and the
 * answer gates the date synchronization — so it is resolved at the saga boundary and folded into
 * `synchronizedDatesPreferred`.
 */
export function bucketHoldsDateItem(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
    isDateBucketItem: (item: IRawBucketItem) => boolean,
): boolean {
    const bucket = buckets.find(
        (candidate: IRawBucket) => candidate?.localIdentifier === bucketLocalIdentifier,
    );
    const items = (bucket?.items ?? []) as IRawBucketItem[];

    return items.some(isDateBucketItem);
}

// --- reordering inside a bucket --------------------------------------------------------------------

export interface IReorderBucketItemParams {
    /** the bucket being reordered */
    bucketLocalIdentifier: string;
    from: IRawBucketItem;
    bucketPosition: number;
}

export interface IReorderBucketItemResult {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

/**
 * Moves one item to another position inside its bucket: remove it, insert it at the new index.
 *
 * The target bucket INDEX is resolved against the buckets as they were BEFORE the removal, and the
 * insertion runs against the buckets AFTER it. It matters when the removal empties a bucket, because
 * the bucket is addressed by index.
 *
 * This operation is buckets-only: it does NOT run the removal chain, so no filters, notifications or
 * markers are touched.
 */
export function reorderBucketItem(
    input: ISwapBucketItemInput,
    { bucketLocalIdentifier, from, bucketPosition }: IReorderBucketItemParams,
    deps: IReferencePointSyncDeps & { reorderByMeasures: boolean },
): IReorderBucketItemResult {
    const bucketIndex = resolveBucketIndexInBuckets(input.buckets, bucketLocalIdentifier);
    const withoutItem = removeSingleBucketItemInBuckets(input.buckets, from?.localIdentifier);

    const reordered = updateBucketItemsAt(withoutItem, bucketIndex, (items) =>
        insertBucketItem(items, bucketPosition, from),
    );

    const buckets = sanitizeTotals(input.buckets, reordered, {
        reorderByMeasures: deps.reorderByMeasures,
    });

    return {
        buckets,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            buckets,
            input.filterBar,
            input.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}
