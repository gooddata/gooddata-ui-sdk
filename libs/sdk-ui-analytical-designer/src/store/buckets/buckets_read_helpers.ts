// (C) 2007-2026 GoodData Corporation

import { type ITotal, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { ATTRIBUTE, DATE, MEASURES, METRIC } from "../../constants/bucket.js";
import {
    isArithmeticMeasure,
    isDerived,
    isInvalidArithmeticMeasure,
    isMasterMeasure,
} from "../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import {
    type IRawBucket,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../../typings/buckets.js";
import { type IBucketItem } from "../../typings/metadata.js";

import { getBucketItemsInBuckets } from "./buckets_write_helpers.js";
import { isDateBucketItem, isOperandInArithmeticMeasure } from "./helpers/bucket_item_predicates.js";

/**
 * Value-level DERIVED READS over a buckets value. Every function here answers a question about
 * `buckets` alone; `services/buckets_service.ts` keeps a one-line selector per entry point that
 * reads the subtree and delegates here, so there is ONE implementation behind two entry points and a
 * saga operation and a component cannot drift apart.
 *
 * The field reads are OPTIONAL-CHAINED throughout because these same implementations are also handed
 * extended-reference-point buckets and caller-built bucket items, whose shapes are not guaranteed to
 * carry every field.
 */

/** Every bucket item, in bucket order, filtered by `type`. */
function getBucketItemsOfType(buckets: IRawBuckets, ...types: string[]): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter((item: IRawBucketItem) =>
        types.includes(item?.type),
    ) as IRawBucketItems;
}

export function getMeasuresInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsOfType(buckets, METRIC);
}

export function getAttributesInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsOfType(buckets, ATTRIBUTE, DATE);
}

export function getMeasuresWithoutArithmeticInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getMeasuresInBuckets(buckets).filter(
        (item: IRawBucketItem) => !isArithmeticMeasure(item),
    ) as IRawBucketItems;
}

export function getDerivedBucketItemsInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter(isDerived) as IRawBucketItems;
}

export function getMasterMeasuresInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter(isMasterMeasure) as IRawBucketItems;
}

export function findAllInvalidArithmeticMeasuresInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter((bucketItem: IRawBucketItem) =>
        isInvalidArithmeticMeasure(bucketItem),
    ) as IRawBucketItems;
}

/** Every arithmetic measure that uses `operandBucketItem` as an operand. */
export function findAllReferencingArithmeticMeasuresInBuckets(
    buckets: IRawBuckets,
    operandBucketItem: IRawBucketItem,
): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter((bucketItem: IRawBucketItem) =>
        isOperandInArithmeticMeasure(operandBucketItem, bucketItem),
    ) as IRawBucketItems;
}

/**
 * The attributes of ONE bucket, plain — the shape the totals rules consume.
 *
 * The `?? []` aligns this with {@link getBucketTotalsInBuckets}, which has always had it. No producer
 * in the package builds a bucket without an `items` key, so the difference was not reachable — but
 * `sanitizeTotals` reads `.length` off this result, and a declared `IBucketItem[]` that can answer
 * `undefined` is the kind of gap that only stays harmless until someone adds a producer.
 */
export function getBucketAttributesInBuckets(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
): IBucketItem[] {
    const attributeBucket = getBucketByLocalIdentifierInBuckets(buckets, bucketLocalIdentifier);
    return attributeBucket ? ((attributeBucket?.items as IBucketItem[]) ?? []) : [];
}

/** The totals of ONE bucket, plain; `[]` both when the bucket and when the `totals` key is absent. */
export function getBucketTotalsInBuckets(buckets: IRawBuckets, bucketLocalIdentifier: string): ITotal[] {
    const attributeBucket = getBucketByLocalIdentifierInBuckets(buckets, bucketLocalIdentifier);
    return attributeBucket ? ((attributeBucket?.totals as ITotal[]) ?? []) : [];
}

/**
 * The bucket with this local identifier, or `undefined`.
 *
 * The optional return type is deliberate: absence is ordinary here —
 * `optional_stacking_selector` guards with `|| {}` while other callers read straight through — so
 * the type has to say so rather than leave each caller to guess.
 */
export function getBucketByLocalIdentifierInBuckets(
    buckets: IRawBuckets,
    localIdentifier: string,
): IRawBucket | undefined {
    return buckets.find((bucket: IRawBucket) => bucket?.localIdentifier === localIdentifier);
}

export function getBucketIdentifierByItemIdInBuckets(buckets: IRawBuckets, itemIdentifier: string): string {
    const bucket = buckets?.find((candidate: IRawBucket) =>
        candidate?.items.find((item: IRawBucketItem) => item?.localIdentifier === itemIdentifier),
    );

    return bucket?.localIdentifier;
}

