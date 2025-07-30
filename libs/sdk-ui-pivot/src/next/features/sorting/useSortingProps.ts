// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { SortChangedEvent } from "ag-grid-enterprise";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { sortModelToSortItems } from "./sortModelToSortItems.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridProps } from "../../types/agGrid.js";
import { getSortModel } from "./agGridSortingApi.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";

/**
 * Hook that provides sorting handlers for the pivot table
 *
 * @alpha
 */
export function useSortingProps(
    columnDefinitionByColId: ITableColumnDefinitionByColId,
): (agGridReactProps: AgGridProps) => AgGridProps {
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
