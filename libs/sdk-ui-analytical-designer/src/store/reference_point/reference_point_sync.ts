// (C) 2026 GoodData Corporation

import { type ISortItem } from "@gooddata/sdk-model";

import { type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketsMetaState } from "../buckets/buckets_meta_state.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";

import { type IRefPointFiltersBucket, type IReferencePointState } from "./reference_point_state.js";

/**
 * The reference point's SYNC — the tail of every buckets mutation, as a narrow pure helper.
 *
 * `referencePoint.buckets` takes the live buckets BY REFERENCE, the filters bucket is the one rebuilt
 * from the filter bar, and `properties.sortItems` mirrors the visualization properties. All three
 * writes are BY REFERENCE on purpose, which buckets_cluster_characterization pins.
 *
 * **The md-object validity flag is NOT here.** It is `data.isVisualizationMdObjectValid`, a leaf of
 * its own, and an OUTPUT of the operation that mutated the buckets — so each operation names it in
 * its own event payload.
 */
/**
 * Rebuilds the reference point's filters bucket out of the filter bar and the buckets meta. A LAZY
 * resolver rather than a value, because an operation must convert the two as its helpers LEFT them
 * and not as they were on entry — the removal chain rewrites both.
 *
 * Declared here rather than in the buckets cluster because it is a parameter of THIS sync.
 */
export type RefPointFiltersResolver = (
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
) => IRefPointFiltersBucket;

/**
 * The two foreign facts the sync needs, for an operation that does NOT touch the filter bar or the
 * buckets meta: both are converted once by the caller and arrive as VALUES. Every bucket-item edit is
 * of this kind — the edit changes one item and nothing else, so there is nothing for a resolver to
 * re-read.
 */
export interface IReferencePointSyncValues {
    refPointFilters: IRefPointFiltersBucket;
    sortItems: ISortItem[] | undefined;
}

/**
 * The same two facts for an operation that DOES rewrite the filter bar or the buckets meta on its way
 * through — the removal chain and everything built on it. There the conversion has to happen after the
 * rewrite, which is why the filters arrive as a LAZY RESOLVER and not as a value.
 */
export interface IReferencePointSyncDeps {
    refPointFilters: RefPointFiltersResolver;
    sortItems: ISortItem[] | undefined;
}

/**
 * The whole tail as ONE call: convert the filters, then sync. Every buckets operation ends with
 * exactly this, over the values ITS helpers produced — never over a re-read of the root.
 *
 * The md-object validity flag is deliberately NOT here (see the module note): it is an output of the
 * operation, named separately in each event payload.
 */
export function syncReferencePointForBuckets(
    referencePoint: IReferencePointState | undefined,
    buckets: IRawBuckets,
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
    { refPointFilters, sortItems }: IReferencePointSyncDeps,
): IReferencePointState {
    return syncReferencePoint(referencePoint, buckets, refPointFilters(filterBar, bucketsMeta), sortItems);
}

export function syncReferencePoint(
    referencePoint: IReferencePointState | undefined,
    buckets: IRawBuckets,
    refPointFilters: IRefPointFiltersBucket,
    sortItems: ISortItem[] | undefined,
): IReferencePointState {
    const properties = withSortItems(referencePoint, sortItems);

    // an ABSENT reference point can never satisfy this: `withSortItems` always answers an object,
    // so the `properties` comparison is false before the other two are even reached
    if (
        referencePoint?.buckets === buckets &&
        referencePoint?.filters === refPointFilters &&
        referencePoint?.properties === properties
    ) {
        return referencePoint;
    }

    return { ...referencePoint, buckets, filters: refPointFilters, properties };
}

/**
 * `sortItems` is written even when it is undefined: the KEY has to exist, because that is what
 * distinguishes "no sort" from "not answered yet" for the plug viz. Everything else in `properties`
 * is preserved, and the object identity survives when the value is already the same.
 */
function withSortItems(
    referencePoint: IReferencePointState | undefined,
    sortItems: ISortItem[] | undefined,
): IReferencePointState["properties"] {
    const properties = referencePoint?.properties;
    if (properties !== undefined && "sortItems" in properties && properties.sortItems === sortItems) {
        return properties;
    }
    return { ...properties, sortItems };
}
