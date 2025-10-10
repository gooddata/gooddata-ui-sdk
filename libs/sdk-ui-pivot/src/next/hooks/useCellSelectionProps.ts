// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with cell selection configuration applied.
 *
 * @internal
 */
export function useCellSelectionProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { config } = usePivotTableProps();
    const enableCellSelection = config.enableCellSelection ?? true;

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (enableCellSelection) {
                return agGridReactProps;
            }

            return {
                ...agGridReactProps,
                cellSelection: false,
                suppressCellFocus: true,
            };
        },
        [enableCellSelection],
    );
}
