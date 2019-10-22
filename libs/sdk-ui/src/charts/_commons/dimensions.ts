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

    const viewByAttributeLocalIdentifiers = viewByAttributes && viewByAttributes.map(attributeLocalId);

    return newTwoDimensional(
        stackByAttributeLocalIdentifier ? [stackByAttributeLocalIdentifier] : [],
        viewByAttributeLocalIdentifiers ? [...viewByAttributeLocalIdentifiers, MEASUREGROUP] : [MEASUREGROUP],
    );
}

export function defaultDimensions(def: IExecutionDefinition): IDimension[] {
    return newTwoDimensional([MEASUREGROUP], bucketsAttributes(def.buckets).map(attributeLocalId));
}

export function stackedChartDimensions(def: IExecutionDefinition): IDimension[] {
    const { buckets } = def;
    return isStackedChart(buckets) ? stackedDimensions(buckets) : defaultDimensions(def);
}

export function pointyChartDimensions(def: IExecutionDefinition): IDimension[] {
    return newTwoDimensional(bucketsAttributes(def.buckets).map(attributeLocalId), [MEASUREGROUP]);
}

export function roundChartDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets).map(attributeLocalId);

    if (attributes.length === 0) {
        return newTwoDimensional([], [MEASUREGROUP]);
    }

    return newTwoDimensional([MEASUREGROUP], attributes);
}

export function heatmapDimensions(def: IExecutionDefinition): IDimension[] {
    const view: IBucket = bucketsFind(def.buckets, VIEW);
    const stack: IBucket = bucketsFind(def.buckets, STACK);

    if (bucketIsEmpty(stack)) {
        return newTwoDimensional(bucketAttributes(view).map(attributeLocalId), [MEASUREGROUP]);
    }

    return newTwoDimensional(
        bucketAttributes(view).map(attributeLocalId),
        bucketAttributes(stack)
            .map(attributeLocalId)
            .concat([MEASUREGROUP]),
    );
}

export function treemapDimensions(def: IExecutionDefinition): IDimension[] {
    const attributes = bucketsAttributes(def.buckets);

    if (attributes.length === 1) {
        return newTwoDimensional([MEASUREGROUP], attributes.map(attributeLocalId));
    }

    return newTwoDimensional(attributes.map(attributeLocalId), [MEASUREGROUP]);
}
