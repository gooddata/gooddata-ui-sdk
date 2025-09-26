// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { isEqual, uniqWith } from "lodash-es";

import { ITotal } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { orderTotals } from "../../features/aggregations/ordering.js";
import { sanitizeTotals } from "../../features/aggregations/sanitization.js";

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
                pushData({
                    properties: {
                        totals: orderedTotals,
                        bucketType: BucketNames.COLUMNS,
                    },
                });
            } else {
                // Sanitize totals for row totals (attribute bucket) and ensure ordering is maintained
                const sanitizedTotals = orderTotals(sanitizeTotals(execution.definition, orderedTotals));

                pushData({
                    properties: {
                        totals: sanitizedTotals,
                        bucketType: BucketNames.ATTRIBUTE,
                    },
                });
            }
        },
        [pushData, execution.definition],
    );

    return {
        onUpdateTotals,
    };
}
