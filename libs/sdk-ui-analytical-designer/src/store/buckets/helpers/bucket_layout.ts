// (C) 2026 GoodData Corporation

import { type IRawBucket, type IRawBucketItem } from "../../../typings/buckets.js";

/**
 * Bucket item positioning.
 *
 * When an item is replaced (a catalog item dropped onto an existing one, a derived measure swapped
 * for another comparison type), the replacement must land where the user expects: right after the
 * nearest item that PRECEDED the replaced one and is still in the bucket. Walking backwards from the
 * replaced item is what makes it robust — the replacement removes dependants too, so the immediate
 * predecessor may be gone as well.
 */

/**
 * @param removedLocalIdentifier - the item being replaced
 * @param localIdentifiersBeforeRemoval - the bucket's item local identifiers, in order, before
 * @param localIdentifiersAfterRemoval - the bucket's item local identifiers, in order, after
 * @returns the index to insert the replacement at; 0 when no preceding item survived
 */
export function findInsertionIndexForReplacedItem(
    removedLocalIdentifier: string,
    localIdentifiersBeforeRemoval: string[],
    localIdentifiersAfterRemoval: string[],
): number {
    const indexOfRemovedItemInBucket = localIdentifiersBeforeRemoval.indexOf(removedLocalIdentifier);
    const itemsBeforeRemovedItem = localIdentifiersBeforeRemoval
        .slice(0, indexOfRemovedItemInBucket)
        .reverse();

    const firstKnownNeighbourItemIndex = itemsBeforeRemovedItem
        .map((identifier: string) => localIdentifiersAfterRemoval.findIndex((value) => value === identifier))
        .find((index) => index !== -1);

    // `undefined > -1` is false, so "no surviving predecessor" falls through to the front of the
    // bucket - the same answer as an item that had no predecessor to begin with.
    return firstKnownNeighbourItemIndex > -1 ? firstKnownNeighbourItemIndex + 1 : 0;
}

/**
 * The BUCKET-level entry point of {@link findInsertionIndexForReplacedItem}. Its two parameters are
 * the bucket BEFORE and AFTER the removal.
 *
 * Both callers currently pass the SAME bucket twice — the insertion index is computed before anything
 * is removed. The two parameters are kept because the underlying rule genuinely compares two orders,
 * and collapsing them here would hide that from the next caller.
 */
export function findReplacedBucketItemInsertionIndex(
    replacedItem: IRawBucketItem,
    bucketBeforeRemoval: IRawBucket,
    bucketAfterRemoval: IRawBucket,
): number {
    return findInsertionIndexForReplacedItem(
        replacedItem?.localIdentifier,
        bucketBeforeRemoval.items.map((item) => item.localIdentifier),
        bucketAfterRemoval.items.map((item) => item.localIdentifier),
    );
}
