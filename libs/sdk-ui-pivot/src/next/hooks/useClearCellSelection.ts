// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useAgGridApi } from "../context/AgGridApiContext.js";

/**
 * Hook that provides a function to clear cell selection in the pivot table.
 *
 * @internal
 */
export function useClearCellSelection(): () => void {
    const { agGridApi } = useAgGridApi();

    return useCallback(() => {
        agGridApi?.clearCellSelection();
    }, [agGridApi]);
}
