// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { isRenamingBucketItem as isRenamingBucketItemSelector } from "../services/buckets_service.js";

export const bucketItemHeaderSelector = createSelector(
    isRenamingBucketItemSelector,
    (isRenamingBucketItem) => ({
        isRenamingBucketItem,
    }),
);
