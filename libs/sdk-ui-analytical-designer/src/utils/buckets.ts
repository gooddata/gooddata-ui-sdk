// (C) 2007-2026 GoodData Corporation

import { isDerived } from "../models/bucket_item.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";

export function getDerivedBucketItems(buckets: IRawBuckets): IRawBucketItems {
    return buckets.flatMap<IRawBucketItem>((bucket) => bucket?.items).filter(isDerived) as IRawBucketItems;
}
