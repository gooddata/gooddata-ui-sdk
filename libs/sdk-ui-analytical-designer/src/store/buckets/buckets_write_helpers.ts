// (C) 2026 GoodData Corporation

import {
    type BucketItemFlag,
    enableSecondaryAxis,
    getMasterLocalIdentifier,
    isDerivedFrom,
    setBucketItemFlag,
} from "../../models/bucket_item.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../../typings/buckets.js";

import {
    type IBucketItemAddress,
    getBucketItemAddress,
    getBucketItemIndexInBuckets,
    insertBucketItem,
    removeBucketItemAt,
    replaceBucketItemAt,
    requireBucketItemAddress,
    resolveBucketIndexInBuckets,
    updateBucketAt,
    updateBucketItemAt,
    updateBucketItemsAt,
    updateEveryBucketItem,
} from "./bucket_item_address.js";

/**
 * Value-level buckets transformers and lookups for the store/buckets slice.
 *
 * Every receiver here is a buckets VALUE, never the root state. The slice's case reducers, the
 * buckets operations and `services/buckets_service.ts` share this one implementation.
 *
 * TWO BEHAVIORS ARE LOAD-BEARING (pinned in
 * reducers/test/buckets_cluster_characterization.test.ts):
 *
 * - lookups are deliberately UNGUARDED — an item that is in no bucket has no address, and the writers
 *   throw a TypeError on it, while an unknown bucket's `findIndex` of -1 WRAPS to the LAST bucket
 *   (`resolveBucketIndexInBuckets`);
 * - same-value writes keep the subtree IDENTICAL. The writes go through `bucket_item_address.ts`,
 *   whose operations answer the original value when nothing changed and copy only the containers on
 *   the addressed path. Do NOT rebuild a collection instead — `Array.prototype.map` allocates even
 *   when every element maps to itself, and losing the identity reopens the render-loop freeze class.
 */

export function getBucketItemsInBuckets(buckets: IRawBuckets): IRawBucketItems {
    // `toShallowArray` is still what makes the missing-`items` case safe: `Array.concat(undefined)`
    // would append `undefined` AS AN ITEM for a bucket with no `items` key, and every caller then reads
    // properties off it.
    return buckets.reduce<IRawBucketItem[]>(
        (acc, bucket) => acc.concat([...(bucket?.items ?? [])]),
        [],
    ) as IRawBucketItems;
}

