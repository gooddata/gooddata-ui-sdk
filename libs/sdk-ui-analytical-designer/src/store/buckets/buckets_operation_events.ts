// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IAddBucketItemResult } from "./buckets_add_operation.js";
import {
    type IBucketItemEditResult,
    type IBucketsDateDatasetChangeResult,
    type IDualAxisToggleResult,
    type IVisualizationTypeSelectionResult,
} from "./buckets_edit_operations.js";
import { type IFilterRemovalResult } from "./buckets_filter_removal_operation.js";
import {
    type IRemoveBucketItemsCommit,
    type IReorderBucketItemResult,
    type IReplaceBucketItemResult,
    type ISwapBucketItemResult,
} from "./buckets_move_operations.js";
import {
    type IDerivedBucketItemsPlacedResult,
    type IExtendedReferencePointAppliedResult,
} from "./extended_reference_point_operations.js";

/**
 * THE SEMANTIC EVENTS OF THE BUCKETS FAMILY.
 *
 * Every buckets trigger resolves to one of the operations below. Each operation is a pure value-level
 * calculation (`buckets_*_operation*.ts`), each is driven by ONE saga handler
 * (`buckets_operations_saga.ts`) and each commits its result with ONE of these events — which the
 * owning slices and leaves consume as ordinary cases.
 *
 * THREE PROPERTIES ARE THE POINT, and all three are structural rather than asserted:
 *
 * 1. **One gesture is one store write.** The trigger writes nothing at all, so there is no
 *    intermediate state a subscriber can observe, `observeStore` fires at most once, and undo needs
 *    no batching.
 * 2. **The payload is the operation's RESULT — different per operation, and that is deliberate.**
 *    `visualizationTypeSelected` carries three values, `bucketItemAdded` nine. A universal payload, a
 *    presence map or a change set would erase exactly the information these types carry.
 * 3. **`isVisualizationMdObjectValid` is named separately wherever it is produced.** It is an OUTPUT
 *    of the mutating gesture, not reference-point state.
 *
 * Values are carried UNCONDITIONALLY and the helpers answer the ORIGINAL reference when nothing
 * changed, so an unchanged value reaching a slice case returns the same state and `combineBranch`
 * short-circuits on identity. That is why there is no diff: the returned values already carry the
 * information.
 *
 * The type strings live in a namespace of their own rather than in `ActionTypeKeys`: no external
 * consumer matches on them, and keeping them out is what makes "which strings are frozen behavior"
 * answerable. They are deliberately NOT undoable — time travel keys on the TRIGGER, which reaches
 * the store first (see store/_infra/time_travel.ts).
 */
export enum BucketsOperationActionTypeKeys {
    STORE_BUCKET_ITEM_ADDED = "STORE/BUCKETS/BUCKET_ITEM_ADDED",
    STORE_BUCKET_ITEMS_REMOVED = "STORE/BUCKETS/BUCKET_ITEMS_REMOVED",
    STORE_BUCKET_ITEM_REPLACED = "STORE/BUCKETS/BUCKET_ITEM_REPLACED",
    STORE_BUCKET_ITEMS_SWAPPED = "STORE/BUCKETS/BUCKET_ITEMS_SWAPPED",
    STORE_BUCKET_ITEM_REORDERED = "STORE/BUCKETS/BUCKET_ITEM_REORDERED",
    STORE_BUCKET_ITEM_EDITED = "STORE/BUCKETS/BUCKET_ITEM_EDITED",
    STORE_DUAL_AXIS_TOGGLED = "STORE/BUCKETS/DUAL_AXIS_TOGGLED",
    STORE_BUCKETS_DATE_DATASET_CHANGED = "STORE/BUCKETS/DATE_DATASET_CHANGED",
    STORE_VISUALIZATION_TYPE_SELECTED = "STORE/BUCKETS/VISUALIZATION_TYPE_SELECTED",
    STORE_EXTENDED_REFERENCE_POINT_APPLIED = "STORE/BUCKETS/EXTENDED_REFERENCE_POINT_APPLIED",
    STORE_DERIVED_BUCKET_ITEMS_PLACED = "STORE/BUCKETS/DERIVED_BUCKET_ITEMS_PLACED",
    STORE_FILTER_REMOVAL_APPLIED = "STORE/BUCKETS/FILTER_REMOVAL_APPLIED",
}

/**
 * A catalog item was dropped into a bucket (`BUCKETS_DND_ITEM_INSERT`). The widest of the edits: the
 * add itself is narrow, but a measure added while every reference-point measure already compares over
 * time drags the whole over-time-comparison operation in behind it — which is where the filter bar,
 * the notifications and the extended reference point in this payload come from.
 */
export const bucketItemAdded = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEM_ADDED,
    (payload: IAddBucketItemResult) => ({ payload }),
);

