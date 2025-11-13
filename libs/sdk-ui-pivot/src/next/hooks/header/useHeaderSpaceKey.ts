// (C) 2025 GoodData Corporation

import { type MouseEvent, useEffect } from "react";

import { AgGridHeaderGroupParams, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Hook that handles Space and Enter key press on header cells.
 *
 * AG Grid manages focus on the header cell wrapper element, not on our custom
 * header component's clickable areas. This hook attaches a keydown listener to
 * the AG Grid header cell wrapper to handle Space and Enter key presses for the specific
 * header cell only.
 *
 * - Space or Enter: Triggers sort/drill actions
 * - Shift + Space or Shift + Enter: Triggers multi-sort (when Shift is pressed)
 *
 * @param params - AG Grid header params containing eGridHeader reference
 * @param action - Handler to invoke when Space or Enter is pressed. Can accept either MouseEvent (from actual clicks) or KeyboardEvent (from keyboard)
 *
 * @internal
 */
export function useHeaderSpaceKey(
    params: AgGridHeaderParams | AgGridHeaderGroupParams,
    action: (event: MouseEvent<HTMLDivElement> | KeyboardEvent) => void,
): void {
    useEffect(() => {
        // params.eGridHeader is provided by AG Grid and points to our custom header component
        const headerElement = params.eGridHeader;
        if (!headerElement) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const isSpace = e.key === " " || e.key === "Space";
            const isEnter = e.key === "Enter";

            if (isSpace || isEnter) {
                e.preventDefault();
                e.stopPropagation();

                // Pass the actual keyboard event (which includes shiftKey state for multi-sort)
                action(e);
            }
        };

        headerElement.addEventListener("keydown", handleKeyDown);
        return () => {
            headerElement.removeEventListener("keydown", handleKeyDown);
        };
    }, [params, action]);
}
