// (C) 2026 GoodData Corporation

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { type IRawBucketItem } from "../../typings/buckets.js";
import { FilterBar, type IFilter } from "../filter_bar/filter_bar_types.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { syncReferencePointForBuckets } from "../reference_point/reference_point_sync.js";

import { removeFilterMarkers } from "./buckets_meta_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    type IRemoveBucketItemsCommit,
    type IRemoveBucketItemsOperationDeps,
    type IRemoveBucketItemsOperationInput,
} from "./buckets_move_operations.js";
import { getDerivedBucketItemsInBuckets } from "./buckets_read_helpers.js";
import { removeBucketItemsWithDependencies } from "./buckets_removal_helpers.js";

/**
 * FILTERS WERE REMOVED, SO THE BUCKETS FOLLOW — `SAGA_FILTERS_WERE_CHANGED`.
 *
 * It gets its own module because it is the one trigger that LOOKS narrow and is not: dropping an
 * attribute filter only clears two meta markers, but dropping a DATE filter that was comparing over
 * time purges every derived measure — which runs the whole removal chain, filter bar and notifications
 * included.
 *
 * THE FOLD IS THE CONTRACT. It does BOTH things per filter, in order, so a purge triggered by the
 * second filter sees the markers the first has already dropped — and the purge drops `autoCreated`
 * markers of its own. Computing all the markers first and purging afterwards would be observably
 * different for a removal that mixes the two kinds.
 *
 * ONE reference-point sync runs at the end rather than one per purge. That is sound for the same reason
 * the drag-out gesture's two passes collapse into one sync: every field a second sync would read is
 * overwritten by the values the fold ended with.
 */

export type IFilterRemovalInput = IRemoveBucketItemsOperationInput;
export type IFilterRemovalDeps = IRemoveBucketItemsOperationDeps;

export interface IFilterRemovalParams {
    removedFilters: ReadonlyArray<IFilter>;
}

/**
 * Every domain the removal chain decides, plus the operation's own two — except that the extended
 * reference point stays OPTIONAL here: a removal of attribute filters alone runs no purge, so the value
 * is whatever it was, and a pluggable visualization may not have answered yet.
 */
export interface IFilterRemovalResult extends Omit<IRemoveBucketItemsCommit, "extendedReferencePoint"> {
    extendedReferencePoint: IExtendedReferencePointState | undefined;
}

/**
 * Does this filter take the derived measures with it? A date filter that was comparing over time does;
 * everything else does not.
 */
function purgesDerivedMeasures(filter: IFilter): boolean {
    return (
        FilterBar.isDateFilter(filter) && filter.overTimeComparisonType !== OverTimeComparisonTypes.NOTHING
    );
}

/**
 * Drops one removed filter's meta markers. Measure value and ranking filters are skipped because they are
 * never auto-created, so they have no markers — the same exclusion `getUneditedFilters` makes.
 *
 * Identity is inherited from `removeFilterMarkers`: a removal of only measure filters answers the SAME
 * `bucketsMeta`.
 */
function dropFilterMarkers(bucketsMeta: IBucketsMetaState, filter: IFilter): IBucketsMetaState {
    if (FilterBar.isMeasureValueFilter(filter) || FilterBar.isRankingFilter(filter)) {
        return bucketsMeta;
    }

    return removeFilterMarkers(bucketsMeta, filter.cacheItemIdentifier);
}

export function applyFilterRemoval(
    input: IFilterRemovalInput,
    { removedFilters }: IFilterRemovalParams,
    deps: IFilterRemovalDeps,
): IFilterRemovalResult {
    let current: IRemoveBucketItemsOperationInput = input;

    for (const filter of removedFilters) {
        if (!filter) {
            continue;
        }

        current = { ...current, bucketsMeta: dropFilterMarkers(current.bucketsMeta, filter) };

        if (purgesDerivedMeasures(filter)) {
            const derivedLocalIdentifiers = getDerivedBucketItemsInBuckets(current.buckets).map(
                (item: IRawBucketItem) => item?.localIdentifier,
            );

            current = {
                ...current,
                ...removeBucketItemsWithDependencies(
                    current,
                    {
                        localIdentifiers: derivedLocalIdentifiers,
                        // `removeAllDerivedBucketItems` took the parameter's DEFAULT
                        notifyOnlyAboutRemovedDependencies: false,
                    },
                    deps,
                ),
            };
        }
    }

    return {
        buckets: current.buckets,
        bucketsMeta: current.bucketsMeta,
        filterBar: current.filterBar,
        bucketNotifications: current.bucketNotifications,
        extendedReferencePoint: current.extendedReferencePoint,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            current.buckets,
            current.filterBar,
            current.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}
