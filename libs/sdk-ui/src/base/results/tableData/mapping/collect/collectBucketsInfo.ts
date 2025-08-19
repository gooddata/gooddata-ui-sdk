// (C) 2019-2025 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { IAttribute, IBucket, IMeasure, bucketsFind, isAttribute, isMeasure } from "@gooddata/sdk-model";

import { BucketNames } from "../../../../constants/bucketNames.js";

/**
 * @internal
 */
export type IBucketsInfo = {
    columnBucket?: IBucket;
    rowBucket?: IBucket;
    measureBucket?: IBucket;
    rowAttributes: IAttribute[];
    columnAttributes: IAttribute[];
    measures: IMeasure[];
};

/**
 * @internal
 */
export function collectBucketsInfo(dataView: IDataView) {
    const buckets = dataView.definition.buckets;

    const columnBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    const rowBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const measureBucket = bucketsFind(buckets, BucketNames.MEASURES);

    return {
        columnBucket,
        rowBucket,
        measureBucket,
        rowAttributes: rowBucket?.items.filter(isAttribute) ?? [],
        columnAttributes: columnBucket?.items.filter(isAttribute) ?? [],
        measures: measureBucket?.items.filter(isMeasure) ?? [],
    };
}
