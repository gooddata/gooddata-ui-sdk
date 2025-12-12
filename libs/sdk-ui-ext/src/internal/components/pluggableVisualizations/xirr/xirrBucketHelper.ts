// (C) 2019-2025 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";

import { type IBucketOfFun, type IReferencePoint } from "../../../interfaces/Visualization.js";
import {
    findBucket,
    getAllMeasures,
    getDateItems,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper.js";

export const getXirrBuckets = ({ buckets }: Readonly<IReferencePoint>): IBucketOfFun[] => {
    const limitedMeasureBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);

    const currentMeasureBucket = findBucket(limitedMeasureBuckets, BucketNames.MEASURES);
    const currentAttributeBucket = findBucket(buckets, BucketNames.ATTRIBUTE);

    const measureItem = getAllMeasures(limitedMeasureBuckets)[0];
    const dateAttributeItem = getDateItems(buckets)[0];

    return [
        {
            ...currentMeasureBucket,
            localIdentifier: BucketNames.MEASURES,
            items: measureItem ? [measureItem] : [],
        },
        {
            ...currentAttributeBucket,
            localIdentifier: BucketNames.ATTRIBUTE,
            items: dateAttributeItem ? [dateAttributeItem] : [],
        },
    ];
};
