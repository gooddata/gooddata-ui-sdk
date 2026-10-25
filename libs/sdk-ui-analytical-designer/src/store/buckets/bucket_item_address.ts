// (C) 2026 GoodData Corporation

import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";

/**
 * ADDRESSING AND WRITING ONE PLACE INSIDE THE RAW BUCKETS SUBTREE.
 *
 * The buckets writes used to assemble a runtime path — `[bucketIndex, "items", itemIndex]` — and hand
 * it to a generic deep setter. The path was only an ENCODING; the domain concept is the ADDRESS of a
 * bucket item, and that is what {@link IBucketItemAddress} is. Every write below takes the address
 * and typed values, so a mistyped field name is a compile error rather than a silent stray key.
 *
 * TWO PROPERTIES ARE LOAD-BEARING, and both are implemented here rather than inherited:
 *
 * - STRUCTURAL SHARING: a write copies only the containers ON the addressed path. Sibling buckets,
 *   sibling items and every untouched field keep their references;
 * - NO-OP IDENTITY: when the update changes nothing, the ORIGINAL value comes back by reference. That
 *   identity IS how a buckets operation says "nothing happened" — the render paths re-derive from
 *   `data.buckets`, so a rebuilt subtree on a same-value write reopens the render-loop freeze class.
 *
 * The lookups are deliberately UNGUARDED, which is behavior the reducer suites pin: an address for an
 * item that is in no bucket is `undefined`, and the writers throw a `TypeError` on it rather than
 * silently doing nothing. Callers that must bail out instead check the address first.
 */

/** WHERE a bucket item sits: which bucket, and which slot inside that bucket's `items`. */
export interface IBucketItemAddress {
    bucketIndex: number;
    itemIndex: number;
}

/** The index of the bucket with this local identifier, or -1 when there is none. */
export function getBucketIndexInBuckets(buckets: IRawBuckets, bucketLocalIdentifier: string): number {
    return buckets.findIndex((bucket: IRawBucket) => bucket?.localIdentifier === bucketLocalIdentifier);
}

/**
 * The bucket index a write addresses, with a NEGATIVE index WRAPPED FROM THE END.
 *
 * The wrap is PRESERVED DOMAIN BEHAVIOR, not an artifact of the old path encoding: an unknown bucket
 * local identifier answers -1, which wraps to the LAST bucket, so an edit naming a bucket that is not
 * there silently edits the last one. Pinned in
 * `reducers/buckets_cluster_characterization.test.ts` ("BUCKET_TOGGLE_DUAL_AXIS on an unknown bucket
 * silently toggles the LAST bucket"). Adding a guard here would be a behavior change.
 *
 * An index still negative after wrapping (an EMPTY buckets value) addresses nothing, and the writers
 * below refuse it.
 */
export function resolveBucketIndexInBuckets(buckets: IRawBuckets, bucketLocalIdentifier: string): number {
    const index = getBucketIndexInBuckets(buckets, bucketLocalIdentifier);
    if (index >= 0) {
        return index;
    }
    const wrapped = buckets.length + index;
    return wrapped >= 0 ? wrapped : index;
}

/**
 * The bucket holding the item with this local identifier, together with the item's slot in it.
 * `index` is -1 when no bucket holds it, in which case `bucket` is `undefined`.
 */
export function getBucketItemIndexInBuckets(
    buckets: IRawBuckets,
    localIdentifier: string,
): { bucket: IRawBucket | undefined; index: number } {
    let index = -1;

    const bucket = buckets.find((b: IRawBucket) => {
        index = b?.items.findIndex(
            (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === localIdentifier,
        );
        return index >= 0;
    });

    return { bucket, index };
}

/** Where this item sits, or `undefined` when it is in no bucket. */
export function getBucketItemAddress(
    buckets: IRawBuckets,
    item: IRawBucketItem,
): IBucketItemAddress | undefined {
    const { bucket, index } = getBucketItemIndexInBuckets(buckets, item?.localIdentifier);
    if (!bucket) {
        return undefined;
    }
    return {
        // Resolved from the local identifier rather than taken from `find`, which is what the path
        // builder did: with duplicate bucket local identifiers the two can differ, and the writes
        // have always followed the FIRST match.
        bucketIndex: getBucketIndexInBuckets(buckets, bucket?.localIdentifier),
        itemIndex: index,
    };
}

/**
 * The address of an item a write has already established is there. UNGUARDED on purpose: an item that
 * is in no bucket throws a `TypeError`, which is the pinned behavior of every buckets edit that does
 * not answer `undefined` for a missing item.
 */
export function requireBucketItemAddress(buckets: IRawBuckets, item: IRawBucketItem): IBucketItemAddress {
    const address = getBucketItemAddress(buckets, item);
    if (!address) {
        throw new TypeError(
            `No bucket holds a bucket item with the local identifier "${item?.localIdentifier}".`,
        );
    }
    return address;
}

/** The item at this address. */
export function getBucketItemAt(
    buckets: IRawBuckets,
    { bucketIndex, itemIndex }: IBucketItemAddress,
): IRawBucketItem | undefined {
    return buckets[bucketIndex]?.items?.[itemIndex];
}

/**
 * Replaces one bucket with the updater's answer. Identity when the updater answers the same bucket,
 * and when the index addresses no bucket at all — the write is refused rather than extending the
 * array or writing a stray negative own property.
 */
export function updateBucketAt(
    buckets: IRawBuckets,
    bucketIndex: number,
    updater: (bucket: IRawBucket) => IRawBucket,
): IRawBuckets {
    if (bucketIndex < 0 || bucketIndex >= buckets.length) {
        return buckets;
    }

    const bucket = buckets[bucketIndex];
    const nextBucket = updater(bucket);
    if (nextBucket === bucket) {
        return buckets;
    }

    const nextBuckets = buckets.slice();
    nextBuckets[bucketIndex] = nextBucket;
    return nextBuckets;
}

/**
 * Applies an update to EVERY bucket, keeping the buckets array itself when no bucket changed. The
 * lazy copy is the point: `Array.prototype.map` allocates a new array even when every element maps to
 * itself, and these transformers run on paths that fire per render.
 */
export function updateEveryBucket(
    buckets: IRawBuckets,
    updater: (bucket: IRawBucket, index: number) => IRawBucket,
): IRawBuckets {
    let nextBuckets: IRawBucket[] | undefined;

    for (let i = 0; i < buckets.length; i += 1) {
        const bucket = buckets[i];
        const nextBucket = updater(bucket, i);
        if (nextBucket !== bucket) {
            nextBuckets ??= buckets.slice();
            nextBuckets[i] = nextBucket;
        }
    }

    return nextBuckets ?? buckets;
}

/**
 * Applies an update to every item of ONE bucket, keeping both the items array and the bucket when
 * nothing changed.
 */
export function updateEveryBucketItem(
    bucket: IRawBucket,
    updater: (item: IRawBucketItem, index: number) => IRawBucketItem,
): IRawBucket {
    const items = bucket?.items;
    if (items == null) {
        return bucket;
    }

    let nextItems: IRawBucketItem[] | undefined;

    for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const nextItem = updater(item, i);
        if (nextItem !== item) {
            nextItems ??= items.slice();
            nextItems[i] = nextItem;
        }
    }

    return nextItems ? { ...bucket, items: nextItems } : bucket;
}