export function getBucketByBucketItemLocalIdentifierInBuckets(
    buckets: IRawBuckets,
    bucketItemLocalIdentifier: string,
): IRawBucket {
    return buckets.find((bucket: IRawBucket) =>
        bucket?.items.some(
            (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === bucketItemLocalIdentifier,
        ),
    ) as IRawBucket;
}

/**
 * The measures of the MEASURES bucket only. Wrapping the single bucket keeps ONE flattening
 * implementation rather than reaching into `items` here.
 *
 * The absent-bucket guard is explicit rather than left to the flattening: the reader this replaced
 * (`getBucketItemsFromBuckets`) carried its own `bucket ? … : []` hole-tolerance, and de-duplicating
 * it against `getBucketItemsInBuckets` — which relies on `getIn`'s null walk instead — is exactly
 * where such a guard goes missing unnoticed.
 */
export function getPrimaryMeasuresFromMeasureBucketInBuckets(buckets: IRawBuckets): IRawBucketItems {
    const measureBucket = getBucketByLocalIdentifierInBuckets(buckets, MEASURES);
    return measureBucket ? getBucketItemsInBuckets([measureBucket]) : [];
}

/** The first non-derived metric in bucket order, or null. */
export function getFirstMasterMeasureInBuckets(buckets: IRawBuckets): IRawBucketItem | null {
    return (
        buckets.reduce((found: IRawBucketItem | null, bucket: IRawBucket) => {
            // if we already found a metric, do not touch it
            if (found) {
                return found;
            }

            const items = bucket?.items;
            return items.find((item: IRawBucketItem) => item?.type === METRIC && !isDerived(item));
        }, null) || null
    );
}

export function getAttributeBucketItemsByRefInBuckets(buckets: IRawBuckets, ref: ObjRef): IBucketItem[] {
    return getAttributesInBuckets(buckets).filter((attribute: IRawBucketItem) =>
        areObjRefsEqual(attribute?.ref, ref),
    ) as IBucketItem[];
}

export function isSelectedViewByDateOfWeekGranularityInBuckets(buckets: IRawBuckets): boolean {
    return getAttributesInBuckets(buckets).some(
        (attribute: IRawBucketItem) => attribute?.granularity === GRANULARITY.WEEK,
    );
}

export function isDerivedMeasurePresentInBuckets(buckets: IRawBuckets): boolean {
    return getMeasuresInBuckets(buckets).some(isDerived);
}

/** The local identifiers of every bucket item — the validity set the sort-item rules filter against. */
export function getBucketItemLocalIdentifiersInBuckets(buckets: IRawBuckets): string[] {
    return [...(getBucketItemsInBuckets(buckets) ?? [])].map((item: IRawBucketItem) => item?.localIdentifier);
}

/**
 * The local identifiers of the SLICING bucket items — the attributes and dates an insight is broken
 * down by. Used by the removal chain to ask whether any slicing survives a removal, which decides
 * whether the dimensionality-bearing filters can keep their granularity.
 *
 * "Slicing" is exactly what {@link getAttributesInBuckets} answers (`ATTRIBUTE` + `DATE`), so this is
 * the ONE definition.
 *
 * `toShallowArray` before the map, for the same reason {@link getBucketItemLocalIdentifiersInBuckets}
 * does it: the reader it builds on PRESERVES its input's container, so a wrong-kind value would turn
 * the caller's `remaining.length === 0` test into a silent always-false instead of an error.
 */
export function getSlicingBucketItemLocalIdentifiersInBuckets(buckets: IRawBuckets): string[] {
    return [...(getAttributesInBuckets(buckets) ?? [])].map((item: IRawBucketItem) => item?.localIdentifier);
}

/** The date bucket items of any buckets family (state or extended reference point). */
export function getDateBucketItemsInBuckets(buckets: IRawBuckets): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter(isDateBucketItem) as IRawBucketItems;
}

/**
 * The date bucket items of ONE named bucket — the recommendation and shortcut operations
 * plant/re-point a date item in a specific bucket. Deliberately UNGUARDED on a missing bucket: the
 * `.filter` on the absent items throws.
 */
export function getDateBucketItemsInBucket(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
): IRawBucketItems {
    const bucket = buckets.find((candidate) => candidate?.localIdentifier === bucketLocalIdentifier);

    return bucket?.items.filter((item) => item?.attribute === DATE_DATASET_ATTRIBUTE) as IRawBucketItems;
}

export function hasDateBucketItemInBuckets(buckets: IRawBuckets): boolean {
    return (getDateBucketItemsInBuckets(buckets)?.length ?? 0) > 0;
}
