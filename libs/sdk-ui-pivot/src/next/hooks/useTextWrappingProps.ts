// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import {
    enableDefaultTextWrappingForCells,
    enableDefaultTextWrappingForHeaders,
} from "../features/textWrapping/agGridTextWrappingOptions.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with text wrapping applied.
 
 * @internal
 */
export function useTextWrappingProps() {
    const {
        config: {
            textWrapping: { wrapHeaderText, wrapText },
        },
    } = usePivotTableProps();

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            let mergedProps = agGridReactProps;

            if (wrapHeaderText) {
                mergedProps = enableDefaultTextWrappingForHeaders(agGridReactProps);
            }

            if (wrapText) {
                mergedProps = enableDefaultTextWrappingForCells(agGridReactProps);
            }

            return mergedProps;
        },
        [wrapHeaderText, wrapText],
    );
}
