// (C) 2007-2026 GoodData Corporation

import { MEASURES } from "../constants/bucket.js";
import { bucketsToMetadata } from "../models/metadata.js";
import { type IBucket as IVisualizationObjectBucket } from "../typings/bear/bearTypes.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
} from "../typings/buckets.js";

const createBuckets = (measure: IDecoratedBucketItem): IDecoratedBuckets => [
    {
        localIdentifier: MEASURES,
        items: [measure],
    } as IDecoratedBucket,
];

export const getMetricMDObject = (
    measure: IDecoratedBucketItem,
): { buckets: IVisualizationObjectBucket[] } => ({
    buckets: bucketsToMetadata(
        createBuckets({
            ...measure,
            showInPercent: null,
        }),
    ),
});
