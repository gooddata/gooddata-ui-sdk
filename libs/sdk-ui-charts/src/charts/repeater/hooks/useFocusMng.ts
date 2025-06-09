// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { FocusGridInnerElementParams } from "ag-grid-community";

/**
 * Hook that manages focus handling for the grid
 */
export function useFocusMng() {
    const switchToBrowserDefault = useCallback(() => false, []);

    const focusGridInnerElement = useCallback((params: FocusGridInnerElementParams) => {
        const firstColumn = params.api.getAllDisplayedColumns()[0];
        params.api.setFocusedHeader(firstColumn.getId());
        return true;
    }, []);

    return {
        switchToBrowserDefault,
        focusGridInnerElement,
    };
}
