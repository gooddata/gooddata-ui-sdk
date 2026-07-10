// (C) 2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";

import { type IBucketOfFun } from "../../../interfaces/Visualization.js";
import {
    type IMeasureBucketItemsLimit,
    getBucketItems,
    limitNumberOfMeasuresInBuckets,
    transformMeasureBuckets,
} from "../../../utils/bucketHelper.js";

const measureBucketItemsLimit: IMeasureBucketItemsLimit[] = [
    {
        // Width metric
        localIdentifier: BucketNames.MEASURES,
        itemsLimit: 1,
    },
    {
        // Height metric
        localIdentifier: BucketNames.SECONDARY_MEASURES,
        itemsLimit: 1,
    },
];

export const transformBuckets = (buckets: IBucketOfFun[]): IBucketOfFun[] => {
    const bucketsWithLimitedMeasures = limitNumberOfMeasuresInBuckets(buckets, 2, true);

    const measureBuckets = transformMeasureBuckets(measureBucketItemsLimit, bucketsWithLimitedMeasures);
    const viewByAttributes = getBucketItems(buckets, BucketNames.VIEW);
    const stackByAttributes = getBucketItems(buckets, BucketNames.STACK);

    const viewBucket = {
        localIdentifier: BucketNames.VIEW,
        items: viewByAttributes.slice(0, 1),
    };

    const stackBucket = {
        localIdentifier: BucketNames.STACK,
        items: stackByAttributes.slice(0, 1),
    };

    return [...measureBuckets, viewBucket, stackBucket];
};
