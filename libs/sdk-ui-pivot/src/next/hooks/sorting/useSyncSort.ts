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
            );

            const currentState = agGridApi.getColumnState();
            const updatedState = currentState.map((col) => {
                return {
                    ...col,
                    sort: updatedSortModel.find((sort) => sort.colId === col.colId)?.sort ?? null,
                };
            });

            agGridApi.applyColumnState({
                state: updatedState,
            });
        }
    }, [agGridApi, sortBy, columnDefinitionByColId, columnHeadersPosition, pushData]);
}
