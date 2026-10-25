// (C) 2007-2026 GoodData Corporation

import { getDecoratedBuckets } from "../selectors/buckets_selector.js";
import { type IAppState } from "../store/types.js";
import { type IDecoratedBucketItems } from "../typings/buckets.js";

export function getDecoratedMeasures(state: IAppState): IDecoratedBucketItems {
    return getDecoratedBuckets(state)
        .flatMap((bucket) => bucket.items)
        .filter((bucketItem) => bucketItem.isMeasure);
}
