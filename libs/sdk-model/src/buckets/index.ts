// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { anyAttribute, AttributePredicate, IAttribute, idMatchAttribute, isAttribute } from "../attribute";
import { Identifier } from "../base";
import {
    anyMeasure,
    idMatchMeasure,
    IMeasure,
    isMeasure,
    measureDisableComputeRatio,
    MeasurePredicate,
} from "../measure";
import { isTotal, ITotal } from "../base/totals";

/**
 * TODO: SDK8: Add docs
 * TODO: SDK8: rename this; perhaps Item was the right name all along? :)
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
    totals?: ITotal[];
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

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributeInBucket = {
    bucket: IBucket;
    idx: number;
    attribute: IAttribute;
};

/**
 * TODO: SDK8: Add docs
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
    return !isEmpty(obj) && (obj as IBucket).items !== undefined;
}

//
// Functions
//

/**
 * Creates a new bucket with the provided id and all the specified content.
 *
 * @param id - bucket identifier
 * @param content - items to put into the bucket; attributes, measures and/or totals
 * @returns always new instance
 * @public
 */
export function newBucket(id: string, ...content: Array<AttributeOrMeasure | ITotal | undefined>): IBucket {
    const items: AttributeOrMeasure[] = [];
    const totals: ITotal[] = [];

    (content ? content : []).forEach(i => {
        if (!i) {
            return;
        }
        if (isAttribute(i) || isMeasure(i)) {
            items.push(i);
        } else if (isTotal(i)) {
            totals.push(i);
        } else {
            // TODO: SDK8: switch to invariant
            throw new Error("...");
        }
    });

    return {
        localIdentifier: id,
        items,
        totals,
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
    return !bucket || (bucket.items.length === 0 && (!bucket.totals || bucket.totals.length === 0));
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
    if (!bucket) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const compositeGuard = (obj: any): obj is IAttribute => {
        return isAttribute(obj) && predicate(obj);
    };

    return bucket.items.find(compositeGuard);
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
 * Gets all attributes and measures from the bucket.
 *
 * @param bucket - bucket to work with
 * @returns empty list if no items
 * @public
 */
export function bucketItems(bucket: IBucket): AttributeOrMeasure[] {
    if (!bucket) {
        return [];
    }

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
    if (!bucket) {
        return [];
    }

    return bucket.totals ? bucket.totals : [];
}

//
// Functions working with array of bucket
//

/**
 * Gets all attributes matching the provided predicate from a list of buckets.
 *
 * If no predicate is provided, then the function defaults to {@link anyAttribute} predicate - meaning all
 * attributes will be returned.
 *
 * @param buckets - list of buckets to get attributes from
 * @param predicate - attribute predicate; {@link anyAttribute} is default
 * @returns empty list if none match
 * @public
 */
export function bucketsAttributes(
    buckets: IBucket[],
    predicate: AttributePredicate = anyAttribute,
): IAttribute[] {
    if (!buckets || !buckets.length) {
        return [];
    }

    return buckets.map(b => bucketAttributes(b, predicate)).reduce((acc, items) => acc.concat(items), []);
}

/**
 * Gets all measures matching the provided predicate from a list of buckets.
 *
 * If no predicate is provided, then the function defaults to {@link anyMeasure} predicate - meaning all
 * measures will be returned.
 *
 * @param buckets - list of buckets to get measures from
 * @param predicate - measure predicate; {@link anyMeasure} is default
 * @returns empty list if none match
 * @public
 */
export function bucketsMeasures(buckets: IBucket[], predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    if (!buckets || !buckets.length) {
        return [];
    }

    return buckets.map(b => bucketMeasures(b, predicate)).reduce((acc, items) => acc.concat(items), []);
}

/**
 * Finds bucket matching the provided predicate in a list of buckets.
 *
 * If no predicate is provided, then the function defaults to {@link anyBucket} predicate - meaning first
 * bucket in the list will be returned.
 *
 * This function also provides convenience to find bucket by local identifier - if you pass predicate as
 * string the function will automatically create idMatchBucket predicate.
 *
 * @param buckets - list of buckets to search
 * @param idOrFun - bucket predicate or string to match bucket by local identifier; {@link anyBucket} is default
 * @public
 */
export function bucketsFind(
    buckets: IBucket[],
    idOrFun: string | BucketPredicate = anyBucket,
): IBucket | undefined {
    const predicate = typeof idOrFun === "string" ? idMatchBucket(idOrFun) : idOrFun;

    return buckets.find(predicate);
}

/**
 * Finds attribute matching the provided predicate in a list of buckets. If found, the function returns an object
 * that contains bucket where the matched attribute is stored, index within that bucket and the attribute itself.
 *
 * This function also provides convenience to find attribute by local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @remarks See {@link AttributeInBucket}
 *
 * @param buckets - list of buckets to search
 * @param idOrFun - attribute predicate or string to find attribute by local identifier; no default
 * @returns first-found attribute matching the predicate, undefined if none match
 * @public
 */
export function bucketsFindAttribute(
    buckets: IBucket[],
    idOrFun: string | AttributePredicate,
): AttributeInBucket | undefined {
    if (!buckets || !buckets.length) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const typeAgnosticPredicate = (obj: any): boolean => {
        return isAttribute(obj) && predicate(obj);
    };

    for (const bucket of buckets) {
        const idx = bucket.items.findIndex(typeAgnosticPredicate);

        if (idx >= 0) {
            const item = bucket.items[idx];
            return isAttribute(item) ? { bucket, idx, attribute: item } : undefined;
        }
    }

    return undefined;
}

/**
 * Finds measure matching the provided predicate in a list of buckets. If found, the function returns an object
 * that contains bucket where the matched measure is stored, index within that bucket and the measure itself.
 *
 * This function also provides convenience to find measure by local identifier - if you pass predicate as
 * string the function will automatically create idMatchMeasure predicate.
 *
 * @remarks See {@link MeasureInBucket}
 *
 * @param buckets - list of buckets to search
 * @param idOrFun - measure predicate or string to find measure by local identifier; no default
 * @returns first-found measure matching the predicate, undefined if none match
 * @public
 */
export function bucketsFindMeasure(
    buckets: IBucket[],
    idOrFun: string | MeasurePredicate,
): MeasureInBucket | undefined {
    if (!buckets || !buckets.length) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchMeasure(idOrFun) : idOrFun;
    const typeAgnosticPredicate = (obj: any): boolean => {
        return isMeasure(obj) && predicate(obj);
    };

    for (const bucket of buckets) {
        const idx = bucket.items.findIndex(typeAgnosticPredicate);

        if (idx >= 0) {
            const item = bucket.items[idx];
            return isMeasure(item) ? { bucket, idx, measure: item } : undefined;
        }
    }

    return undefined;
}

/**
 * Gets buckets with the provided local identifiers from a list of buckets.
 *
 * @param buckets - list of buckets to filter
 * @param ids - bucket identifiers
 * @returns empty list if none match
 * @public
 */
export function bucketsById(buckets: IBucket[], ...ids: string[]): IBucket[] {
    if (!ids || !ids.length) {
        return [];
    }

    return buckets.filter(b => b.localIdentifier && ids.indexOf(b.localIdentifier) >= 0);
}

/**
 * Gets all attributes and measures from a list of buckets.
 *
 * @param buckets - buckets to work with
 * @returns empty list if none
 * @public
 */
export function bucketsItems(buckets: IBucket[]): AttributeOrMeasure[] {
    return buckets.reduce((acc, b) => acc.concat(b.items), [] as AttributeOrMeasure[]);
}

/**
 * Gets all totals from a list of buckets
 *
 * @param buckets - buckets to work with
 * @returns empty list if none
 * @public
 */
export function bucketsTotals(buckets: IBucket[]): ITotal[] {
    return buckets.reduce((acc, b) => acc.concat(bucketTotals(b)), [] as ITotal[]);
}

/**
 * Tests whether all buckets in a list are empty (meaning neither has any items or totals defined)
 *
 * @param buckets - buckets to work with
 * @returns true if empty, false if not
 * @public
 */
export function bucketsIsEmpty(buckets: IBucket[]): boolean {
    if (!buckets || !buckets.length) {
        return true;
    }

    return buckets.every(bucketIsEmpty);
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
 * so that the computed results make sense when visualized in a chart
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
export function computeRatioRules<T extends AttributeOrMeasure>(
    items: T[],
    rule: ComputeRatioRule = ComputeRatioRule.SINGLE_MEASURE_ONLY,
): T[] {
    if (!items) {
        return [];
    }

    if (rule === ComputeRatioRule.ANY_MEASURE) {
        return items;
    }

    if (items.length > 1 || rule === ComputeRatioRule.NEVER) {
        return items.map(disableComputeRatio);
    }

    return items;
}

function disableComputeRatio<T extends AttributeOrMeasure>(item: T): T {
    if (isMeasure(item)) {
        return measureDisableComputeRatio(item) as T;
    }
    return item;
}
