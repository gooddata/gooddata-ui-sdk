// (C) 2019-2020 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import {
    getAllAttributeItems,
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

    const attributeBucket = {
        localIdentifier: BucketNames.ATTRIBUTE,
        items: getAllAttributeItems(buckets).slice(0, 1),
    };

    return [...measureBuckets, attributeBucket];
};
