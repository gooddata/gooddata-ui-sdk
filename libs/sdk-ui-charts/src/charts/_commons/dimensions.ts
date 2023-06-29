// (C) 2019-2023 GoodData Corporation
import compact from "lodash/compact.js";
import {
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    bucketsAttributes,
    bucketsFind,
    IBucket,
    IDimension,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

function isStackedChart(buckets: IBucket[], stackBucketName: string) {
    const stackBucket = bucketsFind(buckets, stackBucketName);

    return stackBucket && !bucketIsEmpty(stackBucket);
}

function stackedDimensions(
    buckets: IBucket[],
    viewBucketName: string,
    stackBucketName: string,
): IDimension[] {
    const viewBucket = bucketsFind(buckets, viewBucketName);
    const viewByAttributes = viewBucket ? bucketAttributes(viewBucket) : [];

    const stackBucket = bucketsFind(buckets, stackBucketName);
    const stackByAttribute = stackBucket && bucketAttribute(stackBucket);

    return newTwoDimensional(compact([stackByAttribute]), [...viewByAttributes, MeasureGroupIdentifier]);
}

export function defaultDimensions(def: IExecutionDefinition): IDimension[] {
    return newTwoDimensional([MeasureGroupIdentifier], bucketsAttributes(def.buckets));
}

export function stackedChartDimensions(
    def: IExecutionDefinition,
    viewBucketName: string = BucketNames.VIEW,
    stackBucketName: string = BucketNames.STACK,
): IDimension[] {
    const { buckets } = def;

    return isStackedChart(buckets, stackBucketName)
        ? stackedDimensions(buckets, viewBucketName, stackBucketName)
        : defaultDimensions(def);
}

export function pointyChartDimensions(def: IExecutionDefinition): IDimension[] {
    return newTwoDimensional(bucketsAttributes(def.buckets), [MeasureGroupIdentifier]);
}

export function roundChartDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets);

    return attributes.length
        ? newTwoDimensional([MeasureGroupIdentifier], attributes)
        : newTwoDimensional([], [MeasureGroupIdentifier]);
}

export function heatmapDimensions(def: IExecutionDefinition): IDimension[] {
    const viewBucket = bucketsFind(def.buckets, BucketNames.VIEW);
    const viewByAttributes = viewBucket ? bucketAttributes(viewBucket) : [];

    const stackBucket = bucketsFind(def.buckets, BucketNames.STACK);
    const stackByAttribute = stackBucket ? bucketAttributes(stackBucket) : [];

    return newTwoDimensional(viewByAttributes, compact([...stackByAttribute, MeasureGroupIdentifier]));
}

export function treemapDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets);

    return attributes.length === 1
        ? newTwoDimensional([MeasureGroupIdentifier], attributes)
        : newTwoDimensional(attributes, [MeasureGroupIdentifier]);
}

export function sankeyDimensions(def: IExecutionDefinition): IDimension[] {
    const attributeFromBucket = bucketsFind(def.buckets, BucketNames.ATTRIBUTE_FROM);
    const attributeFromByAttributes = attributeFromBucket ? bucketAttributes(attributeFromBucket) : [];

    const attributeToBucket = bucketsFind(def.buckets, BucketNames.ATTRIBUTE_TO);
    const attributeToByAttributes = attributeToBucket ? bucketAttributes(attributeToBucket) : [];

    return newTwoDimensional(
        [MeasureGroupIdentifier],
        compact([...attributeFromByAttributes, ...attributeToByAttributes]),
    );
}

export function dependencyWheelDimensions(def: IExecutionDefinition): IDimension[] {
    return sankeyDimensions(def);
}
