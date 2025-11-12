// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { SuppressKeyboardEventParams } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useClearCellSelection } from "./useClearCellSelection.js";
import { AgGridProps } from "../types/agGrid.js";
import { AgGridRowData } from "../types/internal.js";

/**
 * Hook that provides AG Grid props for keyboard navigation and focus management.
 *
 * This hook handles:
 * - Tab key behavior: Tab exits the grid (browser handles it), does not navigate between cells
 * - Arrow keys: Standard cell-to-cell navigation within grid boundaries
 * - Page Up/Down: Scrolls by visible page of rows
 * - Home/End: Moves to first/last cell in current row
 * - Ctrl+Home/End: Moves to first/last cell in entire grid
 * - Header focus: Clears body cell selection when focus moves to header
 *
 * @alpha
 */
export function useFocusManagementProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const clearCellSelection = useClearCellSelection();
    /**
     * AG Grid's suppressKeyboardEvent allows us to control which keyboard events
     * AG Grid processes vs which ones should bubble up to the browser.
     *
     * Returning true = suppress AG Grid's handling, let custom handler process it
     * Returning false = let AG Grid handle the event
     */
    const suppressKeyboardEvent = useCallback(
        (params: SuppressKeyboardEventParams<AgGridRowData, string | null>): boolean => {
            const { event } = params;
            const { key } = event;

            // Prevent Space key from scrolling the page
            if (key === " " || key === "Space") {
                event.preventDefault();
            }

            // Suppress Tab - handled in onCellKeyDown (useInteractionProps.ts)
            if (key === "Tab") {
                return true;
            }

            // Suppress custom navigation keys - handled in onCellKeyDown (useInteractionProps.ts):
            // - Home/End (custom row navigation)
            // - Ctrl+Home/End (jump to first/last cell in grid)
            const isCustomNavigationKey = key === "Home" || key === "End";

            if (isCustomNavigationKey) {
                return true;
            }

            // Let AG Grid handle standard navigation keys:
            const isStandardNavigationKey =
                key === "ArrowUp" ||
                key === "ArrowDown" ||
                key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "PageUp" ||
                key === "PageDown";

            return !isStandardNavigationKey;
        },
        [],
    );

    const suppressHeaderKeyboardEvent = useCallback(
        (params: SuppressKeyboardEventParams<AgGridRowData, string | null>): boolean => {
            const { event } = params;
            const { key } = event;

            // Prevent Space key from scrolling the page
            // The actual Space key handling for actions is done in header components via useEffect
            if (key === " " || key === "Space") {
                event.preventDefault();
            }

            // Let AG Grid handle all events normally
            return false;
        },
        [],
    );

    const onHeaderFocused = useCallback(() => {
        // Clear body cell selection when header receives focus
        clearCellSelection();
    }, [clearCellSelection]);

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if ("suppressKeyboardEvent" in agGridReactProps && agGridReactProps.suppressKeyboardEvent) {
                throw new UnexpectedSdkError("suppressKeyboardEvent is already set");
            }

            if (
                "suppressHeaderKeyboardEvent" in agGridReactProps &&
                agGridReactProps.suppressHeaderKeyboardEvent
            ) {
                throw new UnexpectedSdkError("suppressHeaderKeyboardEvent is already set");
            }

            if (agGridReactProps.onHeaderFocused) {
                throw new UnexpectedSdkError("onHeaderFocused is already set");
            }

            return {
                ...agGridReactProps,
                suppressKeyboardEvent,
                suppressHeaderKeyboardEvent,
                onHeaderFocused,
            } as AgGridProps;
        },
        [suppressKeyboardEvent, suppressHeaderKeyboardEvent, onHeaderFocused],
    );
}
