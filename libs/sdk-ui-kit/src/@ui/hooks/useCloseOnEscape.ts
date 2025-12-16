// (C) 2025 GoodData Corporation

import { useEffect } from "react";

/**
 * Hook to trigger a callback when pressing the Escape key.
 *
 * @internal
 */
export function useCloseOnEscape(isOpen: boolean, onClose: () => void): void {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);
}
