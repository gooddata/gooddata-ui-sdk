// (C) 2020 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";

import { IBucketOfFun } from "../../../interfaces/Visualization.js";
import {
    getAllAttributeItems,
    getDateItems,
    removeDivergentDateItems,
    IMeasureBucketItemsLimit,
    limitNumberOfMeasuresInBuckets,
    transformMeasureBuckets,
    getMainDateItem,
} from "../../../utils/bucketHelper.js";

const measureBucketItemsLimit: IMeasureBucketItemsLimit[] = [
    {
        localIdentifier: BucketNames.MEASURES,
        itemsLimit: 1,
    },
    {
        localIdentifier: BucketNames.SECONDARY_MEASURES,
        itemsLimit: 1,
    },
    {
        localIdentifier: BucketNames.TERTIARY_MEASURES,
        itemsLimit: 1,
    },
];

export const transformBuckets = (buckets: IBucketOfFun[]): IBucketOfFun[] => {
    const bucketsWithLimitedMeasures = limitNumberOfMeasuresInBuckets(buckets, 3, true);

    const measureBuckets = transformMeasureBuckets(measureBucketItemsLimit, bucketsWithLimitedMeasures);

    const dateItems = getDateItems(buckets);
    const mainDateItem = getMainDateItem(dateItems);

    const viewByBucket = {
        localIdentifier: BucketNames.VIEW,
        items: removeDivergentDateItems(getAllAttributeItems(buckets), mainDateItem).slice(0, 2),
    };

    return [...measureBuckets, viewByBucket];
};
