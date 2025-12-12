// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useColumnDefs } from "../context/ColumnDefsContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with pivoting applied.
 *
 * @internal
 */
export function usePivotingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { isPivoted } = useColumnDefs();

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.pivotMode) {
                throw new UnexpectedSdkError("pivotMode is already set");
            }

            return {
                ...agGridReactProps,
                pivotMode: isPivoted,
            };
        },
        [isPivoted],
    );
}
