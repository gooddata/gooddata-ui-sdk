// (C) 2020-2026 GoodData Corporation

import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import { arithmeticMeasureOperandSelected } from "../arithmetic_measures/arithmetic_measures_operation_events.js";
import {
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureFilterUpdated,
} from "../bucket_filters/bucket_filters_operation_events.js";
import {
    bucketItemAdded,
    bucketItemReplaced,
    bucketItemsRemoved,
    filterRemovalApplied,
} from "../buckets/buckets_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import {
    type BucketNotificationsAction,
    BucketNotificationsActionTypeKeys,
} from "./bucket_notifications_actions.js";
import {
    bucketNotificationsWithRemovedItemsReset,
    initialBucketNotificationsState,
    resetRemovedItems,
    resetRemovedItemsWereJustUpdated,
    setRemovedItems,
} from "./bucket_notifications_helpers.js";
import { type IBucketNotificationsState } from "./bucket_notifications_types.js";

/**
 * The buckets-family operations that decide the "we removed these for you" counts.
 *
 * Four operations run the removal chain, which is what computes the counts — the chain answers the
 * notifications it was GIVEN when there is nothing worth reporting, so a removal of plain attributes
 * returns the same subtree and this reducer is a no-op there.
 */
const BUCKETS_OPERATION_NOTIFICATION_WRITERS = [
    bucketItemAdded,
    bucketItemsRemoved,
    bucketItemReplaced,
    filterRemovalApplied,
    // the arithmetic operand change can run the same removal chain
    arithmeticMeasureOperandSelected,
    // a recommendation composes the add / over-time-comparison operations
    recommendationApplied,
    // the shortcut applies compose the add operation
    metricShortcutApplied,
    metricOverTimeShortcutApplied,
    // the date-filter / metric-filter gestures that drive the over-time comparison run the
    // removal chain per master measure
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureFilterUpdated,
] as const;

/** The `data.bucketNotifications` leaf of the combined root (7.2). */
export const bucketNotificationsLeafReducer = (
    state: IBucketNotificationsState = initialBucketNotificationsState,
    action: BucketNotificationsAction,
): IBucketNotificationsState => {
    for (const event of BUCKETS_OPERATION_NOTIFICATION_WRITERS) {
        if (event.match(action as never)) {
            // `match` is the runtime proof; TS cannot carry a type predicate through a loop over a
            // union of creators. Every event has a LITERAL type string, so the domain action and
            // the event do not overlap structurally — hence the widening step.
            return (action as unknown as ReturnType<typeof event>).payload.bucketNotifications;
        }
    }

    // the application resets rebuild the value from the domain's own removed-items reset
    // (store/app_context/application_reset_events.ts)
    if (isInsightContentResetEvent(action)) {
        return bucketNotificationsWithRemovedItemsReset(state);
    }

    switch (action.type) {
        case BucketNotificationsActionTypeKeys.STORE_SET_REMOVED_ITEMS: {
            const { removedItems } = action.payload;
            return setRemovedItems(state, removedItems);
        }
        case BucketNotificationsActionTypeKeys.STORE_RESET_REMOVED_ITEMS:
            return resetRemovedItems(state);
        case BucketNotificationsActionTypeKeys.STORE_RESET_REMOVED_ITEMS_WERE_JUST_UPDATED:
            return resetRemovedItemsWereJustUpdated(state);
        default:
            return state;
    }
};
