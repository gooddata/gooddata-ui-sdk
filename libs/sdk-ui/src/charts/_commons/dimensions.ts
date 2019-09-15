// (C) 2019 GoodData Corporation

import {
    attributeId,
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    bucketsAttributes,
    bucketsFind,
    IBucket,
    IDimension,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { ATTRIBUTE, STACK, VIEW } from "../../base/constants/bucketNames";
import { MEASUREGROUP } from "../../base/constants/dimensions";

function isStackedChart(buckets: IBucket[]) {
    return !bucketIsEmpty(bucketsFind(buckets, STACK));
}

function stackedDimensions(buckets: IBucket[]): IDimension[] {
    const viewBucket = bucketsFind(buckets, ATTRIBUTE);
    const stackBucket = bucketsFind(buckets, STACK);

    const viewByAttributes = bucketAttributes(viewBucket);
    const stackByAttribute = bucketAttribute(stackBucket);

    const stackByAttributeLocalIdentifier = stackByAttribute
        ? stackByAttribute.attribute.localIdentifier
        : undefined;

    const viewByAttributeLocalIdentifiers = viewByAttributes && viewByAttributes.map(attributeId);

    return newTwoDimensional(
        stackByAttributeLocalIdentifier ? [stackByAttributeLocalIdentifier] : [],
        viewByAttributeLocalIdentifiers ? [...viewByAttributeLocalIdentifiers, MEASUREGROUP] : [MEASUREGROUP],
    );
}

export function defaultDimensions(buckets: IBucket[]): IDimension[] {
    return newTwoDimensional([MEASUREGROUP], bucketsAttributes(buckets).map(attributeId));
}

export function stackedChartDimensions(buckets: IBucket[]): IDimension[] {
    return isStackedChart(buckets) ? stackedDimensions(buckets) : defaultDimensions(buckets);
}

export function pointyChartDimensions(buckets: IBucket[]): IDimension[] {
    return newTwoDimensional(bucketsAttributes(buckets).map(attributeId), [MEASUREGROUP]);
}

export function roundChartDimensions(buckets: IBucket[]): IDimension[] {
    const attributes = bucketsAttributes(buckets).map(attributeId);

    if (attributes.length === 0) {
        return newTwoDimensional([], [MEASUREGROUP]);
    }

    return newTwoDimensional([MEASUREGROUP], attributes);
}

export function heatmapDimensions(buckets: IBucket[]): IDimension[] {
    const view: IBucket = bucketsFind(buckets, VIEW);
    const stack: IBucket = bucketsFind(buckets, STACK);

    if (bucketIsEmpty(stack)) {
        return newTwoDimensional(bucketAttributes(view).map(attributeId), [MEASUREGROUP]);
    }

    return newTwoDimensional(
        bucketAttributes(view).map(attributeId),
        bucketAttributes(stack)
            .map(attributeId)
            .concat([MEASUREGROUP]),
    );
}

export function treemapDimensions(buckets: IBucket[]): IDimension[] {
    const attributes = bucketsAttributes(buckets);

    if (attributes.length === 1) {
        return newTwoDimensional([MEASUREGROUP], attributes.map(attributeId));
    }

    return newTwoDimensional(attributes.map(attributeId), [MEASUREGROUP]);
}
