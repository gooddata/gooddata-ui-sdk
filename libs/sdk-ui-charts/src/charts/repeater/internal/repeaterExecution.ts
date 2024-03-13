// (C) 2024 GoodData Corporation
import {
    DimensionItem,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IDimension,
    MeasureGroupIdentifier,
    bucketAttributes,
    bucketMeasures,
    bucketsFind,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

/**
 * Constructs repeater buckets from the provided attributes and measures.
 *
 * @internal
 */
export function constructRepeaterBuckets(
    rowAttribute: IAttribute,
    columns: IAttributeOrMeasure[],
    sliceVisualizationBy?: IAttribute,
) {
    return [
        newBucket(BucketNames.ATTRIBUTE, rowAttribute as IAttribute),
        newBucket(BucketNames.COLUMNS, ...(columns as IAttributeOrMeasure[])),
        sliceVisualizationBy ? newBucket(BucketNames.VIEW, sliceVisualizationBy as IAttribute) : undefined,
    ].filter(Boolean);
}

/**
 * Constructs repeater execution dimensions from the provided buckets.
 *
 * @internal
 */
export function constructRepeaterDimensions(buckets: IBucket[]): IDimension[] {
    // Row attribute
    const rowAttributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const rowAttributeBucketAttributes = rowAttributeBucket ? bucketAttributes(rowAttributeBucket) : [];
    const rowAttribute = rowAttributeBucketAttributes[0];

    // Columns (row attribute display forms + visualization measures)
    const columnsBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    const columnBucketMeasures = columnsBucket ? bucketMeasures(columnsBucket) : [];
    const columnBucketAttributes = columnsBucket ? bucketAttributes(columnsBucket) : [];

    // Slice by attribute
    const viewBucket = bucketsFind(buckets, BucketNames.VIEW);
    const viewBucketAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const viewAttribute = viewBucketAttributes[0];

    const dimensions: DimensionItem[][] = [[rowAttribute, ...columnBucketAttributes]];

    if (viewAttribute && columnBucketMeasures.length > 0) {
        dimensions.push([viewAttribute, MeasureGroupIdentifier]);
    }

    return dimensions.map((d) => newDimension(d));
}
