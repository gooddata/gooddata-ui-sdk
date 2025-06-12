// (C) 2019-2022 GoodData Corporation
import {
    anyBucket,
    AttributeInBucket,
    IAttributeOrMeasure,
    bucketAttributes,
    bucketIsEmpty,
    bucketItems,
    bucketMeasures,
    BucketPredicate,
    bucketTotals,
    IBucket,
    idMatchBucket,
    MeasureInBucket,
    bucketModifyItems,
    BucketItemModifications,
    bucketItemReduce,
    BucketItemReducer,
} from "./index.js";
import {
    anyAttribute,
    AttributePredicate,
    IAttribute,
    idMatchAttribute,
    isAttribute,
} from "../attribute/index.js";
import { anyMeasure, idMatchMeasure, IMeasure, isMeasure, MeasurePredicate } from "../measure/index.js";
import { ITotal } from "../base/totals.js";
import flatMap from "lodash/flatMap.js";
import { invariant } from "ts-invariant";
import identity from "lodash/identity.js";
import findIndex from "lodash/findIndex.js";

/**
 * Gets all attributes matching the provided predicate from a list of buckets.
 *
 * @remarks
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
    invariant(buckets, "buckets must be specified");

    if (!buckets.length) {
        return [];
    }

    return flatMap(buckets, (b) => bucketAttributes(b, predicate));
}

/**
 * Gets all measures matching the provided predicate from a list of buckets.
 *
 * @remarks
 * If no predicate is provided, then the function defaults to {@link anyMeasure} predicate - meaning all
 * measures will be returned.
 *
 * @param buckets - list of buckets to get measures from
 * @param predicate - measure predicate; {@link anyMeasure} is default
 * @returns empty list if none match
 * @public
 */
export function bucketsMeasures(buckets: IBucket[], predicate: MeasurePredicate = anyMeasure): IMeasure[] {
    invariant(buckets, "buckets must be specified");

    if (!buckets.length) {
        return [];
    }

    return flatMap(buckets, (b) => bucketMeasures(b, predicate));
}

/**
 * Finds bucket matching the provided predicate in a list of buckets.
 *
 * @remarks
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
    invariant(buckets, "buckets must be specified");

    const predicate = typeof idOrFun === "string" ? idMatchBucket(idOrFun) : idOrFun;

    return buckets.find(predicate);
}

/**
 * Finds attribute matching the provided predicate in a list of buckets.
 *
 * @remarks
 * If found, the function returns an object that contains bucket where the matched attribute is stored, index within
 * that bucket and the attribute itself.
 *
 * This function also provides convenience to find attribute by local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @remarks See {@link AttributeInBucket}
 *
 * @param buckets - list of buckets to search
 * @param idOrFun - attribute predicate or string to find attribute by local identifier; defaults to {@link anyAttribute}
 * @returns first-found attribute matching the predicate, undefined if none match
 * @public
 */
export function bucketsFindAttribute(
    buckets: IBucket[],
    idOrFun: string | AttributePredicate = anyAttribute,
): AttributeInBucket | undefined {
    invariant(buckets, "buckets must be specified");

    if (!buckets.length) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;
    const typeAgnosticPredicate = (obj: unknown): boolean => {
        return isAttribute(obj) && predicate(obj);
    };

    for (const bucket of buckets) {
        const idx = findIndex(bucket.items, typeAgnosticPredicate);

        if (idx >= 0) {
            const item = bucket.items[idx];
            return isAttribute(item) ? { bucket, idx, attribute: item } : undefined;
        }
    }

    return undefined;
}

/**
 * Finds measure matching the provided predicate in a list of buckets.
 *
 * @remarks
 * If found, the function returns an object that contains bucket where the matched measure is stored, index
 * within that bucket and the measure itself.
 *
 * This function also provides convenience to find measure by local identifier - if you pass predicate as
 * string the function will automatically create idMatchMeasure predicate.
 *
 * @remarks See {@link MeasureInBucket}
 *
 * @param buckets - list of buckets to search
 * @param idOrFun - measure predicate or string to find measure by local identifier; defaults to {@link anyMeasure}
 * @returns first-found measure matching the predicate, undefined if none match
 * @public
 */
export function bucketsFindMeasure(
    buckets: IBucket[],
    idOrFun: string | MeasurePredicate = anyMeasure,
): MeasureInBucket | undefined {
    invariant(buckets, "buckets must be specified");

    if (!buckets.length) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchMeasure(idOrFun) : idOrFun;
    const typeAgnosticPredicate = (obj: unknown): boolean => {
        return isMeasure(obj) && predicate(obj);
    };

    for (const bucket of buckets) {
        const idx = findIndex(bucket.items, typeAgnosticPredicate);

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
    invariant(buckets, "buckets must be specified");

    if (!buckets.length || !ids || !ids.length) {
        return [];
    }

    return buckets.filter((b) => b.localIdentifier && ids.indexOf(b.localIdentifier) >= 0);
}

/**
 * Gets all attributes and measures from a list of buckets.
 *
 * @param buckets - buckets to work with
 * @returns empty list if none
 * @public
 */
export function bucketsItems(buckets: IBucket[]): IAttributeOrMeasure[] {
    invariant(buckets, "buckets must be specified");

    return flatMap(buckets, (b) => bucketItems(b));
}

/**
 * Gets all totals from a list of buckets
 *
 * @param buckets - buckets to work with
 * @returns empty list if none
 * @public
 */
export function bucketsTotals(buckets: IBucket[]): ITotal[] {
    invariant(buckets, "buckets must be specified");

    return flatMap(buckets, (b) => bucketTotals(b));
}

/**
 * Tests whether all buckets in a list are empty (meaning neither has any items or totals defined)
 *
 * @param buckets - buckets to work with
 * @returns true if empty, false if not
 * @public
 */
export function bucketsIsEmpty(buckets: IBucket[]): boolean {
    invariant(buckets, "buckets must be specified");

    if (!buckets.length) {
        return true;
    }

    return buckets.every(bucketIsEmpty);
}

/**
 * Creates a new array of buckets, each bucket in the array contains modified bucket items
 * (retrieved by applying the modifications function to the bucketItem).
 *
 * @param buckets - an array of buckets, all items of each bucket in the array are applied the modification function
 * @param modifications - the modification to apply to the bucket items
 * @returns a new array of buckets, each bucket in the array contains modified bucket items
 * @public
 */
export function bucketsModifyItem(
    buckets: IBucket[],
    modifications: BucketItemModifications = identity,
): IBucket[] {
    invariant(buckets, "buckets must be specified");
    return buckets.map((bucket: IBucket): IBucket => bucketModifyItems(bucket, modifications));
}

/**
 * Creates a new array of buckets, each bucket in the array contains modified bucket items
 *
 * @param buckets - an array of buckets, array is applied the modification function
 * @param reducer - the reducer to apply to the bucket items array
 * @returns a new array of buckets, each bucket in the array contains modified bucket items
 * @public
 */
export function bucketsReduceItem(buckets: IBucket[], reducer: BucketItemReducer = identity): IBucket[] {
    invariant(buckets, "buckets must be specified");
    return buckets.map((bucket: IBucket): IBucket => bucketItemReduce(bucket, reducer));
}
