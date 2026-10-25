// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IRemovedItems } from "./bucket_notifications_types.js";

export enum BucketNotificationsActionTypeKeys {
    STORE_SET_REMOVED_ITEMS = "STORE/SET_REMOVED_ITEMS",
    STORE_RESET_REMOVED_ITEMS = "STORE/RESET_REMOVED_ITEMS_NOTIFICATION",
    STORE_RESET_REMOVED_ITEMS_WERE_JUST_UPDATED = "STORE/RESET_REMOVED_ITEMS_WERE_JUST_UPDATED",
}

export type BucketNotificationsAction =
    | ISetRemovedItemsAction
    | IResetRemovedItemsAction
    | IResetRemovedItemsWereJustUpdatedAction;

export const setRemovedItems = createAction(
    BucketNotificationsActionTypeKeys.STORE_SET_REMOVED_ITEMS,
    (removedItems: IRemovedItems) => ({ payload: { removedItems } }),
);

export type ISetRemovedItemsAction = ReturnType<typeof setRemovedItems>;

export const resetRemovedItems = createAction(BucketNotificationsActionTypeKeys.STORE_RESET_REMOVED_ITEMS);

export type IResetRemovedItemsAction = ReturnType<typeof resetRemovedItems>;

export const resetRemovedItemsWereJustUpdated = createAction(
    BucketNotificationsActionTypeKeys.STORE_RESET_REMOVED_ITEMS_WERE_JUST_UPDATED,
);

export type IResetRemovedItemsWereJustUpdatedAction = ReturnType<typeof resetRemovedItemsWereJustUpdated>;
