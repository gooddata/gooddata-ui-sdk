// (C) 2019-2020 GoodData Corporation

import {
    attributeLocalId,
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
    const stackBucket = bucketsFind(buckets, stackBucketName);

    const viewByAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackByAttribute = stackBucket && bucketAttribute(stackBucket);

    const stackByAttributeLocalIdentifier = stackByAttribute
        ? stackByAttribute.attribute.localIdentifier
        : undefined;

    const viewByAttributeLocalIdentifiers = viewByAttributes && viewByAttributes.map(attributeLocalId);

    return newTwoDimensional(
        stackByAttributeLocalIdentifier ? [stackByAttributeLocalIdentifier] : [],
        viewByAttributeLocalIdentifiers
            ? [...viewByAttributeLocalIdentifiers, MeasureGroupIdentifier]
            : [MeasureGroupIdentifier],
    );
}

export function defaultDimensions(def: IExecutionDefinition): IDimension[] {
    return newTwoDimensional([MeasureGroupIdentifier], bucketsAttributes(def.buckets).map(attributeLocalId));
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
    return newTwoDimensional(bucketsAttributes(def.buckets).map(attributeLocalId), [MeasureGroupIdentifier]);
}

export function roundChartDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets).map(attributeLocalId);

    if (attributes.length === 0) {
        return newTwoDimensional([], [MeasureGroupIdentifier]);
    }

    return newTwoDimensional([MeasureGroupIdentifier], attributes);
}

export function heatmapDimensions(def: IExecutionDefinition): IDimension[] {
    const view = bucketsFind(def.buckets, BucketNames.VIEW);
    const viewAttributeLocalIdentifiers = view ? bucketAttributes(view).map(attributeLocalId) : [];

    const stack = bucketsFind(def.buckets, BucketNames.STACK);

    if (!stack || bucketIsEmpty(stack)) {
        return newTwoDimensional(viewAttributeLocalIdentifiers, [MeasureGroupIdentifier]);
    }

    return newTwoDimensional(
        viewAttributeLocalIdentifiers,
        bucketAttributes(stack).map(attributeLocalId).concat([MeasureGroupIdentifier]),
    );
}

export function treemapDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets);

    if (attributes.length === 1) {
        return newTwoDimensional([MeasureGroupIdentifier], attributes.map(attributeLocalId));
    }

    return newTwoDimensional(attributes.map(attributeLocalId), [MeasureGroupIdentifier]);
}
