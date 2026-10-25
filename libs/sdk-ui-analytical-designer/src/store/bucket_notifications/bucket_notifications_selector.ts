// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAppState } from "../types.js";

import { type IBucketNotificationsState } from "./bucket_notifications_types.js";

const getBucketNotificationsState = (state: IAppState): IBucketNotificationsState =>
    state.data.bucketNotifications;

export const getRemovedItems = createSelector(
    getBucketNotificationsState,
    (state: IBucketNotificationsState) => state.removedItems || null,
);

export const wereRemovedItemsJustUpdated = createSelector(
    getBucketNotificationsState,
    (state: IBucketNotificationsState) => state.removedItemsWereJustUpdated || false,
);
