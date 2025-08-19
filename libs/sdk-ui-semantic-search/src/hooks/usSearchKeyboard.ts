// (C) 2025 GoodData Corporation
import React, { useCallback } from "react";

import { useUiTreeViewEventPublisher } from "@gooddata/sdk-ui-kit";

/**
 * Common keyboard handler for the search combobox input element.
 * @internal
 */
export function useSearchKeyboard(): (event: React.KeyboardEvent) => void {
    const publishKeyDown = useUiTreeViewEventPublisher("keydown");

    return useCallback(
        (event: React.KeyboardEvent) => {
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
