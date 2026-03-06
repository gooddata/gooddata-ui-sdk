// (C) 2025-2026 GoodData Corporation

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

/**
 * Checks whether the insight contains a non-empty color bucket.
 *
 * @internal
 */
export function hasColorMeasure(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.COLOR);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}

/**
 * Checks whether the insight contains a non-empty segment bucket.
 *
 * @internal
 */
export function hasSegmentAttribute(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.SEGMENT);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}
