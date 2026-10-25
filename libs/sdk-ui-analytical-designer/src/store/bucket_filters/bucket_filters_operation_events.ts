// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type IAttributeFilterUpdateResult,
    type ICommandFilterItemsUpdateResult,
    type IDateFilterDateDatasetChangeResult,
    type IDateFilterUpdateResult,
    type IFilterStoreResult,
    type IMetricDateFilterApplyResult,
    type IMetricDateFilterDateDatasetSelectionResult,
    type IMetricFilterAddResult,
    type IMetricFilterRemoveResult,
    type IMetricFilterUpdateResult,
} from "./bucket_filters_operations.js";

/**
 * THE SEMANTIC EVENTS OF THE BUCKET-FILTERS FAMILY — the same contract as
 * `buckets_operation_events.ts`: each payload is the operation's RESULT, carried unconditionally,
 * with unchanged values arriving by reference so every consuming case short-circuits.
 *
 * The type strings live in their own namespace, like the other families': only the owning reducers
 * consume them, so keeping them out of `ActionTypeKeys` is what keeps "which strings are frozen
 * behavior" answerable. Deliberately NOT undoable — time travel keys on the triggers
 * (`STORE_ADD_OR_UPDATE_FILTER_ITEMS` is in the whitelist; the snapshot is the state BEFORE the
 * edit, so it cannot wait for the event).
 */
export enum BucketFiltersOperationActionTypeKeys {
    STORE_ATTRIBUTE_FILTER_UPDATED = "STORE/BUCKET_FILTERS/ATTRIBUTE_FILTER_UPDATED",
    STORE_DATE_FILTER_UPDATED = "STORE/BUCKET_FILTERS/DATE_FILTER_UPDATED",
    STORE_DATE_FILTER_DATE_DATASET_CHANGED = "STORE/BUCKET_FILTERS/DATE_FILTER_DATE_DATASET_CHANGED",
    STORE_FILTER_ITEMS_UPDATED_FROM_COMMAND = "STORE/BUCKET_FILTERS/FILTER_ITEMS_UPDATED_FROM_COMMAND",
    STORE_FILTER_ITEMS_COMMAND_FAILED = "STORE/BUCKET_FILTERS/FILTER_ITEMS_COMMAND_FAILED",
    STORE_MEASURE_VALUE_FILTER_UPDATED = "STORE/BUCKET_FILTERS/MEASURE_VALUE_FILTER_UPDATED",
    STORE_RANKING_FILTER_UPDATED = "STORE/BUCKET_FILTERS/RANKING_FILTER_UPDATED",
    STORE_MEASURE_FILTER_ADDED = "STORE/BUCKET_FILTERS/MEASURE_FILTER_ADDED",
    STORE_MEASURE_FILTER_REMOVED = "STORE/BUCKET_FILTERS/MEASURE_FILTER_REMOVED",
    STORE_MEASURE_FILTER_UPDATED = "STORE/BUCKET_FILTERS/MEASURE_FILTER_UPDATED",
    STORE_MEASURE_DATE_FILTER_APPLIED = "STORE/BUCKET_FILTERS/MEASURE_DATE_FILTER_APPLIED",
    STORE_MEASURE_DATE_FILTER_DATE_DATASET_SELECTED = "STORE/BUCKET_FILTERS/MEASURE_DATE_FILTER_DATE_DATASET_SELECTED",
}

/**
 * An attribute filter's selection changed (`STORE_UPDATE_ATTRIBUTE_FILTER`): the filter bar with the
 * updated filter, the `modified` marker under the filter's cache item, the re-synced reference
 * point and the cleared md-object flag.
 */
export const attributeFilterUpdated = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_ATTRIBUTE_FILTER_UPDATED,
    (payload: IAttributeFilterUpdateResult) => ({ payload }),
);

/**
 * THE date filter changed (`STORE_UPDATE_DATE_FILTER`): the filter bar (including the migrated
 * additional date filters when the payload carried them), the date `modified` marker — and, because
 * the first date filter drives every master measure's over-time comparison, the full removal-chain
 * set: buckets, bucket notifications, the extended reference point's re-validated sort items and
 * the derived-measure queue. The reference point is re-synced and the md-object flag cleared.
 */
export const dateFilterUpdated = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_DATE_FILTER_UPDATED,
    (payload: IDateFilterUpdateResult) => ({ payload }),
);

/**
 * A date filter moved to another date dataset (`STORE_UPDATE_DATE_FILTER_DATE_DATASET`): the filter
 * bar with the re-pointed filter and the migrated additional date filters, the re-synced reference
 * point, the cleared md-object flag. ALWAYS fired — a missing filter or an unchanged ref carries
 * every value by reference, so `sagas/date_datasets`' `take` on this event cannot hang and no
 * consumer is notified.
 */
