// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { isEqual, uniqWith } from "lodash-es";

import { type ITotal, bucketsFind, sanitizeBucketTotals } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { orderTotals } from "../../features/aggregations/ordering.js";

/**
 * Manages totals updates and communicates changes externally.
 * Follows the same pattern as useUpdateTextWrapping.
 *
 * @internal
 */
export function useUpdateTotals() {
    const { pushData, execution } = usePivotTableProps();

    const onUpdateTotals = useCallback(
        (currentTotals: ITotal[], totalDefinitions: ITotal[], isActive: boolean, isColumn: boolean) => {
            if (!pushData) {
                return;
            }

            // Update total definitions based on current state
            const updatedTotals = isActive
                ? currentTotals.filter((total) => !totalDefinitions.some((def) => isEqual(def, total)))
                : uniqWith([...currentTotals, ...totalDefinitions], isEqual);

            // Apply consistent ordering to ensure external consumers receive properly ordered totals
            const orderedTotals = orderTotals(updatedTotals);

            if (isColumn) {
                // Column totals (COLUMNS bucket) are not affected by sorting
                pushData({
                    properties: {
                        totals: orderedTotals,
                        bucketType: BucketNames.COLUMNS,
                    },
                });
            } else {
                // Row totals (ATTRIBUTE bucket) need to be sanitized based on sorting.
                // Changing sort may cause subtotals to no longer be reasonably placed - remove them if that is the case.
                const { buckets, sortBy } = execution.definition;
                const attributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
                const sanitizedTotals = attributeBucket
                    ? sanitizeBucketTotals(attributeBucket, sortBy, orderedTotals)
                    : orderedTotals;

                pushData({
                    properties: {
                        totals: sanitizedTotals,
                        bucketType: BucketNames.ATTRIBUTE,
                    },
                });
            }
        },
        [pushData, execution],
    );

    return {
        onUpdateTotals,
    };
}
