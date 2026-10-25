// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

/**
 * Legacy action type strings — FROZEN: consumers
 * that match on strings (telemetry, devtools traces) must not notice the RTK
 * migration. Only actions added AFTER the migration use RTK's `${sliceName}/${caseReducer}`
 * convention.
 */
export enum HighlightingActionTypeKeys {
    STORE_SET_HIGHLIGHTED_BUCKET_ITEMS = "STORE/SET_HIGHLIGHTED_BUCKET_ITEMS",
    STORE_RESET_HIGHLIGHTED_BUCKET_ITEMS = "STORE/RESET_HIGHLIGHTED_BUCKET_ITEMS",
    STORE_SET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS = "STORE/SET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS",
    STORE_RESET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS = "STORE/RESET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS",
    STORE_SET_HIGHLIGHTED_FILTER_ITEM = "STORE/SET_HIGHLIGHTED_FILTER_ITEM",
    STORE_RESET_HIGHLIGHTED_FILTER_ITEM = "STORE/RESET_HIGHLIGHTED_FILTER_ITEM",
}

// Prepare callbacks preserve the original positional call signatures AND the original
// payload shapes, so call sites and payload consumers are untouched by the migration.

export const setHighlightedBucketItems = createAction(
    HighlightingActionTypeKeys.STORE_SET_HIGHLIGHTED_BUCKET_ITEMS,
    (localIdentifiers: string[]) => ({ payload: { localIdentifiers } }),
);

export const resetHighlightedBucketItems = createAction(
    HighlightingActionTypeKeys.STORE_RESET_HIGHLIGHTED_BUCKET_ITEMS,
);

export const setAboutToBeRemovedBucketAndFilterItems = createAction(
    HighlightingActionTypeKeys.STORE_SET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS,
    (localIdentifiers: string[]) => ({ payload: { localIdentifiers } }),
);

export const resetAboutToBeRemovedBucketAndFilterItems = createAction(
    HighlightingActionTypeKeys.STORE_RESET_ABOUT_TO_BE_REMOVED_BUCKET_AND_FILTER_ITEMS,
);

export const setHighlightedFilterItem = createAction(
    HighlightingActionTypeKeys.STORE_SET_HIGHLIGHTED_FILTER_ITEM,
    (localIdentifier: string) => ({ payload: { localIdentifier } }),
);

export const resetHighlightedFilterItem = createAction(
    HighlightingActionTypeKeys.STORE_RESET_HIGHLIGHTED_FILTER_ITEM,
);
