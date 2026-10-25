// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IRawBucketItem } from "../../typings/buckets.js";

export enum HighlightingUiActionTypeKeys {
    UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_TRASH = "UI/HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_TRASH",
    UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_SWAP = "UI/HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_SWAP",
    UI_RESET_HIGHLIGHTED_ITEMS_TO_BE_REMOVED = "UI/RESET_HIGHLIGHTED_ITEMS_TO_BE_REMOVED",
    UI_HIGHLIGHT_BUCKET_AND_FILTER_ITEMS = "UI/HIGHLIGHT_BUCKET_AND_FILTER_ITEMS",
    UI_RESET_HIGHLIGHTED_BUCKET_AND_FILTER_ITEMS = "UI/RESET_HIGHLIGHTED_BUCKET_AND_FILTER_ITEMS",
}

export type IHighlightingUiAction =
    | IHighlightItemsToBeRemovedByTrashAction
    | IHighlightItemsToBeRemovedBySwapAction
    | IResetHighlightedItemsToBeRemovedAction
    | IHighlightBucketAndFilterItems
    | IResetHighlightedBucketAndFilterItems;

export const highlightItemsToBeRemovedByTrash = createAction(
    HighlightingUiActionTypeKeys.UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_TRASH,
);

export type IHighlightItemsToBeRemovedByTrashAction = ReturnType<typeof highlightItemsToBeRemovedByTrash>;

export const highlightItemsToBeRemovedBySwap = createAction(
    HighlightingUiActionTypeKeys.UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_SWAP,
    (replacedItem: IRawBucketItem) => ({ payload: { replacedItem } }),
);

export type IHighlightItemsToBeRemovedBySwapAction = ReturnType<typeof highlightItemsToBeRemovedBySwap>;

export const resetHighlightedItemsToBeRemoved = createAction(
    HighlightingUiActionTypeKeys.UI_RESET_HIGHLIGHTED_ITEMS_TO_BE_REMOVED,
);

export type IResetHighlightedItemsToBeRemovedAction = ReturnType<typeof resetHighlightedItemsToBeRemoved>;

export const highlightBucketAndFilterItems = createAction(
    HighlightingUiActionTypeKeys.UI_HIGHLIGHT_BUCKET_AND_FILTER_ITEMS,
    (bucketItemLocalIdentifiers: string[], filterLocalIdentifier?: string) => ({
        payload: { bucketItemLocalIdentifiers, filterLocalIdentifier },
    }),
);

export type IHighlightBucketAndFilterItems = ReturnType<typeof highlightBucketAndFilterItems>;

export const resetHighlightedBucketAndFilterItems = createAction(
    HighlightingUiActionTypeKeys.UI_RESET_HIGHLIGHTED_BUCKET_AND_FILTER_ITEMS,
);

export type IResetHighlightedBucketAndFilterItems = ReturnType<typeof resetHighlightedBucketAndFilterItems>;
