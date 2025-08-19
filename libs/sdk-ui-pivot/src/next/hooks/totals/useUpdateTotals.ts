// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import isEqual from "lodash/isEqual.js";
import uniqWith from "lodash/uniqWith.js";

import { ITotal } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
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
            const newTotals = isActive
                ? currentTotals.filter((total) => !totalDefinitions.some((def) => isEqual(def, total)))
                : uniqWith([...currentTotals, ...totalDefinitions], isEqual);

            if (isColumn) {
                pushData({
                    properties: {
                        totals: newTotals,
                        bucketType: BucketNames.COLUMNS,
                    },
                });
            } else {
                // Sanitize totals for row totals (attribute bucket)
                const sanitizedTotals = sanitizeTotals(execution.definition, newTotals);

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