/**
 * Bucket items were removed — the drag-out gesture, the explicit multi-item removal and the
 * derived-items purge (`DND_ITEM_REMOVE`, `REMOVE_ITEMS`, `REMOVE_DERIVED_ITEMS`), which are three
 * triggers over one operation because they differ only in which local identifiers they name.
 */
export const bucketItemsRemoved = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEMS_REMOVED,
    (payload: IRemoveBucketItemsCommit) => ({ payload }),
);

/** A bucket item was replaced by a catalog item in place (`DND_ITEM_REPLACE`) — an add and a removal. */
export const bucketItemReplaced = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEM_REPLACED,
    (payload: IReplaceBucketItemResult) => ({ payload }),
);

/** Two bucket items swapped, or one moved into another bucket (`DND_ITEM_SWAP`). */
export const bucketItemsSwapped = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEMS_SWAPPED,
    (payload: ISwapBucketItemResult) => ({ payload }),
);

/** A bucket item moved to another position inside its bucket (`DND_ITEM_REORDER`). */
export const bucketItemReordered = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEM_REORDERED,
    (payload: IReorderBucketItemResult) => ({ payload }),
);

/**
 * One bucket item's own properties changed — the eleven edit triggers (title, format, showAllValues,
 * aggregation, chart type, isTotalMeasure, showOnSecondaryAxis, isThresholdMeasure, showInPercent,
 * granularity, display form). ONE event, because the reference-point consequence is the same for all of
 * them and the buckets value is the only thing that differs. Dual axis is NOT one of them — see
 * {@link dualAxisToggled}.
 */
export const bucketItemEdited = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKET_ITEM_EDITED,
    (payload: IBucketItemEditResult) => ({ payload }),
);

/**
 * The dual axis was toggled for one bucket (`BUCKET_TOGGLE_DUAL_AXIS`) — the one edit that decides TWO
 * domains, so it gets its own event rather than joining {@link bucketItemEdited}: the visualization
 * properties' `dualAxis` control and the bucket items' `showOnSecondaryAxis` have to land together, or
 * the control is on while the items are not yet flagged.
 */
export const dualAxisToggled = createAction(
    BucketsOperationActionTypeKeys.STORE_DUAL_AXIS_TOGGLED,
    (payload: IDualAxisToggleResult) => ({ payload }),
);

/**
 * Date bucket items were re-pointed at another date dataset — the three `SET_*_DATE_DATASET` triggers.
 * Separate from {@link bucketItemEdited} for one observable reason: it answers the md-object flag
 * TRUE, because a dataset change needs no pluggable-visualization round trip to become valid.
 */
export const bucketsDateDatasetChanged = createAction(
    BucketsOperationActionTypeKeys.STORE_BUCKETS_DATE_DATASET_CHANGED,
    (payload: IBucketsDateDatasetChangeResult) => ({ payload }),
);

/**
 * The user picked another visualization type (`BUCKETS_SELECT_VISUALIZATION_TYPE`). Reads NOTHING —
 * the payload is the class — and the extended reference point is CLEARED, which is what makes the
 * next plug-viz answer authoritative.
 */
export const visualizationTypeSelected = createAction(
    BucketsOperationActionTypeKeys.STORE_VISUALIZATION_TYPE_SELECTED,
    (payload: IVisualizationTypeSelectionResult) => ({ payload }),
);

/**
 * A pluggable visualization answered with an extended reference point
 * (`EXTENDED_REFERENCE_POINT_CHANGED`) and AD applied it.
 *
 * THE WATCHERS THAT MUST SEE THE APPLIED STATE KEY ON THIS EVENT, not on the trigger — the catalog's
 * availability flow and the embedded `insight_changed` notification both read state this operation
 * writes, and after this row the trigger writes none of it. Narrower and safer than the prototype's
 * `isCascadeAppliedFor(<trigger>)`: the event exists per operation, so it cannot fail to arrive for a
 * cascade that computed a no-op.
 */
export const extendedReferencePointApplied = createAction(
    BucketsOperationActionTypeKeys.STORE_EXTENDED_REFERENCE_POINT_APPLIED,
    (payload: IExtendedReferencePointAppliedResult) => ({ payload }),
);

/**
 * The pluggable visualization placed the derived measures AD had queued
 * (`NEW_DERIVED_BUCKET_ITEMS_PLACED`), so the queue is emptied and the totals are mirrored onto them.
 */
export const derivedBucketItemsPlaced = createAction(
    BucketsOperationActionTypeKeys.STORE_DERIVED_BUCKET_ITEMS_PLACED,
    (payload: IDerivedBucketItemsPlacedResult) => ({ payload }),
);

/**
 * Filters were removed, so the buckets follow (`SAGA_FILTERS_WERE_CHANGED`): the removed filters' meta
 * markers are dropped, and a removed date filter that was comparing over time takes the derived
 * measures with it.
 */
export const filterRemovalApplied = createAction(
    BucketsOperationActionTypeKeys.STORE_FILTER_REMOVAL_APPLIED,
    (payload: IFilterRemovalResult) => ({ payload }),
);
