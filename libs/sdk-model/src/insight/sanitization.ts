// (C) 2020-2022 GoodData Corporation
import { InvariantError } from "ts-invariant";

import { IInsightDefinition, insightAttributes, insightBuckets, insightSetBuckets, insightSorts } from ".";
import { bucketAttributeIndex, bucketSetTotals, bucketTotals, IBucket } from "../execution/buckets";
import { isAttributeSort, isMeasureSort, ISortItem, sortEntityIds } from "../execution/base/sort";
import { ITotal } from "../execution/base/totals";
import { attributeLocalId } from "../execution/attribute";

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
 * Takes totals from a bucket and removes all subtotals if the bucket is sorted on a different than the first attribute.
 *
 * @param bucket - a grouping of attributes, measures and totals to sanitize
 * @param sortItems - a specification of the sort
 * @returns totals - sanitized totals
 * @internal
 */
export function sanitizeBucketTotals(bucket: IBucket, sortItems: ISortItem[]): ITotal[] {
    if (isSortedOnDifferentThanFirstAttributeInBucket(bucket, sortItems)) {
        return getBucketTotalsWithoutSubtotals(bucket);
    } else {
        return bucketTotals(bucket);
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

function getBucketTotalsWithoutSubtotals(bucket: IBucket): ITotal[] {
    return bucketTotals(bucket).filter(
        (total) => bucketAttributeIndex(bucket, total.attributeIdentifier) === 0,
    );
}
