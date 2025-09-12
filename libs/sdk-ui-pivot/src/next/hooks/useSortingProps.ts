// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { SortChangedEvent } from "ag-grid-enterprise";
import isEqual from "lodash/isEqual.js";

import { BucketNames, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useSyncSort } from "./sorting/useSyncSort.js";
import { useColumnDefs } from "../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { sanitizeTotalsFromExecutionDefinition } from "../features/aggregations/sanitization.js";
import { getSortModel } from "../features/sorting/agGridSortingApi.js";
import { sortModelToSortItems } from "../features/sorting/sortModelToSortItems.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with sorting applied.
 *
 * @alpha
 */
export function useSortingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    useSyncSort();
    const { columnDefinitionByColId } = useColumnDefs();
    const { pushData, execution, sortBy } = usePivotTableProps();

    const onSortChanged = useCallback(
        (event: SortChangedEvent) => {
            if (!pushData) {
                return;
            }

            // Get the current sort model from ag-grid
            const sortModel = getSortModel(event.api);
            const sortItems = sortModelToSortItems(sortModel, columnDefinitionByColId);

            // Sanitize totals for the ATTRIBUTE bucket as some items may be invalid
            const totals = sanitizeTotalsFromExecutionDefinition(execution.definition, sortItems);

            if (!isEqual(sortItems, sortBy)) {
                pushData({
                    properties: {
                        sortItems,
                        totals,
                        bucketType: BucketNames.ATTRIBUTE,
                    },
                });
            }
        },
        [pushData, columnDefinitionByColId, execution.definition, sortBy],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.onSortChanged) {
                throw new UnexpectedSdkError("onSortChanged is already set");
            }

            return {
                ...agGridReactProps,
                onSortChanged,
            };
        },
        [onSortChanged],
    );
}
