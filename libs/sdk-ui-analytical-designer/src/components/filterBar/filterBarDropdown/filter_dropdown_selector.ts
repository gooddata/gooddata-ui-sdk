// (C) 2019-2026 GoodData Corporation

import { createSelector } from "reselect";
import { v4 as uuid } from "uuid";

import { ATTRIBUTE, FACT, METRIC } from "../../../constants/bucket.js";
import { isComputedAttributeItem } from "../../../models/bucket_item.js";
import { type IMeasuresDescriptions } from "../../../models/decorated_bucket_item.js";
import {
    findAttributeCacheItemByRef,
    getCacheKeyForAttributeItem,
} from "../../../models/item_cache_lookup.js";
import { getBucketItemsSelector, getMeasureDescriptions } from "../../../selectors/buckets_selector.js";
import { getIntl } from "../../../selectors/intl_selector.js";
import { getItemCache } from "../../../selectors/item_cache_selector.js";
import { isInsightSliced } from "../../../selectors/sliced_insight_selector.js";
import { BucketItemService } from "../../../services/bucket_item_service.js";
import {
    getFilterItems,
    getFilterItemsWithoutAdditionalDateAttributes,
} from "../../../store/filter_bar/filter_bar_selector.js";
import {
    FilterBar,
    type IAttributeFilter,
    type IFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";
import { type ICacheItem, type ICatalogEntries } from "../../../typings/state_objects.js";

import { type IFilterBarDropdownItem } from "./model/filter_bar_dropdown_item.js";

interface IAttributeBucketItems {
    attributeIdentifier: string;
    bucketItemLocalIdentifiers: string[];
}

const getUniqueAttributesMap = (attributeBucketItems: IRawBucketItems) =>
    attributeBucketItems.reduce((items: Map<string, IAttributeBucketItems>, bucketItem) => {
        const cacheKey = getCacheKeyForAttributeItem(
            bucketItem.attribute,
            isComputedAttributeItem(bucketItem),
        );
        if (!items.has(cacheKey)) {
            items.set(cacheKey, {
                attributeIdentifier: bucketItem.attribute,
                bucketItemLocalIdentifiers: [],
            });
        }
        items.get(cacheKey).bucketItemLocalIdentifiers.push(bucketItem.localIdentifier);

        return items;
    }, new Map<string, IAttributeBucketItems>());

const buildDropdownItemsForAttributeBucketItems = (
    attributesMap: Map<string, IAttributeBucketItems>,
    attributeFilters: IAttributeFilter[],
    itemCache: ICatalogEntries,
) =>
    [...attributesMap.entries()].map(([cacheKey, { attributeIdentifier, bucketItemLocalIdentifiers }]) => {
        const cacheItem = itemCache[cacheKey] as ICacheItem;
        const filterItem = attributeFilters.find((filter) => {
            if (filter.cacheItemIdentifier !== attributeIdentifier) {
                return false;
            }
            return (
                findAttributeCacheItemByRef(itemCache, attributeIdentifier, filter.displayFormRef) ===
                cacheItem
            );
        });

        return {
            id: uuid(),
            title: cacheItem.title,
            filterLocalIdentifier: filterItem ? filterItem.localIdentifier : null,
            bucketItemLocalIdentifiers,
        };
    });

const getCatalogItemTitle = (filterItem: IAttributeFilter, itemCache: ICatalogEntries): string => {
    const itemId = filterItem.cacheItemIdentifier;
    if (itemId) {
        return findAttributeCacheItemByRef(itemCache, itemId, filterItem.displayFormRef)?.title;
    } else {
        return "-";
    }
};

const buildAttributeItemForFilter = (
    filterItem: IAttributeFilter,
    itemCache: ICatalogEntries,
): IFilterBarDropdownItem => ({
    id: uuid(),
    title: getCatalogItemTitle(filterItem, itemCache),
    filterLocalIdentifier: filterItem.localIdentifier,
    bucketItemLocalIdentifiers: [],
});

const buildDropdownItemsForAttributeFilters = (
    attributesMap: Map<string, IAttributeBucketItems>,
    attributeFilters: IAttributeFilter[],
    itemCache: ICatalogEntries,
) =>
    attributeFilters
        .filter(
            (filterItem) =>
                ![...attributesMap.entries()].some(([cacheKey, { attributeIdentifier }]) => {
                    if (attributeIdentifier !== filterItem.cacheItemIdentifier) {
                        return false;
                    }
                    const cacheItem = itemCache[cacheKey] as ICacheItem | undefined;
                    return (
                        cacheItem !== undefined &&
                        findAttributeCacheItemByRef(
                            itemCache,
                            attributeIdentifier,
                            filterItem.displayFormRef,
                        ) === cacheItem
                    );
                }),
        )
        .map((filterItem) => buildAttributeItemForFilter(filterItem, itemCache));

export const getAttributeItems = createSelector(
    getBucketItemsSelector,
    getItemCache,
    getFilterItemsWithoutAdditionalDateAttributes,
    (bucketItems, itemCache, filters): ReadonlyArray<IFilterBarDropdownItem> => {
        const attributeFilters = filters.filter(FilterBar.isAttributeFilter);
        const attributeBucketItems = bucketItems.filter((item) => item.type === ATTRIBUTE);
        const attributesMap = getUniqueAttributesMap(attributeBucketItems);
        const itemsFromBuckets = buildDropdownItemsForAttributeBucketItems(
            attributesMap,
            attributeFilters,
            itemCache,
        );
        const itemsFromFilterBar = buildDropdownItemsForAttributeFilters(
            attributesMap,
            attributeFilters,
            itemCache,
        );

        return [...itemsFromBuckets, ...itemsFromFilterBar];
    },
);

const buildDropdownItemsForMeasureBucketItems = (
    measureBucketItems: IRawBucketItems,
    measureDescriptions: IMeasuresDescriptions,
    measureFilters: IMeasureValueFilter[],
) => {
    return measureBucketItems.map((bucketItem) => {
        const { localIdentifier } = bucketItem;
        const { title, alias } = measureDescriptions[localIdentifier] || {
            title: `Measure ${localIdentifier}`,
            alias: null,
        };
        const filterItem = measureFilters.find(
            (filter) => filter.measureLocalIdentifier === bucketItem.localIdentifier,
        );
        return {
            id: uuid(),
            title: alias || title,
            filterLocalIdentifier: filterItem ? filterItem.localIdentifier : null,
            bucketItemLocalIdentifiers: [localIdentifier],
        };
    });
};

const EMPTY_MEASURES: ReadonlyArray<IFilterBarDropdownItem> = [];

export const getMeasureItems = createSelector(
    isInsightSliced,
    getBucketItemsSelector,
    getMeasureDescriptions,
    getFilterItems,
    (isInsightSliced, bucketItems, measureDescriptions, filters): ReadonlyArray<IFilterBarDropdownItem> => {
        const measureBucketItems = bucketItems
            .filter((item) => item.type === METRIC || item.type === FACT)
            .filter(BucketItemService.isCompleteBucketItem);

        if (measureBucketItems.length === 0 || !isInsightSliced) {
            return EMPTY_MEASURES;
        }
        const measureFilters = filters.filter(FilterBar.isMeasureValueFilter);
        return buildDropdownItemsForMeasureBucketItems(
            measureBucketItems,
            measureDescriptions,
            measureFilters,
        );
    },
);

export const getDateItem = createSelector(
    getIntl,
    getBucketItemsSelector,
    getFilterItems,
    (intl, bucketItems, filterItems): IFilterBarDropdownItem | null => {
        const dateFilterItem: IFilter = filterItems.find(FilterBar.isDateFilter);
        const bucketItemLocalIdentifiers = bucketItems
            .filter(BucketItemService.isDateItem)
            .map((dateBucketItem) => dateBucketItem.localIdentifier);

        if (bucketItemLocalIdentifiers.length === 0 && !dateFilterItem) {
            return null;
        }

        const filterItemLocalIdentifier = dateFilterItem?.localIdentifier;

        return {
            id: uuid(),
            title: intl.formatMessage({ id: "date" }),
            filterLocalIdentifier: filterItemLocalIdentifier || null,
            bucketItemLocalIdentifiers,
        };
    },
);
