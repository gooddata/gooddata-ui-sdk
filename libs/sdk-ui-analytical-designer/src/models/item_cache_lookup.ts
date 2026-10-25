// (C) 2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { ATTRIBUTE, COMPUTED_ATTRIBUTE } from "../constants/bucket.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

/**
 * The itemCache keys every entry as `<type>.<identifier>`, so a computed attribute lives in its OWN
 * namespace (`computedAttribute.<id>`) rather than among the attributes.
 *
 * That matters because a computed attribute is an ATTRIBUTE everywhere else in the app: it drops
 * into attribute buckets and the bucket item it produces has `type: "attribute"`. Keeping the cache
 * namespaces apart means an attribute and a computed attribute that happen to share an identifier
 * can never shadow each other, and the entry's own type stays honest. The cost is that resolving a
 * bucket item back to its catalog entry has to know which namespace to look in — which is what
 * the helpers below are for.
 *
 * Two ways to get it right, in order of preference:
 *
 * 1. When the bucket item is at hand, read the namespace off the item itself: a bucket item built
 *    from a computed attribute carries `isComputedAttribute` (see models/bucket_item.ts). This is
 *    exact - no guessing, no ambiguity. Use {@link getCacheKeyForAttributeItem}.
 * 2. When only an identifier is at hand (the MD-object transform resolving a saved display form
 *    ref, the dimensionality resolvers), search the attribute namespace FIRST and fall back to the
 *    computed attribute one. Use {@link findAttributeCacheItem}. A real attribute always wins.
 */

/**
 * The itemCache namespace a lookup addresses. Naming it makes the choice between the attribute and
 * the computed attribute namespace explicit at every call site instead of implicit in a fallback.
 */
export type ItemCacheNamespace = "attribute" | "computedAttribute" | "fact" | "metric" | "date";

/**
 * The namespace an attribute-like bucket item lives in. Derive it from the item's own flag - see
 * {@link IRawBucketItem#isComputedAttribute}.
 */
export const attributeCacheNamespace = (isComputedAttribute?: boolean): ItemCacheNamespace =>
    isComputedAttribute ? COMPUTED_ATTRIBUTE : ATTRIBUTE;

export const attributeCacheKey = (identifier: string) => `${ATTRIBUTE}.${identifier}`;

export const computedAttributeCacheKey = (identifier: string) => `${COMPUTED_ATTRIBUTE}.${identifier}`;

/**
 * The cache key for an attribute-like bucket item, taken from the item's own flag.
 *
 * @param identifier - the item's `attribute` identifier
 * @param isComputedAttribute - whether the item was built from a computed attribute
 */
export const getCacheKeyForAttributeItem = (identifier: string, isComputedAttribute?: boolean) =>
    isComputedAttribute ? computedAttributeCacheKey(identifier) : attributeCacheKey(identifier);

/**
 * Finds an attribute-like cache entry by identifier: a real attribute if there is one, otherwise a
 * computed attribute. For callers that have no bucket item to read the namespace off.
 */
export const findAttributeCacheItem = (
    itemCache: ICatalogEntries,
    identifier: string,
): ICatalogEntry | undefined =>
    itemCache?.[attributeCacheKey(identifier)] ?? itemCache?.[computedAttributeCacheKey(identifier)];

/**
 * Finds the attribute-like cache entry whose own or display-form reference matches the provided ref.
 * This keeps filters unambiguous when a regular and computed attribute share an identifier.
 *
 * A failed reference match falls back to the identifier ONLY while one namespace is populated: a
 * fabricated cache entry carries no display forms (see `toAttributeCacheItems`), so a filter on a
 * secondary display form legitimately misses the reference test and the fallback is what resolves
 * it. With BOTH namespaces populated there is nothing to break the tie, and answering the regular
 * attribute would silently bind a computed filter to a different object - so answer nothing.
 */
export const findAttributeCacheItemByRef = (
    itemCache: ICatalogEntries,
    identifier: string,
    ref: ObjRef,
): ICatalogEntry | undefined => {
    const candidates = [
        itemCache?.[attributeCacheKey(identifier)],
        itemCache?.[computedAttributeCacheKey(identifier)],
    ];
    const hasIdentifierCollision = candidates.every((item) => item !== undefined);

    const matchingCandidate = candidates.find(
        (item) =>
            item &&
            ((item.ref && areObjRefsEqual(item.ref, ref)) ||
                (item.dfRef && areObjRefsEqual(item.dfRef, ref)) ||
                item.displayForms?.some((displayForm) => areObjRefsEqual(displayForm.ref, ref))),
    );

    return (
        matchingCandidate ??
        (hasIdentifierCollision ? undefined : findAttributeCacheItem(itemCache, identifier))
    );
};
