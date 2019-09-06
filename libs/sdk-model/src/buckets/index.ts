// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { IAttribute, isAttribute } from "../attribute";
import { Identifier } from "../base";
import { IMeasure, isMeasure, isMeasureDefinition } from "../measure";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributeOrMeasure = IMeasure | IAttribute;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IBucket {
    localIdentifier?: Identifier;
    items: AttributeOrMeasure[];
}

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isBucket(obj: any): obj is IBucket {
    return !isEmpty(obj) && (obj as IBucket).items !== undefined;
}

//
// Functions
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketAttributes(bucket: IBucket): IAttribute[] {
    return bucket.items.filter(isAttribute);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsAttributes(buckets: IBucket[]): IAttribute[] {
    return buckets.map(bucketAttributes).reduce((acc, items) => acc.concat(items), []);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export enum ComputeRatioRule {
    NEVER,
    SINGLE_MEASURE_ONLY,
    ANY_MEASURE,
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function computeRatioRules(
    items: AttributeOrMeasure[],
    rule: ComputeRatioRule = ComputeRatioRule.SINGLE_MEASURE_ONLY,
): AttributeOrMeasure[] {
    if (rule === ComputeRatioRule.ANY_MEASURE) {
        return items;
    }

    const nonEmptyMeasures = items || [];

    if (nonEmptyMeasures.length > 1 || rule === ComputeRatioRule.NEVER) {
        return nonEmptyMeasures.map(disableComputeRatio);
    }

    return items;
}

function disableComputeRatio(item: AttributeOrMeasure): AttributeOrMeasure {
    if (
        isMeasure(item) &&
        isMeasureDefinition(item.measure.definition) &&
        item.measure.definition.measureDefinition.computeRatio
    ) {
        const newDefinition = { ...item.measure.definition };
        newDefinition.measureDefinition.computeRatio = false;

        const newItem = { ...item };
        newItem.measure.definition = newDefinition;

        return newItem;
    }

    return item;
}
