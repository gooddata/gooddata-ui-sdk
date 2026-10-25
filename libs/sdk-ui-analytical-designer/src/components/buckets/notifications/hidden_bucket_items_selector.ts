// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket.js";
import { getBucketsExtended } from "../../../selectors/extended_reference_point_selector.js";
import { isMdObjectValidSelector } from "../../../selectors/metadata_object_selector.js";
import { getRefPointBuckets, getRefPointFilters } from "../../../services/reference_point_service.js";
import { getFilterItemsExtended } from "../../../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../../../store/filter_bar/filter_bar_service.js";
import { FilterBar, type IFilter } from "../../../store/filter_bar/filter_bar_types.js";
import {
    type IExtendedRefPointBucket,
    type IExtendedRefPointBucketItem,
} from "../../../store/reference_point/extended_reference_point_state.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../../typings/buckets.js";

export interface IHiddenItems {
    attributes: number;
    measures: number;
    measureValueFilters: number;
    rankingFilter: boolean;
}

function getBucketItemsCount(
    buckets: ReadonlyArray<IRawBucket | IExtendedRefPointBucket> | undefined,
    itemType: string | null,
): number {
    const items = (buckets ?? []).reduce<Array<IRawBucketItem | IExtendedRefPointBucketItem>>(
        (acc, bucket) => acc.concat(bucket.items ?? []),
        [],
    );
    return items.filter((item) => itemType === null || item.type === itemType).length;
}

function getHiddenBucketItemsCount(
    referencePointBuckets: IRawBuckets,
    extendedReferencePointBuckets: IExtendedRefPointBucket[],
    bucketItemType: string | null,
): number {
    return (
        getBucketItemsCount(referencePointBuckets, bucketItemType) -
        getBucketItemsCount(extendedReferencePointBuckets, bucketItemType)
    );
}

function getNumberOfMatchedFilters(
    refPointFilters: ReturnType<typeof getRefPointFilters>,
    filterPredicate: (filterItem: IFilter) => boolean,
): number {
    if (!refPointFilters) {
        return 0;
    }
    const convertedFilters = FilterBarService.convertFromExtendedRefPointFilters(refPointFilters);
    return convertedFilters.filter(filterPredicate).length;
}

function getHiddenMatchedFiltersCount(
    refPointFilters: ReturnType<typeof getRefPointFilters>,
    extendedRefPointFilters: ReadonlyArray<IFilter>,
    filterPredicate: (filterItem: IFilter) => boolean,
): number {
    const refPointMeasureValueFilters = getNumberOfMatchedFilters(refPointFilters, filterPredicate);
    const visibleMeasureValueFilters = extendedRefPointFilters.filter(filterPredicate).length;
    return refPointMeasureValueFilters - visibleMeasureValueFilters;
}

export const hiddenBucketItemsSelector = createSelector(
    isMdObjectValidSelector,
    getRefPointBuckets,
    getBucketsExtended,
    getRefPointFilters,
    getFilterItemsExtended,
    (isMdObjectValid, refPointBuckets, extendedRefPointBuckets, refPointFilters, extendedRefPointFilters) => {
        if (!isMdObjectValid) {
            return null;
        }
        const attributesCount =
            getHiddenBucketItemsCount(refPointBuckets, extendedRefPointBuckets, ATTRIBUTE) +
            getHiddenBucketItemsCount(refPointBuckets, extendedRefPointBuckets, DATE);
        const measuresCount = getHiddenBucketItemsCount(refPointBuckets, extendedRefPointBuckets, METRIC);
        const measureValueFiltersCount = getHiddenMatchedFiltersCount(
            refPointFilters,
            extendedRefPointFilters,
            FilterBar.isMeasureValueFilter,
        );
        const rankingFiltersCount = getHiddenMatchedFiltersCount(
            refPointFilters,
            extendedRefPointFilters,
            FilterBar.isRankingFilter,
        );

        const result: IHiddenItems | null =
            attributesCount === 0 &&
            measuresCount === 0 &&
            measureValueFiltersCount === 0 &&
            rankingFiltersCount === 0
                ? null
                : {
                      attributes: attributesCount,
                      measures: measuresCount,
                      measureValueFilters: measureValueFiltersCount,
                      rankingFilter: rankingFiltersCount > 0,
                  };

        return result;
    },
);
