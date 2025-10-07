// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { isEqual, uniqWith } from "lodash-es";

import { ITotal } from "@gooddata/sdk-model";
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
    const { pushData } = usePivotTableProps();

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
                pushData({
                    properties: {
                        totals: orderedTotals,
                        bucketType: BucketNames.ATTRIBUTE,
                    },
                });
            }
        },
        [pushData],
    );

    return {
        onUpdateTotals,
    };
}
