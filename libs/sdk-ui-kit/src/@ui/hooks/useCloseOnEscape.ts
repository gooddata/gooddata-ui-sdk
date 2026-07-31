// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

/**
 * Hook to trigger a callback when pressing the Escape key.
 *
 * @param capture - When true, listens in the capture phase and stops propagation, so a nested
 * overlay can dismiss on Escape without an ancestor (e.g. a Dropdown) also closing.
 *
 * @internal
 */
export function useCloseOnEscape(isOpen: boolean, onClose: () => void, capture = false): void {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (capture) {
                    event.stopPropagation();
                }
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown, { capture });
        return () => document.removeEventListener("keydown", handleKeyDown, { capture });
    }, [isOpen, onClose, capture]);
}
