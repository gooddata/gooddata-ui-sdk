// (C) 2020-2022 GoodData Corporation
import { InvariantError } from "ts-invariant";

import {
    IInsightDefinition,
    insightAttributes,
    insightBuckets,
    insightSetBuckets,
    insightSorts,
} from "./index.js";
import { bucketAttributeIndex, bucketSetTotals, bucketTotals, IBucket } from "../execution/buckets/index.js";
import { isAttributeSort, isMeasureSort, ISortItem, sortEntityIds } from "../execution/base/sort.js";
import { ITotal } from "../execution/base/totals.js";
import { attributeLocalId } from "../execution/attribute/index.js";

/**
 * Makes sure the insight does not have any nonsensical data (like totals that no longer make sense, etc.), before it is saved.
 *
 * @param insight - the insight or insight definition to sanitize
 * @public
 */
export function insightSanitize<T extends IInsightDefinition>(insight: T): T {
    return removeInvalidTotalsFromInsight(insight);
}

function removeInvalidTotalsFromInsight<T extends IInsightDefinition>(insight: T): T {
    const sortItems = insightSorts(insight);

    const attributeIdentifiers = insightAttributes(insight).map(attributeLocalId);
    const sanitizedBuckets = insightBuckets(insight).map((bucket) => {
        const sanitizedTotals = sanitizeBucketTotals(bucket, sortItems).filter((total) =>
            attributeIdentifiers.includes(total.attributeIdentifier),
        );

        if (sanitizedTotals.length !== bucketTotals(bucket).length) {
            return bucketSetTotals(bucket, sanitizedTotals);
        }

        return bucket;
    });

    return insightSetBuckets(insight, sanitizedBuckets);
}

/**
 * Takes totals from a bucket and removes all subtotals if the bucket is sorted on other than the first attribute.
 *
 * @param bucket - a grouping of attributes, measures and totals to sanitize
 * @param sortItems - a specification of the sort
 * @param totals - if specified these totals instead of the bucket totals will be sanitized in regard to the bucket
 * @returns sanitized totals
 * @internal
 */
export function sanitizeBucketTotals(bucket: IBucket, sortItems: ISortItem[], totals?: ITotal[]): ITotal[] {
    const originalTotals = totals ?? bucketTotals(bucket);
    if (isSortedOnDifferentThanFirstAttributeInBucket(bucket, sortItems)) {
        return getTotalsWithoutSubtotals(originalTotals, bucket);
    } else {
        return originalTotals;
    }
}

function isSortedOnDifferentThanFirstAttributeInBucket(bucket: IBucket, sortItems: ISortItem[]): boolean {
    return sortItems.some((sortItem) => {
        if (isAttributeSort(sortItem)) {
            const attributeIdentifier = sortEntityIds(sortItem).attributeIdentifiers[0];
            const attributeIndex = bucketAttributeIndex(bucket, attributeIdentifier);
            return attributeIndex > 0;
        } else if (isMeasureSort(sortItem)) {
            return true;
        }
        throw new InvariantError(
            'Unexpected sortType, only supported sortTypes are "attributeSortItem" and "measureSortItem"',
        );
    });
}

function getTotalsWithoutSubtotals(totals: ITotal[], bucket: IBucket): ITotal[] {
    return totals.filter((total) => bucketAttributeIndex(bucket, total.attributeIdentifier) === 0);
}
