// (C) 2022-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
import { createSelector } from "reselect";

import { type IBucketItemDescriptor, type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import { isComputedAttributeItem } from "../../models/bucket_item.js";
import { getAttributeByIdentifier } from "../../models/decorated_bucket_item.js";
import {
    GRANULARITY_OPTIONS,
    type IGranularityOption,
    isChronologicalGranularity,
} from "../../models/granularity.js";
import { attributeCacheNamespace } from "../../models/item_cache_lookup.js";
import {
    getAllMeasureBucketItems,
    getDecoratedBucketItems,
    getMeasureDescriptions,
} from "../../selectors/buckets_selector.js";
import { getIntl } from "../../selectors/intl_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { getMeasureSequenceNumbers } from "../../selectors/measure_sequence_numbers_selector.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type ICacheItem, type ICatalogEntries } from "../../typings/state_objects.js";

export const findGranularity = (bucketItem: IDecoratedBucketItem) => {
    const granularity = bucketItem.granularity?.dateType;
    return GRANULARITY_OPTIONS.find((option) => option.dateType === granularity);
};

/**
 * Gets the attribute title from the dateDataset's attributes array that matches the granularity.
 */
const getDateAttributeTitle = (
    bucketItem: IDecoratedBucketItem,
    granularity: IGranularityOption,
): string | undefined => {
    const attributes = bucketItem.dateDataset?.attributes;
    if (!attributes) {
        return undefined;
    }
    const matchingAttribute = attributes.find((attr) => attr.dateType === granularity.dateType);
    return matchingAttribute?.title;
};

const buildDefaultDateName = (
    bucketItem: IDecoratedBucketItem,
    granularity: IGranularityOption,
    intl: IntlShape,
) => {
    // Use the attribute title from dateDataset's attributes array for consistency with bucket item display
    const attributeTitle = getDateAttributeTitle(bucketItem, granularity);
    if (attributeTitle) {
        return attributeTitle;
    }
    // Fallback to constructed format if attribute title is not available
    const granularityName = intl.formatMessage({ id: granularity.label });
    const dateDatasetName = bucketItem.dateDataset?.attributeTitle;
    return `${dateDatasetName} - ${granularityName}`;
};

/**
 * Builds descriptor for a date bucket item, including type for dimensionality icon rendering.
 * Type distinguishes chronological dates (Year, Quarter, Month, Week, Day)
 * from generic dates (Day of Week, Month of Year, etc.) for icon rendering.
 */
const buildDateInformation = (
    bucketItem: IDecoratedBucketItem,
    intl: IntlShape,
): IBucketItemDescriptor | undefined => {
    const granularityOption = findGranularity(bucketItem);
    if (!granularityOption) {
        return undefined;
    }

    const type = isChronologicalGranularity(granularityOption.dateType) ? "chronologicalDate" : "genericDate";
    const name = bucketItem.alias || buildDefaultDateName(bucketItem, granularityOption, intl);

    return {
        type,
        name,
    };
};

const buildAttributeInformation = (
    bucketItem: IDecoratedBucketItem,
    itemCache: ICatalogEntries,
): IBucketItemDescriptor => {
    const attributeId = bucketItem.attribute?.identifier;
    const cacheItem = getAttributeByIdentifier(
        attributeId,
        itemCache,
        attributeCacheNamespace(isComputedAttributeItem(bucketItem.original ?? bucketItem)),
    ) as ICacheItem;
    return {
        type: "attribute",
        name: bucketItem.alias || cacheItem?.title,
    };
};

export const getAttributeItems = createSelector(
    getDecoratedBucketItems,
    getItemCache,
    getIntl,
    (decoratedBucketItems, itemCache, intl) =>
        decoratedBucketItems
            .filter((item: IDecoratedBucketItem) => item.isDate || !item.isMeasure)
            .reduce((acc, bucketItem) => {
                const record = bucketItem.isDate
                    ? buildDateInformation(bucketItem, intl)
                    : buildAttributeInformation(bucketItem, itemCache);

                return {
                    ...acc,
                    [bucketItem.localIdentifier]: record,
                };
            }, {} as IBucketItemDescriptors),
);

export const getMeasureItems = createSelector(
    getAllMeasureBucketItems,
    getMeasureDescriptions,
    getMeasureSequenceNumbers,
    getIntl,
    (measureBucketItems, measureDescriptions, sequenceNumbers, intl) => {
        return measureBucketItems.reduce((acc, measureBucketItem) => {
            const { localIdentifier } = measureBucketItem;
            const { alias, title } = measureDescriptions[localIdentifier];
            const descriptor: IBucketItemDescriptor = {
                type: "measure",
                name: alias || title,
                sequenceNumber: intl.formatMessage(
                    { id: "bucket.title.measureSequenceNumber" },
                    { measureSequenceNumber: sequenceNumbers[localIdentifier] },
                ),
            };
            return {
                ...acc,
                [localIdentifier]: descriptor,
            };
        }, {} as IBucketItemDescriptors);
    },
);

export const getBucketItemNames = createSelector(
    getAttributeItems,
    getMeasureItems,
    (attributeItems, measureItems) => {
        return { ...attributeItems, ...measureItems };
    },
);
