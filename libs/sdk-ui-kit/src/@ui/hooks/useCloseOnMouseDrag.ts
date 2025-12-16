// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { GOODSTRAP_DRAG_EVENT } from "../../utils/drag.js";

/**
 * Hook to trigger a callback when a mouse drag event occurs.
 * Listens for the custom GOODSTRAP_DRAG_EVENT event.
 *
 * @internal
 */
export function useCloseOnMouseDrag(isOpen: boolean, onClose: () => void): void {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        window.addEventListener(GOODSTRAP_DRAG_EVENT, onClose);
        return () => window.removeEventListener(GOODSTRAP_DRAG_EVENT, onClose);
    }, [isOpen, onClose]);
}
