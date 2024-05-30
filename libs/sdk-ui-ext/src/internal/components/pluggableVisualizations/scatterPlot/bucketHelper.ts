// (C) 2019-2024 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import {
    getBucketItems,
    IMeasureBucketItemsLimit,
    limitNumberOfMeasuresInBuckets,
    transformMeasureBuckets,
} from "../../../utils/bucketHelper.js";
import { IBucketOfFun } from "../../../interfaces/Visualization.js";

const measureBucketItemsLimit: IMeasureBucketItemsLimit[] = [
    {
        localIdentifier: BucketNames.MEASURES,
        itemsLimit: 1,
    },
    {
        localIdentifier: BucketNames.SECONDARY_MEASURES,
        itemsLimit: 1,
    },
];

export const transformBuckets = (buckets: IBucketOfFun[]): IBucketOfFun[] => {
    const bucketsWithLimitedMeasures = limitNumberOfMeasuresInBuckets(buckets, 2, true);

    const measureBuckets = transformMeasureBuckets(measureBucketItemsLimit, bucketsWithLimitedMeasures);
    const viewByAttributes = getBucketItems(buckets, BucketNames.ATTRIBUTE);
    const segmentByAttributes = getBucketItems(buckets, BucketNames.SEGMENT);

    const attributeBucket = {
        localIdentifier: BucketNames.ATTRIBUTE,
        items: viewByAttributes.slice(0, 1),
    };

    const segmentBucket = {
        localIdentifier: BucketNames.SEGMENT,
        items: segmentByAttributes.slice(0, 1),
    };

    return [...measureBuckets, attributeBucket, segmentBucket];
};
