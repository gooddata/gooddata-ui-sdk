// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { anyAttribute, AttributePredicate, IAttribute, idMatchAttribute, isAttribute } from "../attribute";
import { Identifier } from "../../objRef";
import {
    anyMeasure,
    idMatchMeasure,
    IMeasure,
    isMeasure,
    isSimpleMeasure,
    MeasurePredicate,
} from "../measure";
import { isTotal, ITotal } from "../base/totals";
import invariant from "ts-invariant";
import { modifySimpleMeasure } from "../measure/factory";
import isArray from "lodash/isArray";
import identity from "lodash/identity";

/**
 * Type representing bucket items - which can be either measure or an attribute.
 *
 * @public
 */
export type IAttributeOrMeasure = IMeasure | IAttribute;

/**
 * Bucket is a logical, user-defined grouping of attributes, measures and totals. Buckets can be used to create
 * a new execution and to derive the result dimensionality. In the context of an existing execution, they serve
 * as metadata about the execution.
 *
 * @public
 */
export interface IBucket {
    localIdentifier?: Identifier;
    items: IAttributeOrMeasure[];
    totals?: ITotal[];
}

/**
 * Signature for bucket predicates; predicates are used by different functions to find/filter buckets according
 * to some criteria.
 *
 * @public
 */
export type BucketPredicate = (bucket: IBucket) => boolean;

/**
 * This predicate evaluates true for any bucket.
 *
 * @public
 */
export const anyBucket: BucketPredicate = (_) => true;

/**
 * Factory function for predicates that will evaluate true if bucket's id is same as the provided id.
 *
 * @public
 */
export const idMatchBucket: (id: string) => BucketPredicate = (id) => (bucket) =>
    bucket.localIdentifier === id;

/**
 * Describes exact location of attribute in a bucket.
 *
 * @public
 */
export type AttributeInBucket = {
    bucket: IBucket;
    idx: number;
    attribute: IAttribute;
};

/**
 * Describes exact location of measure in a bucket.
 *
 * @public
 */
export type MeasureInBucket = {
    bucket: IBucket;
    idx: number;
    measure: IMeasure;
};

//
// Type guards
//

/**
 * Type-guard testing whether the provided object is an instance of {@link IBucket}.
 *
 * @param obj - object to test
 * @public
 */
export function isBucket(obj: any): obj is IBucket {
    return (
        !isEmpty(obj) &&
        (obj as IBucket).localIdentifier !== undefined &&
        (obj as IBucket).items !== undefined
    );
}

//
// Functions
//

/**
 * Creates a new bucket with the provided id and all the specified content.
 *
 * @param localId - bucket identifier
 * @param content - items to put into the bucket; attributes, measures and/or totals
 * @returns always new instance
 * @public
 */
export function newBucket(
    localId: string,
    ...content: Array<IAttributeOrMeasure | ITotal | undefined>
): IBucket {
    invariant(localId, "local identifier must be specified");

    const items: IAttributeOrMeasure[] = [];
    const totals: ITotal[] = [];

    (content ? content : []).forEach((i) => {
        if (!i) {
            return;
        }
        if (isAttribute(i) || isMeasure(i)) {
            items.push(i);
        } else if (isTotal(i)) {
            totals.push(i);
        } else if (isArray(i)) {
            invariant(
                false,
                `newBucket called with an array of length ${
                    (i as any).length
                } as one of the items for bucket ${localId}.` +
                    "Please make sure that you are not trying to put an array of items into a bucket that only accepts single item.",
            );
        } else {
            invariant(false, `Contents of a bucket must be either attribute, measure or total. Got: ${i}`);
        }
    });

    const totalsProp = !isEmpty(totals) ? { totals } : {};

    return {
        localIdentifier: localId,
        items,
        ...totalsProp,
    };
}

/**
 * Tests whether the provided bucket is empty = contains no items and no totals.
 *
 * @param bucket - bucket to test
 * @returns true if empty, false if not
 * @public
 */
