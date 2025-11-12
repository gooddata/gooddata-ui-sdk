// (C) 2025 GoodData Corporation

import { type MouseEvent, useEffect } from "react";

import { AgGridHeaderGroupParams, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Hook that handles Space key press on header cells.
 *
 * AG Grid manages focus on the header cell wrapper element, not on our custom
 * header component's clickable areas. This hook attaches a keydown listener to
 * the AG Grid header cell wrapper to handle Space key presses for the specific
 * header cell only.
 *
 * @param params - AG Grid header params containing eGridHeader reference
 * @param action - Handler to invoke when Space is pressed. Can accept either MouseEvent (from actual clicks) or KeyboardEvent (from Space key)
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
            if (e.key === " " || e.key === "Space") {
                e.preventDefault();
                e.stopPropagation();

                // Pass the actual keyboard event instead of creating a synthetic MouseEvent
                action(e);
            }
        };

        headerElement.addEventListener("keydown", handleKeyDown);
        return () => {
            headerElement.removeEventListener("keydown", handleKeyDown);
        };
    }, [params, action]);
}
