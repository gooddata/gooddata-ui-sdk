// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IRawBucketItem } from "../typings/buckets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

export const dropCatalogItem = createAction(
    ActionTypeKeys.BUCKETS_DND_ITEM_INSERT,
    (localIdentifier: string, catalogItem: ICatalogEntry, bucketPosition = -1) => ({
        payload: { localIdentifier, catalogItem, bucketPosition },
    }),
);

export type IDropCatalogItemAction = ReturnType<typeof dropCatalogItem>;

export const removeBucketItem = createAction(
    ActionTypeKeys.BUCKETS_DND_ITEM_REMOVE,
    (bucketItem: IRawBucketItem, bucketItemPosition: number, from: string) => ({
        payload: { bucketItem, bucketItemPosition, from },
    }),
);

export type IRemoveBucketItemAction = ReturnType<typeof removeBucketItem>;

export const replaceBucketItem = createAction(
    ActionTypeKeys.BUCKETS_DND_ITEM_REPLACE,
    (bucketItem: IRawBucketItem, catalogItem: ICatalogEntry) => ({
        payload: { bucketItem, catalogItem },
    }),
);

export type IReplaceBucketItemAction = ReturnType<typeof replaceBucketItem>;

/**
 * `from` and `to` are raw bucket ITEMS, not identifiers: the drag-and-drop layer hands over the items
 * it is holding.
 *
 * `localIdentifier` is the TARGET BUCKET's, and it is optional in effect: absent means "swap the two
 * items in place", present means "move `from` into that bucket". The action always carries it because
 * every producer knows which bucket was dropped on.
 */
export const swapBucketItem = createAction(
    ActionTypeKeys.BUCKETS_DND_ITEM_SWAP,
    (localIdentifier: string, from: IRawBucketItem, to: IRawBucketItem) => ({
        payload: { localIdentifier, from, to },
    }),
);

export type ISwapBucketItemAction = ReturnType<typeof swapBucketItem>;

export const reorderBucketItem = createAction(
    ActionTypeKeys.BUCKETS_DND_ITEM_REORDER,
    (localIdentifier: string, from: IRawBucketItem, fromPosition: number, bucketPosition: number) => ({
        payload: { localIdentifier, from, fromPosition, bucketPosition },
    }),
);

export type IReorderBucketItemAction = ReturnType<typeof reorderBucketItem>;
