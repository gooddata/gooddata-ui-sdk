// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { SortChangedEvent } from "ag-grid-enterprise";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { sortModelToSortItems } from "../features/sorting/sortModelToSortItems.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { AgGridProps } from "../types/agGrid.js";
import { getSortModel } from "../features/sorting/agGridSortingApi.js";
import { useColumnDefs } from "../context/ColumnDefsContext.js";

/**
 * Returns ag-grid props with sorting applied.
 *
 * @alpha
 */
export function useSortingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { columnDefinitionByColId } = useColumnDefs();
    const { pushData } = usePivotTableProps();

    const onSortChanged = useCallback(
        (event: SortChangedEvent) => {
            if (!pushData) {
                return;
            }

            // Get the current sort model from ag-grid
            const sortModel = getSortModel(event.api);
            const sortItems = sortModelToSortItems(sortModel, columnDefinitionByColId);

            pushData({
                properties: {
                    sortItems,
                },
            });
        },
        [pushData, columnDefinitionByColId],
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
