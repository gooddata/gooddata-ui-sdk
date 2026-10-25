// (C) 2026 GoodData Corporation

import { CATEGORIES_OR_STACKS_IDENTIFIERS, DATE } from "../../../constants/bucket.js";
import {
    getLocalIdentifier,
    getOperandLocalIdentifiers,
    isArithmeticMeasure,
} from "../../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../../models/date_item.js";
import { type IBucketItemMetricFilter } from "../../../typings/bucket_item_filter.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IRawBucket,
    type IRawBucketItem,
} from "../../../typings/buckets.js";
import { type IDecoratedMetricFilter } from "../../../typings/measure_filters.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";

/**
 * Bucket / bucket item predicates.
 *
 * Every predicate here answers the same for a RAW bucket item and for a DECORATED one — the same
 * convention the read helpers in `models/bucket_item.ts` follow, and load-bearing:
 * `areBucketsEmpty` is called with the raw buckets by reset_button_selector and with the decorated
 * ones by the export selectors.
 */

/** Either bucket-item shape the predicates accept. */
export type AnyBucketItem = IRawBucketItem | IDecoratedBucketItem;

export function isCategoriesOrStacks(localIdentifier: string): boolean {
    return CATEGORIES_OR_STACKS_IDENTIFIERS.includes(localIdentifier);
}

/**
 * A date item as the FILTER lists spell it: identified by the date dataset attribute under either
 * key. Deliberately distinct from {@link isDateBucketItem}, which tests the bucket item type.
 * Serves bucket items, metric FILTERS and catalog entries alike — all three mark date-ness the
 * same two ways.
 */
export function isDateItem(
    item: AnyBucketItem | IBucketItemMetricFilter | IDecoratedMetricFilter | ICatalogEntry,
): boolean {
    return (
        (item as IRawBucketItem)?.attribute === DATE_DATASET_ATTRIBUTE ||
        (item as ICatalogEntry)?.identifier === DATE_DATASET_ATTRIBUTE
    );
}

/** A date bucket item: typed as a date, or carrying the date dataset attribute. */
export function isDateBucketItem(bucketItem: AnyBucketItem): boolean {
    return (bucketItem as IRawBucketItem)?.type === DATE || bucketItem?.attribute === DATE_DATASET_ATTRIBUTE;
}

export function containsDateBucketItem(bucketItems: ReadonlyArray<AnyBucketItem> = []): boolean {
    return bucketItems.some(isDateItem);
}

/**
 * True when any of the metrics carries a date filter. Throws on a metric with no `filters` at all,
 * exactly as it did before the extraction — every bucket item AD builds has the key.
 */
export function containsMetricWithDateFilter(bucketMetricItems: ReadonlyArray<AnyBucketItem> = []): boolean {
    return !!bucketMetricItems.some((metricItem) => metricItem?.filters.some(isDateItem));
}

function isBucketEmpty(bucket: IRawBucket | IDecoratedBucket): boolean {
    const items = bucket?.items;
    return (items?.length ?? 0) === 0;
}

export function areBucketsEmpty(buckets: ReadonlyArray<IRawBucket | IDecoratedBucket>): boolean {
    return !buckets.some((bucket) => !isBucketEmpty(bucket));
}

/** True when `bucketItem` is an arithmetic measure that has `operandBucketItem` as an operand. */
export function isOperandInArithmeticMeasure(
    operandBucketItem: AnyBucketItem,
    bucketItem: AnyBucketItem,
): boolean {
    if (!isArithmeticMeasure(bucketItem)) {
        return false;
    }

    return getOperandLocalIdentifiers(bucketItem).includes(getLocalIdentifier(operandBucketItem));
}
