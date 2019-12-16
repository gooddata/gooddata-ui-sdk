// (C) 2019 GoodData Corporation

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
import { BucketNames } from "../../base";

function isStackedChart(buckets: IBucket[]) {
    return !bucketIsEmpty(bucketsFind(buckets, BucketNames.STACK));
}

function stackedDimensions(buckets: IBucket[]): IDimension[] {
    const viewBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const stackBucket = bucketsFind(buckets, BucketNames.STACK);

    const viewByAttributes = bucketAttributes(viewBucket);
    const stackByAttribute = bucketAttribute(stackBucket);

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

export function stackedChartDimensions(def: IExecutionDefinition): IDimension[] {
    const { buckets } = def;
    return isStackedChart(buckets) ? stackedDimensions(buckets) : defaultDimensions(def);
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
    const view: IBucket = bucketsFind(def.buckets, BucketNames.VIEW);
    const stack: IBucket = bucketsFind(def.buckets, BucketNames.STACK);

    if (bucketIsEmpty(stack)) {
        return newTwoDimensional(bucketAttributes(view).map(attributeLocalId), [MeasureGroupIdentifier]);
    }

    return newTwoDimensional(
        bucketAttributes(view).map(attributeLocalId),
        bucketAttributes(stack)
            .map(attributeLocalId)
            .concat([MeasureGroupIdentifier]),
    );
}

export function treemapDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets);

    if (attributes.length === 1) {
        return newTwoDimensional([MeasureGroupIdentifier], attributes.map(attributeLocalId));
    }

    return newTwoDimensional(attributes.map(attributeLocalId), [MeasureGroupIdentifier]);
}
