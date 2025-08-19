// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import {
    enableDefaultTextWrappingForCells,
    enableDefaultTextWrappingForHeaders,
} from "../features/textWrapping/agGridTextWrappingOptions.js";
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
                mergedProps = enableDefaultTextWrappingForHeaders(mergedProps);
            }

            if (wrapText) {
                mergedProps = enableDefaultTextWrappingForCells(mergedProps);
            }

            return mergedProps;
        },
        [wrapHeaderText, wrapText],
    );
}
