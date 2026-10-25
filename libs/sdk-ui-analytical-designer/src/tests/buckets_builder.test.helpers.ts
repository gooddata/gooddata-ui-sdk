// (C) 2026 GoodData Corporation

import {
    removeBucketItemAt,
    replaceBucketItemAt,
    updateBucketAt,
    updateBucketItemAt,
    updateBucketItemsAt,
} from "../store/buckets/bucket_item_address.js";
import {
    type IRawBucket,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../typings/buckets.js";

/**
 * TYPED patching of a raw BUCKETS VALUE for test fixtures — the counterpart of
 * `state_builder.test.helpers.ts` one level down, where that one stops.
 *
 * A fixture needs to say "these buckets, but with a second measure in VIEW", or "…but with that item
 * shown in percent". Each helper here says exactly one such thing, in BUCKET terminology, over the
 * REAL raw types — so an unknown field and a wrong-typed value are both compile errors, and there is
 * no runtime path to mistype.
 *
 * They are built ON the production buckets operations, which has two consequences worth knowing: a
 * fixture is written the way the app writes state, and a fixture cannot address a place the app
 * cannot address either.
 *
 * TEST-ONLY, and named so.
 */

/**
 * IDENTITY is preserved on a patch that changes nothing, matching `state_builder.test.helpers.ts`:
 * the suites assert `expect(write(value)).toBe(value)`, so a patcher that rebuilt unconditionally
 * would make every no-op look like a write.
 */
const unchanged = <T extends object>(current: T, patch: Partial<T>): boolean =>
    current != null && (Object.keys(patch) as (keyof T)[]).every((k) => current[k] === patch[k]);

/** Patches the fields of ONE bucket. */
export const withBucket = (
    buckets: IRawBuckets,
    bucketIndex: number,
    patch: Partial<IRawBucket>,
): IRawBuckets =>
    updateBucketAt(buckets, bucketIndex, (bucket) =>
        unchanged(bucket, patch) ? bucket : { ...bucket, ...patch },
    );

/**
 * Puts a whole bucket in one slot, EXTENDING the buckets value when the index is past the end — which
 * is how a fixture seeds the FIRST bucket of an initially empty reference point.
 */
export const withReplacedBucket = (
    buckets: IRawBuckets,
    bucketIndex: number,
    bucket: IRawBucket,
): IRawBuckets => {
    if (bucketIndex < 0 || (bucketIndex < buckets.length && buckets[bucketIndex] === bucket)) {
        return buckets;
    }
    const nextBuckets = buckets.slice();
    nextBuckets[bucketIndex] = bucket;
    return nextBuckets;
};

/** Takes ONE bucket out of the buckets value. */
export const withoutBucket = (buckets: IRawBuckets, bucketIndex: number): IRawBuckets =>
    bucketIndex < 0 || bucketIndex >= buckets.length
        ? buckets
        : buckets.filter((_bucket, index) => index !== bucketIndex);

/**
 * Replaces ONE bucket's items outright, MATERIALIZING the bucket when the index is past the end. The
 * materialized bucket carries nothing but its items, which is a shape no production write makes — but
 * several fixtures seed items into a buckets value that has no such slot yet, and what they are
 * testing is precisely a reader's behavior on it.
 */
export const withBucketItems = (
    buckets: IRawBuckets,
    bucketIndex: number,
    items: IRawBucketItems,
): IRawBuckets => {
    if (bucketIndex < 0) {
        return buckets;
    }
    if (bucketIndex >= buckets.length) {
        const nextBuckets = buckets.slice();
        nextBuckets[bucketIndex] = { items };
        return nextBuckets;
    }
    return updateBucketItemsAt(buckets, bucketIndex, () => items);
};

/** Adds items to the END of one bucket, which is where a drop lands them. */
export const withAddedBucketItems = (
    buckets: IRawBuckets,
    bucketIndex: number,
    ...items: IRawBucketItems
): IRawBuckets => updateBucketItemsAt(buckets, bucketIndex, (existing) => [...(existing ?? []), ...items]);

/** Patches the fields of ONE bucket item. */
export const withBucketItem = (
    buckets: IRawBuckets,
    bucketIndex: number,
    itemIndex: number,
    patch: Partial<IRawBucketItem>,
): IRawBuckets =>
    updateBucketItemAt(buckets, { bucketIndex, itemIndex }, (item) =>
        unchanged(item, patch) ? item : { ...item, ...patch },
    );

/** Puts a whole bucket item in one slot. */
export const withReplacedBucketItem = (
    buckets: IRawBuckets,
    bucketIndex: number,
    itemIndex: number,
    item: IRawBucketItem,
): IRawBuckets => replaceBucketItemAt(buckets, { bucketIndex, itemIndex }, item);

/** Takes ONE bucket item out of its bucket, closing the gap. */
export const withoutBucketItem = (
    buckets: IRawBuckets,
    bucketIndex: number,
    itemIndex: number,
): IRawBuckets => removeBucketItemAt(buckets, { bucketIndex, itemIndex });

/** Replaces ONE bucket's totals. */
export const withBucketTotals = (
    buckets: IRawBuckets,
    bucketIndex: number,
    totals: IRawBucket["totals"],
): IRawBuckets => {
    if (bucketIndex < 0) {
        return buckets;
    }
    if (bucketIndex >= buckets.length) {
        const nextBuckets = buckets.slice();
        nextBuckets[bucketIndex] = { totals };
        return nextBuckets;
    }
    return updateBucketAt(buckets, bucketIndex, (bucket) =>
        bucket?.totals === totals ? bucket : { ...bucket, totals },
    );
};

/**
 * Drops ONE bucket's `totals` KEY, rather than emptying it. Absent and empty are different to the
 * totals readers, so a fixture has to be able to say which one it means.
 */
export const withoutBucketTotals = (buckets: IRawBuckets, bucketIndex: number): IRawBuckets =>
    updateBucketAt(buckets, bucketIndex, (bucket) => {
        if (!bucket || !("totals" in bucket)) {
            return bucket;
        }
        const { totals: _dropped, ...bucketWithoutTotals } = bucket;
        return bucketWithoutTotals;
    });