export function findBucketItemInBuckets(buckets: IRawBuckets, localIdentifier: string): IRawBucketItem {
    return getBucketItemsInBuckets(buckets).find(
        (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === localIdentifier,
    );
}

export function findDerivedBucketItemsInBuckets(
    buckets: IRawBuckets,
    masterBucketItem: IRawBucketItem,
): IRawBucketItems {
    return getBucketItemsInBuckets(buckets).filter((bucketItem: IRawBucketItem) =>
        isDerivedFrom(bucketItem, masterBucketItem),
    ) as IRawBucketItems;
}

/**
 * Two steps on purpose, which is the lookup these writes have always done: the item is found in the
 * FLATTENED items, and its address is then resolved FROM the item. For a local identifier that is in
 * no bucket the first step answers `undefined`, and the second then matches an item carrying NO local
 * identifier — preserved behavior rather than something to rely on.
 */
function addressOfBucketItem(buckets: IRawBuckets, localIdentifier: string): IBucketItemAddress {
    return requireBucketItemAddress(buckets, findBucketItemInBuckets(buckets, localIdentifier));
}

/** Identity when the item already carries this aggregation. */
function setAggregationAt(
    buckets: IRawBuckets,
    address: IBucketItemAddress,
    aggregation: string,
): IRawBuckets {
    return updateBucketItemAt(buckets, address, (item) =>
        item.aggregation === aggregation ? item : { ...item, aggregation },
    );
}

export function renameBucketItemInBuckets(
    buckets: IRawBuckets,
    localIdentifier: string,
    title: string,
): IRawBuckets {
    const address = addressOfBucketItem(buckets, localIdentifier);

    // An empty title is not an empty alias — it DROPS the key, which is what makes the item fall back
    // to its catalog title again.
    return updateBucketItemAt(buckets, address, (item) => {
        if (title) {
            return item.alias === title ? item : { ...item, alias: title };
        }
        if (!("alias" in item)) {
            return item;
        }
        const { alias: _removed, ...withoutAlias } = item;
        return withoutAlias;
    });
}

export function setBucketItemFormatInBuckets(
    buckets: IRawBuckets,
    localIdentifier: string,
    format: string,
): IRawBuckets {
    const address = addressOfBucketItem(buckets, localIdentifier);

    return updateBucketItemAt(buckets, address, (item) =>
        item.format === format ? item : { ...item, format },
    );
}

export function setBucketItemShowAllValuesInBuckets(
    buckets: IRawBuckets,
    localIdentifier: string,
    showAllValues: boolean,
): IRawBuckets {
    const address = addressOfBucketItem(buckets, localIdentifier);

    return updateBucketItemAt(buckets, address, (item) =>
        item.showAllValues === showAllValues ? item : { ...item, showAllValues },
    );
}

/**
 * Sets `property` on the addressed item AND on every item deriving from it (same
 * masterLocalIdentifier) within the same bucket.
 */
export function setRelatedBucketItemsPropertyInBuckets(
    buckets: IRawBuckets,
    property: BucketItemFlag,
    localIdentifier: string,
    value: boolean,
): IRawBuckets {
    const { bucketIndex } = addressOfBucketItem(buckets, localIdentifier);

    // ONE pass over the bucket the item sits in: the addressed item takes the flag, and so does every
    // item in the SAME bucket deriving from it.
    return updateBucketAt(buckets, bucketIndex, (bucket) =>
        updateEveryBucketItem(bucket, (item) =>
            item?.localIdentifier === localIdentifier || getMasterLocalIdentifier(item) === localIdentifier
                ? setBucketItemFlag(item, property, value)
                : item,
        ),
    );
}

export function setBucketItemAggregationInBuckets(
    buckets: IRawBuckets,
    item: IRawBucketItem,
    value: string,
): IRawBuckets {
    let modifiedBuckets = setAggregationAt(buckets, requireBucketItemAddress(buckets, item), value);

    // The derived measures are re-found in the WRITTEN buckets, because they may sit in other buckets
    // than the master does — unlike the related-flag edit above, which is one bucket wide.
    const derivedMeasures = findDerivedBucketItemsInBuckets(modifiedBuckets, item);
    derivedMeasures.forEach((derivedMeasure) => {
        const derivedAddress = getBucketItemAddress(modifiedBuckets, derivedMeasure);
        if (derivedAddress) {
            modifiedBuckets = setAggregationAt(modifiedBuckets, derivedAddress, value);
        }
    });

    return modifiedBuckets;
}

export function changeMeasureChartTypeInBuckets(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
    chartType: string,
): IRawBuckets {
    const bucketIndex = resolveBucketIndexInBuckets(buckets, bucketLocalIdentifier);
    return updateBucketAt(buckets, bucketIndex, (bucket) =>
        bucket?.chartType === chartType ? bucket : { ...bucket, chartType },
    );
}

export function toggleDualAxisInBuckets(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
    value: boolean,
): IRawBuckets {
    const bucketIndex = resolveBucketIndexInBuckets(buckets, bucketLocalIdentifier);
    // Deliberately UNGUARDED, as it has always been: with an EMPTY buckets value the negative-index
    // wrap lands nowhere, and reading the addressed bucket's items throws a TypeError instead of the
    // toggle silently doing nothing.
    if (buckets[bucketIndex].items.length === 0) {
        return buckets;
    }

    return updateBucketAt(buckets, bucketIndex, (bucket) =>
        updateEveryBucketItem(bucket, (item) => setBucketItemFlag(item, "showOnSecondaryAxis", value)),
    );
}

// --- the item writers -------------------------------------------------------------------

/** The bucket an item currently sits in, by the item's local identifier. */
export function getBucketLocalIdentifierInBuckets(buckets: IRawBuckets, item: IRawBucketItem): string {
    const { bucket } = getBucketItemIndexInBuckets(buckets, item?.localIdentifier);
    return bucket?.localIdentifier;
}

/**
 * Appends `items` to a bucket, or inserts them at `position` when it is not negative.
 *
 * Two properties are deliberate, because both are observable and neither is obvious:
 *
 * - the items path is resolved ONCE, against the buckets value as given, so an insertion cannot
 *   re-target itself half way through the fold;
 * - with `position >= 0` every item is inserted AT THE SAME index, which REVERSES the order of a
 *   multi-item add. Only the drag-and-drop path passes a position and it always adds one item, so the
 *   reversal is unreachable today — it is kept because "add these three at index 2" has no other
 *   defined meaning here, and changing it silently would be a behavior change nothing asserts.
 */
export function addBucketItemsInBuckets(
    buckets: IRawBuckets,
    bucketLocalIdentifier: string,
    items: IRawBucketItems,
    position = -1,
): IRawBuckets {
    const bucketIndex = resolveBucketIndexInBuckets(buckets, bucketLocalIdentifier);

    return items.reduce<IRawBuckets>(
        (updatedBuckets, bucketItem) =>
            updateBucketItemsAt(updatedBuckets, bucketIndex, (bucketItems) =>
                position >= 0
                    ? insertBucketItem(bucketItems, position, bucketItem)
                    : [...(bucketItems ?? []), bucketItem],
            ),
        buckets,
    );
}

/**
 * Removes ONE bucket item wherever it sits. Identity when the local identifier is not in any bucket,
 * which is what makes the removal chain safe to fold over identifiers that earlier steps have already
 * taken out.
 */
export function removeSingleBucketItemInBuckets(buckets: IRawBuckets, localIdentifier: string): IRawBuckets {
    const bucketItem = findBucketItemInBuckets(buckets, localIdentifier);
    if (!bucketItem) {
        return buckets;
    }
    return removeBucketItemAt(buckets, requireBucketItemAddress(buckets, bucketItem));
}

/**
 * The drag-and-drop rules the swap needs from OUTSIDE the buckets subtree, as explicit arguments
 * rather than a uiConfig value: both live in the extended reference point, and the two questions are
 * asked about different buckets, which a single `uiConfig` parameter would hide.
 */
export interface ISwapBucketItemRules {
    /** does the bucket named by the FIRST argument accept an item of the second argument's type? */
    acceptsItemType: (bucketLocalIdentifier: string, itemType: string) => boolean;
    /** is the TARGET bucket currently showing its measures on the secondary axis? */
    secondaryAxisEnabled: boolean;
}

/**
 * Two different gestures behind ONE entry point, kept together because the trigger is one:
 *
 * - with a `targetBucketLocalIdentifier`, `from` MOVES to that bucket (remove, then add), picking up
 *   the target's secondary-axis setting on the way;
 * - without one, `from` and `to` SWAP in place. If the bucket `from` currently sits in does not accept
 *   `to`'s type, `from`'s slot is deleted instead of being filled with `to` — a one-way move.
 *
 * Both paths are computed against the ORIGINAL buckets and then applied IN ORDER, and that matters:
 * when both items are in the SAME bucket the delete shifts the indices the second write uses. The
 * resulting behavior is what the oracle suites pin.
 */
export function swapBucketItemInBuckets(
    buckets: IRawBuckets,
    from: IRawBucketItem,
    to: IRawBucketItem,
    targetBucketLocalIdentifier: string | undefined,
    { acceptsItemType, secondaryAxisEnabled }: ISwapBucketItemRules,
): IRawBuckets {
    if (targetBucketLocalIdentifier) {
        const movedItem = enableSecondaryAxis(from, secondaryAxisEnabled);
        const withoutMovedItem = removeSingleBucketItemInBuckets(buckets, from?.localIdentifier);
        return addBucketItemsInBuckets(withoutMovedItem, targetBucketLocalIdentifier, [movedItem]);
    }

    const fromAddress = requireBucketItemAddress(buckets, from);
    const toAddress = requireBucketItemAddress(buckets, to);
    const fromBucketLocalIdentifier = getBucketLocalIdentifierInBuckets(buckets, from);

    const withFromSlotResolved = acceptsItemType(fromBucketLocalIdentifier, to?.type)
        ? replaceBucketItemAt(buckets, fromAddress, to)
        : removeBucketItemAt(buckets, fromAddress);

    return replaceBucketItemAt(withFromSlotResolved, toAddress, from);
}
