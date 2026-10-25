// (C) 2019-2026 GoodData Corporation

import { createSelector } from "reselect";

import { areObjRefsEqual, idRef, isComputedAttributeRef } from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE } from "../../../constants/bucket.js";
import { normalizeDraggedItemType } from "../../../models/bucket_rules.js";
import { selectSupportsMultipleDateFilters } from "../../../selectors/backend_capabilities_selector.js";
import { getAllMeasureBucketItems } from "../../../selectors/buckets_selector.js";
import {
    getConfig,
    getFilterItemsWithoutAdditionalDateAttributes,
    getItemsLimit,
} from "../../../store/filter_bar/filter_bar_selector.js";
import {
    FilterBar,
    type IFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";

// itemType is a plain string: the dropped item is the loose catalog currency (ICatalogEntry)
export type IIsAllowedToDrop = (cacheItemIdentifier: string, itemType: string) => boolean;

/**
 * Gets the underlying metric identifier for a bucket-based measure value filter.
 * For bucket measures, the `attribute` field contains the metric identifier (e.g., "aaeFKXFYiCc0").
 */
const getBucketMeasureMetricIdentifier = (
    filter: IMeasureValueFilter,
    bucketMeasures: IRawBucketItems,
): string | undefined => {
    const bucketMeasure = bucketMeasures.find(
        (measure) => measure.localIdentifier === filter.measureLocalIdentifier,
    );
    return bucketMeasure?.attribute;
};

export const isAllowedToDrop = createSelector(
    getFilterItemsWithoutAdditionalDateAttributes,
    getConfig,
    selectSupportsMultipleDateFilters,
    getAllMeasureBucketItems,
    (filterItems, filterBarConfig, supportsMultipleDateFilters, bucketMeasures): IIsAllowedToDrop => {
        const filter = supportsMultipleDateFilters
            ? (item: IFilter) => FilterBar.isAttributeFilter(item) || FilterBar.isMeasureValueFilter(item)
            : (item: IFilter) =>
                  FilterBar.isDateFilter(item) ||
                  FilterBar.isAttributeFilter(item) ||
                  FilterBar.isMeasureValueFilter(item);

        return (cacheItemIdentifier, itemType): boolean => {
            // a computed attribute filters like the attribute it is, and no `accepts` list names it
            const draggedType = normalizeDraggedItemType(itemType);
            const isAccepted = filterBarConfig.acceptedTypes.some((type) => type === draggedType);
            const isWithinLimit = filterBarConfig.itemsLimit > filterItems.length;

            // For measure filters, check if a measure filter for this measure already exists
            if (itemType === "metric") {
                const measureFilterExists = filterItems.some((item) => {
                    if (!FilterBar.isMeasureValueFilter(item)) {
                        return false;
                    }

                    if (FilterBar.isBucketMeasureValueFilter(item)) {
                        // For bucket-based filters, look up the bucket measure's underlying metric identifier
                        const metricIdentifier = getBucketMeasureMetricIdentifier(item, bucketMeasures);
                        return metricIdentifier === cacheItemIdentifier;
                    }

                    // For catalog-based filters, compare the measureRef directly
                    return areObjRefsEqual(item.measureRef, idRef(cacheItemIdentifier));
                });
                return isAccepted && isWithinLimit && !measureFilterExists;
            }

            // measure value filters carry no cacheItemIdentifier, so they never hold the dropped item.
            // The identifier alone is ambiguous: a regular and a computed attribute may share one, so
            // a match only counts when the KINDS agree too - the dropped item says its kind through
            // itemType, an existing filter through its displayFormRef.
            const isComputedAttributeDrop = itemType === COMPUTED_ATTRIBUTE;
            const notPresent = filterItems.filter(filter).every((item) => {
                if (FilterBar.isMeasureValueFilter(item)) {
                    return true;
                }
                if (item.cacheItemIdentifier !== cacheItemIdentifier) {
                    return true;
                }
                // a date filter has no display form ref, so it reads as "not computed" and keeps
                // the plain identifier comparison it always had
                const isComputedAttributeItem =
                    FilterBar.isAttributeFilter(item) && isComputedAttributeRef(item.displayFormRef);
                return isComputedAttributeItem !== isComputedAttributeDrop;
            });

            return isAccepted && isWithinLimit && notPresent;
        };
    },
);

export const canAcceptMoreItems = createSelector(
    getFilterItemsWithoutAdditionalDateAttributes,
    getItemsLimit,
    (filterItems, itemsLimit) => filterItems.length < itemsLimit,
);
