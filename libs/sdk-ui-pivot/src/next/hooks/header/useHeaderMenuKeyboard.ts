// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { type AgGridHeaderGroupParams, type AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Hook that handles Alt + Down Arrow key press on header cells to open the menu.
 *
 * AG Grid manages focus on the header cell wrapper element, not on our custom
 * header component's clickable areas. This hook attaches a keydown listener to
 * the AG Grid header cell wrapper to handle Alt + Down Arrow key presses.
 *
 * When Alt + Down Arrow is pressed on a focused header cell:
 * - Opens the header menu
 * - Focus automatically moves to the first menu option (handled by UiMenu)
 *
 * @param params - AG Grid header params containing eGridHeader reference
 * @param onOpenMenu - Callback to open the menu
 * @param hasMenuItems - Whether the header has menu items to show
 *
 * @internal
 */
export function useHeaderMenuKeyboard(
    params: AgGridHeaderParams | AgGridHeaderGroupParams,
    onOpenMenu: () => void,
    hasMenuItems: boolean,
): void {
    useEffect(() => {
        if (!hasMenuItems) {
            return;
        }

        // params.eGridHeader is provided by AG Grid and points to our custom header component
        const headerElement = params.eGridHeader;
        if (!headerElement) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt + Down Arrow opens the menu
            if (e.altKey && (e.key === "ArrowDown" || e.key === "Down")) {
                e.preventDefault();
                e.stopPropagation();
                onOpenMenu();
            }
        };

        headerElement.addEventListener("keydown", handleKeyDown);
        return () => {
            headerElement.removeEventListener("keydown", handleKeyDown);
        };
    }, [params, onOpenMenu, hasMenuItems]);
}
