// (C) 2026 GoodData Corporation

import { type IRawBucketItems } from "../../typings/buckets.js";
import { type IAppState } from "../types.js";

import { getBucketItemsInBuckets } from "./buckets_write_helpers.js";

/**
 * The domain's single input selector. The whole-root readers in services/buckets_service.ts
 * (`getBuckets`/`getMeasures`/`getAttributes`…) hang off it.
 */
export const getBucketsState = (state: IAppState) => state.data.buckets;

/** Flat view of every bucket item, in bucket order — the cluster's most common derived read. */
export function getAllBucketItems(root: IAppState): IRawBucketItems {
    return getBucketItemsInBuckets(getBucketsState(root));
}
