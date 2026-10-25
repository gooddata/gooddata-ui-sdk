// (C) 2026 GoodData Corporation

import { type ObjRef, isObjRef } from "@gooddata/sdk-model";

import { type IMeasureValueFilter, type IRankingFilter } from "../../filter_bar/filter_bar_types.js";

/**
 * Which filters depend on which bucket items. This is the subtlest logic in the buckets cluster: get
 * it wrong in one direction and a filter the user configured silently disappears; get it wrong in the
 * other and a filter survives pointing at slicing that is no longer in the insight, which re-points
 * the ranking at the REMAINING attributes — a wrong result, not an error.
 */

/** Resolves a removed bucket item's local identifier to its catalog ObjRef, or null. */
export type BucketItemRefResolver = (localIdentifier: string) => ObjRef | null;

/**
 * True when removing the bucket item `localIdentifier` must take the ranking filter with it.
 *
 * The improved ranking filter handles its "out of" attributes like the measure value filter
 * dimensionality (promoted to catalog refs on bucket removal, removed only when nothing survives), so
 * they are not a hard dependency here. The classic ranking filter references its single bucket
 * attribute by local id and must be removed together with it.
 */
export function isReferencedByRankingFilter(
    rankingFilter: IRankingFilter,
    localIdentifier: string,
    improvedRankingFilter: boolean,
): boolean {
    if (!rankingFilter) {
        return false;
    }
    const { measureLocalIdentifier, attributes } = rankingFilter;
    if (measureLocalIdentifier === localIdentifier) {
        return true;
    }
    if (improvedRankingFilter) {
        return false;
    }
    return attributes?.includes(localIdentifier) ?? false;
}

/**
 * A dimensionality-bearing filter survives the loss of bucket slicing when its granularity is defined
 * independently of the buckets: it is removed only if it relies purely on now-gone bucket slicing, i.e. it
 * has dimensionality and none of it is an ObjRef (catalog) item. Empty dimensionality is never a reason to
 * remove — the filter simply has no granularity constraint. Shared by the measure value and ranking filters.
 */
export function reliesPurelyOnBucketSlicing(dimensionality: Array<string | ObjRef> | undefined): boolean {
    return !!dimensionality?.length && !dimensionality.some((item) => isObjRef(item));
}

/**
 * The filters to drop once the insight has no slicing bucket items left at all.
 *
 * The classic ranking filter has no catalog/empty-granularity support, so it is always removed when the
 * slicing it ranked out of disappears. The improved ranking filter follows the same rule as the MVF: it
 * survives on catalog ("out of" ObjRef) or empty granularity, and is removed only when it relies purely
 * on now-gone bucket slicing.
 */
export function findFiltersRelyingOnSlicedInsight(
    rankingFilter: IRankingFilter,
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>,
    improvedRankingFilter: boolean,
): string[] {
    const filtersToRemove = measureValueFilters
        .filter((filter) => reliesPurelyOnBucketSlicing(filter.dimensionality))
        .map((filter) => filter.localIdentifier);

    const removeRankingFilter =
        !!rankingFilter &&
        (improvedRankingFilter ? reliesPurelyOnBucketSlicing(rankingFilter.attributes) : true);

    return [...filtersToRemove, ...(removeRankingFilter ? [rankingFilter.localIdentifier] : [])];
}

/**
 * Rewrites a dimensionality-like list (the measure value filter `dimensionality` or the ranking filter
 * `attributes`) when bucket items are removed: a removed bucket attribute/date is promoted to
 * its catalog ObjRef (so the owning filter survives without that bucket item), or kept as its local
 * identifier when the ObjRef cannot be resolved (handled later by filter validation / slicing-based
 * removal). Catalog ObjRefs and non-removed bucket items are kept as-is.
 *
 * `resolveRef` is consulted ONLY for entries that are both a local identifier and being removed —
 * the state lookups behind it are not cheap, and asking for anything else would be a change in
 * behavior, not just in cost.
 *
 * @returns the rewritten list and whether anything changed.
 */
export function convertRemovedDimensionalityRefs(
    items: Array<string | ObjRef>,
    bucketItemsToRemove: string[],
    resolveRef: BucketItemRefResolver,
): { items: Array<string | ObjRef>; changed: boolean } {
    const updated = items.map((item) => {
        // Catalog attributes (ObjRef) and bucket items that are not being removed stay as-is.
        if (typeof item !== "string" || !bucketItemsToRemove.includes(item)) {
            return item;
        }
        // Promote to the catalog ObjRef when resolvable; otherwise keep the local identifier.
        return resolveRef(item) ?? item;
    });

    const changed = updated.some((item, index) => item !== items[index]);
    return { items: updated, changed };
}
