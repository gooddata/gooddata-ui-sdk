// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * @internal
 */
export function useFocusWithinContainer(idToFocus?: string | null) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const escapedIdToFocus = idToFocus ? CSS.escape(idToFocus) : null;
        const elementToFocus = idToFocus ? container?.querySelector(`#${escapedIdToFocus}`) : null;

        if (!elementToFocus) {
            return;
        }

        if (!container?.contains(document.activeElement) && container !== document.activeElement) {
            return;
        }

        (elementToFocus as HTMLElement).focus();
    }, [idToFocus]);

    return { containerRef };
}
