// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { type AgGridProps } from "../types/agGrid.js";

import { useClearCellSelection } from "./useClearCellSelection.js";

/**
 * Hook that provides AG Grid props for focus management.
 *
 * Keyboard navigation behavior (Tab/Arrow/Home/End/Page handling) is driven by the
 * static suppressKeyboardEvent / suppressHeaderKeyboardEvent callbacks living on
 * defaultColDef in AG_GRID_DEFAULT_PROPS - they are column-level (ColDef) properties,
 * not grid options, and keeping them on the stable default props avoids changing the
 * defaultColDef reference on re-renders (which would make AG Grid re-apply column
 * defaults and discard the growToFit column sizing applied on the initial render).
 *
 * This hook only wires the header-focus handler, which depends on the grid api and is
 * therefore not static:
 * - Header focus: Clears body cell selection when focus moves to header
 *
 * @alpha
 */
export function useFocusManagementProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const clearCellSelection = useClearCellSelection();

    const onHeaderFocused = useCallback(() => {
        // Clear body cell selection when header receives focus
        clearCellSelection();
    }, [clearCellSelection]);

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if (agGridReactProps.onHeaderFocused) {
                throw new UnexpectedSdkError("onHeaderFocused is already set");
            }

            return {
                ...agGridReactProps,
                onHeaderFocused,
            } as AgGridProps;
        },
        [onHeaderFocused],
    );
}
