// (C) 2025 GoodData Corporation

import { KeyboardEvent, useCallback } from "react";

import { useUiTreeViewEventPublisher } from "@gooddata/sdk-ui-kit";

/**
 * Common keyboard handler for the search combobox input element.
 * @internal
 */
export function useSearchKeyboard(): (event: KeyboardEvent) => void {
    const publishKeyDown = useUiTreeViewEventPublisher("keydown");

    return useCallback(
        (event: KeyboardEvent) => {
            // Ignore the Space key when the input is focused
            if (event.code === "Space") {
                return;
            }
            // Forward the event to the TreeView keyboard handler
            publishKeyDown(event);
        },
        [publishKeyDown],
    );
}
