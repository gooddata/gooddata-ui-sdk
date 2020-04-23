// (C) 2020 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";

import { IBucketItem, IBucketOfFun } from "../../../interfaces/Visualization";
import { METRIC } from "../../../constants/bucket";
import {
    getPreferredBucketItems,
    getAllAttributeItems,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper";

const measureBucketsLocalIdentifiers = [
    BucketNames.MEASURES,
    BucketNames.SECONDARY_MEASURES,
    BucketNames.TERTIARY_MEASURES,
];

const transformMeasureBuckets = (buckets: IBucketOfFun[]) => {
    let unusedMeasures: IBucketItem[] = [];

    const newBuckets: IBucketOfFun[] = measureBucketsLocalIdentifiers.map((bucketLocalIdentifier: string) => {
        const preferredBucketItems = getPreferredBucketItems(buckets, [bucketLocalIdentifier], [METRIC]);
        const firstMeasure = preferredBucketItems.splice(0, 1);

        unusedMeasures = [...unusedMeasures, ...preferredBucketItems];

        return {
            localIdentifier: bucketLocalIdentifier,
            items: firstMeasure,
        };
    });

    return newBuckets.map(bucket =>
        bucket.items.length > 0 ? bucket : { ...bucket, items: unusedMeasures.splice(0, 1) },
    );
};

export const transformBuckets = (buckets: IBucketOfFun[]): IBucketOfFun[] => {
    const bucketsWithLimitedMeasures = limitNumberOfMeasuresInBuckets(buckets, 3, true);

    const measureBuckets = transformMeasureBuckets(bucketsWithLimitedMeasures);

    const viewByBucket = {
        localIdentifier: BucketNames.VIEW,
        items: getAllAttributeItems(buckets).slice(0, 2),
    };

    return [...measureBuckets, viewByBucket];
};