export const dateFilterDateDatasetChanged = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_DATE_FILTER_DATE_DATASET_CHANGED,
    (payload: IDateFilterDateDatasetChangeResult) => ({ payload }),
);

/**
 * The embedded `COMMAND/*` filter update landed (`STORE_ADD_OR_UPDATE_FILTER_ITEMS`): every domain
 * the command's branches can decide — the filter bar, the buckets (a created first date filter runs
 * the derived-measure chain), the meta markers, the notifications, the extended reference point,
 * the queue — plus the re-synced reference point and the cleared md-object flag.
 * `postMessageApi/sagas/control_filtering_saga` `take`s this event before reading the filters the
 * command created.
 */
export const filterItemsUpdatedFromCommand = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_FILTER_ITEMS_UPDATED_FROM_COMMAND,
    (payload: ICommandFilterItemsUpdateResult) => ({ payload }),
);

/**
 * THE COMMAND OPERATION FAILED before it could commit (an unexpected throw inside the pure
 * calculation). NOT a store event — no reducer consumes it. It exists because
 * `control_filtering_saga` BLOCKS on `filterItemsUpdatedFromCommand` and must stop waiting and
 * reply an ERROR to the embed host. The operation watcher stays alive, because the error is carried
 * here instead of thrown, so later commands keep working.
 */
export const filterItemsCommandFailed = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_FILTER_ITEMS_COMMAND_FAILED,
    (payload: { error: unknown }) => ({ payload }),
);

/**
 * A measure-value filter's conditions changed (`STORE_UPDATE_MEASURE_VALUE_FILTER`): the filter bar
 * with the stored filter, the re-synced reference point, the cleared md-object flag.
 */
export const measureValueFilterUpdated = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_VALUE_FILTER_UPDATED,
    (payload: IFilterStoreResult) => ({ payload }),
);

/** The ranking filter changed (`STORE_UPDATE_RANKING_FILTER`): same shape as the measure-value one. */
export const rankingFilterUpdated = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_RANKING_FILTER_UPDATED,
    (payload: IFilterStoreResult) => ({ payload }),
);

/**
 * A metric filter joined a bucket item (`STORE_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER`): the
 * buckets with the appended filter — plus, for a date filter, the measure's date-dataset selection,
 * and for an attribute filter, the merged item cache and the filter's `displayAsLabel` config. The
 * reference point is re-synced and the md-object flag cleared.
 */
export const measureFilterAdded = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_FILTER_ADDED,
    (payload: IMetricFilterAddResult) => ({ payload }),
);

/**
 * A metric filter left its bucket item (`STORE_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER`): the
 * buckets without it — plus the cleared date-dataset selection (date filter) or the dropped
 * `displayAsLabel` config (attribute filter), the re-synced reference point, the cleared md flag.
 */
export const measureFilterRemoved = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_FILTER_REMOVED,
    (payload: IMetricFilterRemoveResult) => ({ payload }),
);

/**
 * A metric filter's definition changed (`STORE_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER`): the
 * buckets with the patched filter — and, when the dialog drove the over-time comparison, the full
 * removal-chain set. The reference point and md flag are carried CONDITIONALLY: an edit that
 * neither drives the comparison nor marks the filter modified answers both by reference.
 */
export const measureFilterUpdated = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_FILTER_UPDATED,
    (payload: IMetricFilterUpdateResult) => ({ payload }),
);

/**
 * The metric date filter picker was applied as ONE gesture
 * (`STORE_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER`): the buckets with the period on the
 * metric's date filter (added when the metric had none) and its additional date filters swapped for
 * the applied set, the measure's date-dataset selection, the `displayAsLabel` configs of the added
 * additional filters stored and of the dropped ones removed, the re-synced reference point and the
 * cleared md flag.
 */
export const measureDateFilterApplied = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_DATE_FILTER_APPLIED,
    (payload: IMetricDateFilterApplyResult) => ({ payload }),
);

/**
 * The legacy dropdown selected a metric's date dataset (`MEASURE_DATE_DATASETS_SELECT`, with or
 * without time travel): the buckets with the dataset stamped on the metric's primary date filter,
 * the re-synced reference point and the cleared md flag. Fired only when the filter did not name
 * the dataset already.
 */
export const measureDateFilterDateDatasetSelected = createAction(
    BucketFiltersOperationActionTypeKeys.STORE_MEASURE_DATE_FILTER_DATE_DATASET_SELECTED,
    (payload: IMetricDateFilterDateDatasetSelectionResult) => ({ payload }),
);
