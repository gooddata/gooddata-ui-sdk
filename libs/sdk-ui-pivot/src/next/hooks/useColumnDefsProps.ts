// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useColumnDefs } from "../context/ColumnDefsContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with column defs applied.
 *
 * @internal
 */
export function useColumnDefsProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { columnDefs } = useColumnDefs();

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if (agGridReactProps.columnDefs) {
                throw new UnexpectedSdkError("columnDefs is already set");
            }
            return {
                ...agGridReactProps,
                columnDefs,
            };
        },
        [columnDefs],
    );
}
