// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { uniqWith } from "lodash-es";

import { type ITotal } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { orderTotals } from "../../features/aggregations/ordering.js";
import { areTotalsSameDefinition, withInheritedAlias } from "../../features/aggregations/totals.js";
import { useIsTransposed } from "../shared/useIsTransposed.js";

/**
 * Manages totals updates and communicates changes externally.
 * Follows the same pattern as useUpdateTextWrapping.
 *
 * @internal
 */
export function useUpdateTotals() {
    const { pushData } = usePivotTableProps();
    const isTransposed = useIsTransposed();

    const onUpdateTotals = useCallback(
        (currentTotals: ITotal[], totalDefinitions: ITotal[], isActive: boolean, isColumn: boolean) => {
            if (!pushData) {
                return;
            }

            // Update total definitions based on current state
            const updatedTotals = isActive
                ? currentTotals.filter(
                      (total) =>
                          !totalDefinitions.some((definition) => areTotalsSameDefinition(definition, total)),
                  )
                : uniqWith(
                      [
                          ...currentTotals,
                          ...withInheritedAlias(currentTotals, totalDefinitions, !isColumn && isTransposed),
                      ],
                      areTotalsSameDefinition,
                  );

            // Apply consistent ordering to ensure external consumers receive properly ordered totals
            const orderedTotals = orderTotals(updatedTotals);

            // Sorting determines subtotal placement in the execution result, not whether a total is valid.
            pushData({
                properties: {
                    totals: orderedTotals,
                    bucketType: isColumn ? BucketNames.COLUMNS : BucketNames.ATTRIBUTE,
                },
            });
        },
        [pushData, isTransposed],
    );

    return {
        onUpdateTotals,
    };
}
