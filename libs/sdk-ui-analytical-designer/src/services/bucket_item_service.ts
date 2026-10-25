// (C) 2019-2026 GoodData Corporation

import { ATTRIBUTE, FACT, METRIC } from "../constants/bucket.js";
import { type IDecoratedDateDatasetItem } from "../models/date_dataset.js";
import { DATE_DATASET_ATTRIBUTE, DATE_TYPE } from "../models/date_item.js";
import { type IAppState } from "../store/types.js";
import { type IRawBucket, type IRawBucketItem } from "../typings/buckets.js";
import { type IDateDatasetAttribute } from "../typings/dataset_attribute.js";

import { findBucketItemByLocalIdentifier, getBuckets } from "./buckets_service.js";

function getItemType(state: IAppState, localIdentifier: string): string {
    const bucketItem = findBucketItemByLocalIdentifier(state, localIdentifier);
    return bucketItem?.type;
}

function getBucketLocalIdentifier(state: IAppState, localIdentifier: string): string {
    const buckets = getBuckets(state);
    const bucket = buckets.find((bucket: IRawBucket) => {
        return bucket?.items.some((item: IRawBucketItem) => {
            return item?.localIdentifier === localIdentifier;
        });
    });
    return bucket?.localIdentifier;
}

function isMeasureItem(item: IRawBucketItem) {
    return item.type === METRIC || item.type === FACT;
}

function hasFiltersSetUp(item: IRawBucketItem) {
    if (!isMeasureItem(item)) {
        return false;
    }

    return !!item.filters?.find(
        (filter) => filter.attribute === DATE_DATASET_ATTRIBUTE || filter.selectedElements.length > 0,
    );
}

function isAttributeItem(item: IRawBucketItem) {
    return item.type === ATTRIBUTE;
}

function isDateItem(item: IRawBucketItem) {
    return (
        item.attribute === DATE_DATASET_ATTRIBUTE ||
        item.identifier === DATE_DATASET_ATTRIBUTE ||
        item.type === DATE_TYPE
    );
}

function isCompleteArithmeticMeasure(item: IRawBucketItem): boolean {
    const [operandA, operandB] = item.operandLocalIdentifiers || [null, null];
    return !!operandA && !!operandB;
}

function isArithmeticMeasure(item: IRawBucketItem): boolean {
    return !!item.operandLocalIdentifiers;
}

function isCompleteBucketItem(item: IRawBucketItem): boolean {
    if (isArithmeticMeasure(item)) {
        return isCompleteArithmeticMeasure(item);
    }
    return true;
}

function getDateDatasetItemTitle(granularity: IDateDatasetAttribute, item: IDecoratedDateDatasetItem) {
    let attributeTitle: string;
    if (!granularity) {
        return "";
    }

    const granularityType = granularity.dateType;

    (item.attributes ?? []).forEach((attribute: IDateDatasetAttribute) => {
        if (granularityType === attribute.dateType) {
            attributeTitle = attribute.title;
        }
    });

    return attributeTitle;
}

export const BucketItemService = {
    getItemType,
    getBucketLocalIdentifier,
    getDateDatasetItemTitle,
    isMeasureItem,
    isAttributeItem,
    isDateItem,
    isCompleteBucketItem,
    hasFiltersSetUp,
};
