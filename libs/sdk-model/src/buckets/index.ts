// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { anyAttribute, AttributePredicate, IAttribute, isAttribute, idMatchAttribute } from "../attribute";
import { Identifier } from "../base";
import { anyMeasure, IMeasure, isMeasure, isMeasureDefinition, MeasurePredicate } from "../measure";

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

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type BucketPredicate = (bucket: IBucket) => boolean;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const anyBucket: BucketPredicate = _ => true;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const idMatchBucket: (id: string) => BucketPredicate = id => bucket => bucket.localIdentifier === id;

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
export function bucketIsEmpty(bucket: IBucket): boolean {
    return !bucket || bucket.items.length === 0;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketAttribute(
    bucket: IBucket,
    idOrFun: string | AttributePredicate = anyAttribute,
): IAttribute | undefined {
    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.find(compositeGuard);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketAttributes(
    bucket: IBucket,
    predicate: AttributePredicate = anyAttribute,
): IAttribute[] {
    if (!bucket) {
        return [];
    }

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketMeasures(bucket: IBucket, predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    if (!bucket) {
        return [];
    }

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IMeasure => {
        return isMeasure(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsAttributes(buckets: IBucket[]): IAttribute[] {
    return buckets.map(b => bucketAttributes(b)).reduce((acc, items) => acc.concat(items), []);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsMeasures(buckets: IBucket[], predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    return buckets.map(b => bucketMeasures(b, predicate)).reduce((acc, items) => acc.concat(items), []);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsFind(buckets: IBucket[], idOrFun: string | BucketPredicate): IBucket | undefined {
    const predicate = typeof idOrFun === "string" ? idMatchBucket(idOrFun) : idOrFun;

    return buckets.find(predicate);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsById(buckets: IBucket[], ...ids: string[]): IBucket[] {
    return buckets.filter(b => b.localIdentifier && ids.indexOf(b.localIdentifier) >= 0);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsItems(buckets: IBucket[]): AttributeOrMeasure[] {
    return buckets.reduce((acc, b) => acc.concat(b.items), [] as AttributeOrMeasure[]);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function bucketsIsEmpty(buckets: IBucket[]): boolean {
    return buckets.every(b => b.items.length === 0);
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
export function computeRatioRules<T extends AttributeOrMeasure>(
    items: T[],
    rule: ComputeRatioRule = ComputeRatioRule.SINGLE_MEASURE_ONLY,
): T[] {
    if (rule === ComputeRatioRule.ANY_MEASURE) {
        return items;
    }

    const nonEmptyMeasures = items || [];

    if (nonEmptyMeasures.length > 1 || rule === ComputeRatioRule.NEVER) {
        return nonEmptyMeasures.map(disableComputeRatio);
    }

    return items;
}

function disableComputeRatio<T extends AttributeOrMeasure>(item: T): T {
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