export function bucketIsEmpty(bucket: IBucket): boolean {
    invariant(bucket, "bucket must be specified");

    return bucket.items.length === 0 && (!bucket.totals || bucket.totals.length === 0);
}

/**
 * Gets the index of the first attribute matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning first found attribute
 * will be returned.
 *
 * This function also provides convenience to find attribute by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - attribute identifier or instance of AttributePredicate; {@link anyAttribute} predicate is default
 * @returns -1 if no matching attribute is found
 * @public
 */
export function bucketAttributeIndex(
    bucket: IBucket,
    idOrFun: string | AttributePredicate = anyAttribute,
): number {
    invariant(bucket, "bucket must be specified");

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.findIndex(compositeGuard);
}

/**
 * Gets first attribute matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning first found attribute
 * will be returned.
 *
 * This function also provides convenience to find attribute by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - attribute identifier or instance of AttributePredicate; {@link anyAttribute} predicate is default
 * @returns undefined if no matching attribute is found
 * @public
 */
export function bucketAttribute(
    bucket: IBucket,
    idOrFun: string | AttributePredicate = anyAttribute,
): IAttribute | undefined {
    const index = bucketAttributeIndex(bucket, idOrFun);
    return index >= 0 ? (bucket.items[index] as IAttribute) : undefined;
}

/**
 * Gets all attributes matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning all attributes
 * from the bucket will be returned.
 *
 * @param bucket - bucket to work with
 * @param predicate - attribute predicate; {@link anyAttribute} predicate is default
 * @returns empty list if none match
 * @public
 */
