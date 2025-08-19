// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { AgGridApi } from "../../types/agGrid.js";
import { ITextWrapping } from "../../types/textWrapping.js";

/**
 * Hook to get default text wrapping state from ag-grid's defaultColDef.
 *
 * @internal
 */
export function useGetDefaultTextWrapping() {
    return useCallback((gridApi: AgGridApi | undefined, configDefaults?: ITextWrapping): ITextWrapping => {
        if (!gridApi) {
            return configDefaults ?? { wrapHeaderText: false, wrapText: false };
        }

        const defaultColDef = gridApi.getGridOption("defaultColDef") || {};

        return {
            wrapHeaderText: !!defaultColDef.wrapHeaderText,
            wrapText: !!defaultColDef.wrapText,
        };
    }, []);
}
