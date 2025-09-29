// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { sortItemsToSortModel } from "../../features/sorting/sortItemsToSortModel.js";

/**
 * Sync sortBy coming from props to ag-grid state.
 *
 * @internal
 */
export function useSyncSort() {
    const { config, sortBy, pushData } = usePivotTableProps();
    const { columnDefinitionByColId } = useColumnDefs();
    const { columnHeadersPosition } = config;

    const { agGridApi } = useAgGridApi();

    useEffect(() => {
        if (agGridApi) {
            const updatedSortModel = sortItemsToSortModel(
                sortBy,
                columnDefinitionByColId,
                columnHeadersPosition,
            ).filter(Boolean);

            const currentState = agGridApi.getColumnState();
            const updatedState = currentState.map((col) => {
                const sortModelItem = updatedSortModel.find((sort) => sort.colId === col.colId);
                const sortIndex = sortModelItem ? updatedSortModel.indexOf(sortModelItem) : undefined;

                return {
                    ...col,
                    sort: sortModelItem?.sort ?? null,
                    // Apply sortIndex to preserve multi-sort order
                    ...(sortIndex !== undefined && { sortIndex }),
                };
            });

            agGridApi.applyColumnState({
                state: updatedState,
                // Clear sorts for columns not in the sort model
                defaultState: { sort: null },
            });
        }
    }, [agGridApi, sortBy, columnDefinitionByColId, columnHeadersPosition, pushData]);
}