export function bucketAttributes(
    bucket: IBucket,
    predicate: AttributePredicate = anyAttribute,
): IAttribute[] {
    invariant(bucket, "bucket must be specified");

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * Gets the index of the first measure matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyMeasure predicate - meaning first found measure
 * will be returned.
 *
 * This function also provides convenience to find measure by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchMeasure predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - measure identifier or instance of MeasurePredicate; {@link anyMeasure} predicate is default
 * @returns -1 if no matching measure is found
 * @public
 */
export function bucketMeasureIndex(bucket: IBucket, idOrFun: string | MeasurePredicate = anyMeasure): number {
    invariant(bucket, "bucket must be specified");

    const predicate = typeof idOrFun === "string" ? idMatchMeasure(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IMeasure => {
        return isMeasure(obj) && predicate(obj);
    };

    return bucket.items.findIndex(compositeGuard);
}

/**
 * Gets first measure matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyMeasure predicate - meaning first found measure
 * will be returned.
 *
 * This function also provides convenience to find measure by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchMeasure predicate.
 *
 * @param bucket - bucket to to search in
 * @param idOrFun - measure identifier or instance of MeasurePredicate; {@link anyMeasure} predicate is default
 * @returns undefined if no matching measure is found
 * @public
 */
export function bucketMeasure(
    bucket: IBucket,
    idOrFun: string | MeasurePredicate = anyMeasure,
): IMeasure | undefined {
    const index = bucketMeasureIndex(bucket, idOrFun);
    return index >= 0 ? (bucket.items[index] as IMeasure) : undefined;
}

/**
 * Gets all measures matching the provided predicate from the bucket.
 *
 * If no predicate is provided, then the function defaults to anyMeasure predicate - meaning all measures from
 * the bucket will be returned.
 *
 * @param bucket - bucket to work with
 * @param predicate - measure predicate; {@link anyMeasure} predicate is default
 * @returns empty list if none match
 * @public
 */
export function bucketMeasures(bucket: IBucket, predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    invariant(bucket, "bucket must be specified");

    // need custom type-guard so as not to break type inference in filter() method
    const compositeGuard = (obj: any): obj is IMeasure => {
        return isMeasure(obj) && predicate(obj);
    };

    return bucket.items.filter(compositeGuard);
}

/**
 * Gets all attributes and measures from the bucket.
 *
 * @param bucket - bucket to work with
 * @returns empty list if no items
 * @public
 */
export function bucketItems(bucket: IBucket): IAttributeOrMeasure[] {
    invariant(bucket, "bucket must be specified");

    return bucket.items;
}

/**
 * Gets all totals from the bucket
 *
 * @param bucket - bucket to work with
 * @returns empty list if no totals
 * @public
 */
export function bucketTotals(bucket: IBucket): ITotal[] {
    invariant(bucket, "bucket must be specified");

    if (!bucket.totals) {
        return [];
    }

    return bucket.totals;
}

/**
 * Gets a new bucket that 'inherits' all data from the provided bucket but has different totals. New
 * totals will be used in the new bucket as-is, no merging with existing totals.
 *
 * @param bucket - bucket to work with
 * @param totals - new totals to apply
 * @returns new bucket
 * @public
 */
export function bucketSetTotals(bucket: IBucket, totals: ITotal[] = []): IBucket {
    invariant(bucket, "bucket must be specified");

    return {
        ...bucket,
        totals,
    };
}

/**
 * Defines possible compute ratio sanitization rules.
 *
 * @public
 */
export enum ComputeRatioRule {
    /**
     * Compute ratio must not be used in any measure
     */
    NEVER,

    /**
     * Compute ratio can be used if there is just a single measure
     */
    SINGLE_MEASURE_ONLY,

    /**
     * Compute ratio can be used on any measure
     */
    ANY_MEASURE,
}

/**
 * Applies compute ratio rule to all measures in a list - this MAY be done to sanitize measure definitions
 * so that the computed results make sense when visualized in a chart.
 *
 * The function will return a new list with updated measures according to the specified rule; see {@link ComputeRatioRule}.
 *
 * For convenience this function can work with list of measures AND attributes; attributes will be ignored
 * in processing and kept in resulting array as-is.
 *
 * @param items - list of attributes or measures to sanitize; attributes will be lef
 * @param rule - rule to apply; see {@link ComputeRatioRule}
 * @returns new list with modified measures; the original list and measures in it are left intact
 * @public
 */
export function applyRatioRule<T extends IAttributeOrMeasure>(
    items: T[],
    rule: ComputeRatioRule = ComputeRatioRule.SINGLE_MEASURE_ONLY,
): T[] {
    invariant(items, "items must be specified");

    if (rule === ComputeRatioRule.ANY_MEASURE) {
        return items;
    }

    const numberOfMeasures = items.filter(isMeasure).length;

    if (numberOfMeasures > 1 || rule === ComputeRatioRule.NEVER) {
        return items.map(disableComputeRatio);
    }

    return items;
}

/**
 * Disables compute ratio if set on a simple measure. Does not do anything for other measures.
 *
 * @param item - maybe a simple measure where compute ratio should be disabled
 * @returns an instance of measure with compute ratio disabled
 * @public
 */
export function disableComputeRatio<T extends IAttributeOrMeasure>(item: T): T {
    if (isSimpleMeasure(item)) {
        return modifySimpleMeasure(item, (m) => m.noRatio()) as T;
    }

    return item;
}

/**
 * Describes the type of the function used to modify the bucket items.
 *
 * @public
 */
export type BucketItemModifications = (bucketItem: IAttributeOrMeasure) => IAttributeOrMeasure;

/**
 * Creates a new bucket by modifying items of the provided input bucket.
 * Each item from the input bucket will be dispatched to the modification function
 * and the result of the modification will be included in the new bucket.
 *
 * Note: it is valid for the modification function to just return the original item.
 * In that case the item will be included in the bucket without modification.
 *
 * @param bucket - bucket in which all items are applied the modification function
 * @param modifications - the modification to apply to the bucket items
 * @returns new instance of bucket with modified bucket items
 * @public
 */
export function bucketModifyItems(
    bucket: IBucket,
    modifications: BucketItemModifications = identity,
): IBucket {
    invariant(bucket, "bucket must be specified");
    const items: IAttributeOrMeasure[] = bucketItems(bucket);
    return {
        ...bucket,
        items: items.map((bucketItem: IAttributeOrMeasure): IAttributeOrMeasure => modifications(bucketItem)),
    };
}
