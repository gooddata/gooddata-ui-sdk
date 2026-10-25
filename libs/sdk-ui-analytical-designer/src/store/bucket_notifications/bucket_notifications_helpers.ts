// (C) 2026 GoodData Corporation

import { type IBucketNotificationsState, type IRemovedItems } from "./bucket_notifications_types.js";

/**
 * `data.bucketNotifications` — the "we removed these for you" counts, as narrow pure helpers over the
 * domain value.
 *
 * BOTH OF THESE LIVED IN `buckets_notifications_reducer.ts` and moved here, for the same
 * reason `IFilterBarState` moved to its own state module: the reducer now consumes the buckets operation
 * events, and the buckets removal chain calls `bucketNotificationsWithRemovedItems` — so keeping the pure
 * helper next to the reducer made a cycle out of a function that has no reducer dependency at all.
 *
 * `initialBucketNotificationsState` comes with them because both default to it.
 */
export const initialBucketNotificationsState: IBucketNotificationsState = {
    removedItems: undefined,
    removedItemsWereJustUpdated: undefined,
    itemsWithChangedGranularity: undefined,
};

export const setRemovedItems = (
    state: IBucketNotificationsState,
    removedItems: IRemovedItems | undefined,
): IBucketNotificationsState => ({
    ...state,
    removedItems,
    removedItemsWereJustUpdated: true,
});

export const resetRemovedItems = (state: IBucketNotificationsState): IBucketNotificationsState => ({
    ...state,
    removedItems: undefined,
});

export const resetRemovedItemsWereJustUpdated = (
    state: IBucketNotificationsState,
): IBucketNotificationsState => ({
    ...state,
    removedItemsWereJustUpdated: undefined,
});

/**
 * Computes the subtree value with `removedItems` set. The buckets removal chain calls this while it
 * folds, so the counts land inside the operation's single event.
 */
export const bucketNotificationsWithRemovedItems = (
    state: IBucketNotificationsState = initialBucketNotificationsState,
    removedItems: IRemovedItems,
): IBucketNotificationsState => setRemovedItems(state, removedItems);

/**
 * Computes the subtree value with `removedItems` cleared — for the whole-root reset transformer
 * (store/app_context) and the router / open-report / delete-report reducers, which apply the reset as a
 * plain function where no dedicated action exists.
 */
export const bucketNotificationsWithRemovedItemsReset = (
    state: IBucketNotificationsState = initialBucketNotificationsState,
): IBucketNotificationsState => resetRemovedItems(state);