/** Replaces one bucket's `items`. Identity when the collection is the one already there. */
export function setBucketItems(bucket: IRawBucket, items: IRawBucketItem[]): IRawBucket {
    if (bucket?.items === items) {
        return bucket;
    }
    return { ...bucket, items };
}

/**
 * Replaces the items of the bucket at `bucketIndex` with the updater's answer. The updater is handed
 * the items as they are, INCLUDING `undefined` for a bucket carrying no `items` key — the add path
 * relies on that to seed the first item.
 */
export function updateBucketItemsAt(
    buckets: IRawBuckets,
    bucketIndex: number,
    updater: (items: IRawBucketItem[] | undefined) => IRawBucketItem[],
): IRawBuckets {
    return updateBucketAt(buckets, bucketIndex, (bucket) => setBucketItems(bucket, updater(bucket?.items)));
}

/**
 * Replaces the ONE item at `address` with the updater's answer. Identity when the updater answers the
 * same item. Throws a `TypeError` on an `undefined` address, which is the unguarded-lookup behavior
 * the bucket-item edits are pinned on.
 */
export function updateBucketItemAt(
    buckets: IRawBuckets,
    { bucketIndex, itemIndex }: IBucketItemAddress,
    updater: (item: IRawBucketItem) => IRawBucketItem,
): IRawBuckets {
    return updateBucketAt(buckets, bucketIndex, (bucket) => {
        const items = bucket?.items;
        if (items == null || itemIndex < 0 || itemIndex >= items.length) {
            return bucket;
        }

        const nextItem = updater(items[itemIndex]);
        if (nextItem === items[itemIndex]) {
            return bucket;
        }

        const nextItems = items.slice();
        nextItems[itemIndex] = nextItem;
        return { ...bucket, items: nextItems };
    });
}

/**
 * Puts `item` in the slot at `address`, EXTENDING the bucket's items when the index is past the end.
 * Identity when that slot already holds it.
 *
 * The extension is LOAD-BEARING, not a slip: a same-bucket swap computes both addresses against the
 * ORIGINAL buckets, so when the first write DELETES a slot the second one addresses an index the
 * shortened collection no longer has, and the item lands at the end. Pinned in
 * `buckets_item_writers.test.ts` ("a refused same-bucket swap shifts indices").
 */
export function replaceBucketItemAt(
    buckets: IRawBuckets,
    { bucketIndex, itemIndex }: IBucketItemAddress,
    item: IRawBucketItem,
): IRawBuckets {
    return updateBucketAt(buckets, bucketIndex, (bucket) => {
        const items = bucket?.items;
        if (items == null || itemIndex < 0) {
            return bucket;
        }
        if (itemIndex < items.length && items[itemIndex] === item) {
            return bucket;
        }

        const nextItems = items.slice();
        nextItems[itemIndex] = item;
        return { ...bucket, items: nextItems };
    });
}

/** Takes the item at `address` out of its bucket, closing the gap. */
export function removeBucketItemAt(
    buckets: IRawBuckets,
    { bucketIndex, itemIndex }: IBucketItemAddress,
): IRawBuckets {
    return updateBucketAt(buckets, bucketIndex, (bucket) => {
        const items = bucket?.items;
        if (items == null || itemIndex < 0 || itemIndex >= items.length) {
            return bucket;
        }

        const nextItems = items.slice();
        nextItems.splice(itemIndex, 1);
        return { ...bucket, items: nextItems };
    });
}

/**
 * Inserts `item` into a bucket's items at `index`. A copy-then-splice, because `Array.splice` mutates
 * the array it is called on and these arrays are state.
 */
export function insertBucketItem(
    items: IRawBucketItem[] | undefined,
    index: number,
    item: IRawBucketItem,
): IRawBucketItem[] {
    if (items == null) {
        return [item];
    }
    const nextItems = [...items];
    nextItems.splice(index, 0, item);
    return nextItems;
}
