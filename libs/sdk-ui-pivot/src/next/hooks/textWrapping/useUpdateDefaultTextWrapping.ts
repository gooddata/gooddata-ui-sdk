// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { AgGridApi } from "../../types/agGrid.js";
import { ITextWrapping } from "../../types/textWrapping.js";

/**
 * Updates ag-grid's defaultColDef with text wrapping settings.
 *
 * @internal
 */
export function useUpdateDefaultTextWrapping() {
    return useCallback((gridApi: AgGridApi | undefined, textWrapping: ITextWrapping) => {
        if (!gridApi) {
            return;
        }

        const wrapText = !!textWrapping.wrapText;
        const wrapHeaderText = !!textWrapping.wrapHeaderText;

        const currentDefaultColDef = gridApi.getGridOption("defaultColDef") || {};
        const newDefaultColDef = {
            ...currentDefaultColDef,
            wrapText,
            wrapHeaderText,
        };

        gridApi.setGridOption("defaultColDef", newDefaultColDef);
    }, []);
}
