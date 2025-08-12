// (C) 2025 GoodData Corporation

import {
    bucketsFind,
    IExecutionDefinition,
    ISortItem,
    ITotal,
    sanitizeBucketTotals,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

/**
 * Sanitizes provided totals based on sort items.
 *
 * @param executionDefinition - The execution definition
 * @param totals - Totals to be sanitized
 * @returns Sanitized array of totals
 */
export function sanitizeTotals(executionDefinition: IExecutionDefinition, totals: ITotal[]): ITotal[] {
    const { buckets, sortBy } = executionDefinition;
    const attributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    return attributeBucket ? sanitizeBucketTotals(attributeBucket, sortBy, totals) : [];
}

/**
 * Sanitizes totals from execution definition based on sort items.
 *
 * @param executionDefinition - The execution definition
 * @param sortItems - Array of sort items
 * @returns Sanitized array of totals
 */
export function sanitizeTotalsFromExecutionDefinition(
    executionDefinition: IExecutionDefinition,
    sortItems: ISortItem[],
): ITotal[] {
    const { buckets } = executionDefinition;
    const attributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    return attributeBucket ? sanitizeBucketTotals(attributeBucket, sortItems, attributeBucket.totals) : [];
}
