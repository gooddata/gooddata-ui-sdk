// (C) 2019 GoodData Corporation

import {
    IBucket,
    IDimension,
    IAttribute,
    attributeId,
    bucketsAttributes,
    bucketAttributes,
} from "@gooddata/sdk-model";
import { ATTRIBUTE, STACK, VIEW } from "../../constants/bucketNames";
import { MEASUREGROUP } from "../../constants/dimensions";

function isStackedChart(buckets: IBucket[]) {
    return buckets.some(bucket => bucket.localIdentifier === STACK && bucket.items.length > 0);
}

function stackedDimensions(buckets: IBucket[]): IDimension[] {
    const viewBucket = buckets.find(bucket => bucket.localIdentifier === ATTRIBUTE);
    const stackBucket = buckets.find(bucket => bucket.localIdentifier === STACK);

    const viewByAttributes = viewBucket && (viewBucket.items as IAttribute[]);
    const stackByAttribute = stackBucket && (stackBucket.items[0] as IAttribute);

    const stackByAttributeLocalIdentifier = stackByAttribute
        ? stackByAttribute.attribute.localIdentifier
        : undefined;

    const viewByAttributeLocalIdentifiers = viewByAttributes && viewByAttributes.map(attributeId);

    return [
        {
            itemIdentifiers: stackByAttributeLocalIdentifier ? [stackByAttributeLocalIdentifier] : [],
        },
        {
            itemIdentifiers: viewByAttributeLocalIdentifiers
                ? [...viewByAttributeLocalIdentifiers, MEASUREGROUP]
                : [MEASUREGROUP],
        },
    ];
}

export function defaultDimensions(buckets: IBucket[]): IDimension[] {
    return [
        {
            itemIdentifiers: [MEASUREGROUP],
        },
        {
            itemIdentifiers: bucketsAttributes(buckets).map(attributeId),
        },
    ];
}

export function stackedChartDimensions(buckets: IBucket[]): IDimension[] {
    return isStackedChart(buckets) ? stackedDimensions(buckets) : defaultDimensions(buckets);
}

export function pointyChartDimensions(buckets: IBucket[]): IDimension[] {
    return [
        {
            itemIdentifiers: bucketsAttributes(buckets).map(attributeId),
        },
        {
            itemIdentifiers: [MEASUREGROUP],
        },
    ];
}

export function roundChartDimensions(buckets: IBucket[]): IDimension[] {
    const attributes = bucketsAttributes(buckets).map(attributeId);

    if (attributes.length === 0) {
        return [
            {
                itemIdentifiers: [],
            },
            {
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [MEASUREGROUP],
        },
        {
            itemIdentifiers: attributes,
        },
    ];
}

export function heatmapDimensions(buckets: IBucket[]): IDimension[] {
    const view: IBucket = buckets.find(bucket => bucket.localIdentifier === VIEW);
    const stack: IBucket = buckets.find(bucket => bucket.localIdentifier === STACK);

    const hasNoStacks = !stack || !stack.items || stack.items.length === 0;

    if (hasNoStacks) {
        return [
            {
                itemIdentifiers: bucketAttributes(view).map(attributeId),
            },
            {
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(view).map(attributeId),
        },
        {
            itemIdentifiers: bucketAttributes(stack)
                .map(attributeId)
                .concat([MEASUREGROUP]),
        },
    ];
}
