// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { isFocusLost } from "../../utils/domUtilities.js";

/**
 * @internal
 */
export interface IUseFocusWithinContainerOptions {
    /**
     * Whether the focus should be considered within the container even when the browser dropped it
     * to the document body, e.g. because a virtualized list unmounted the focused element.
     * When true and the focus is lost, it is moved to the element to focus (or the container).
     */
    isFocusWithin?: boolean;
}

/**
 * @internal
 */
export function useFocusWithinContainer(
    idToFocus?: string | null,
    { isFocusWithin = false }: IUseFocusWithinContainerOptions = {},
) {
    const containerRef = useRef<HTMLElement>(null);
    const isFocusWithinRef = useAutoupdateRef(isFocusWithin);

    useEffect(() => {
        const container = containerRef.current;
        const escapedIdToFocus = idToFocus ? CSS.escape(idToFocus) : null;
        const elementToFocus = idToFocus
            ? container?.querySelector<HTMLElement>(`#${escapedIdToFocus}`)
            : null;

        const activeElement = document.activeElement;

        // Jumping far through virtualized rows unmounts the focused element in the same render that
        // mounts the target one, so the browser drops the focus to the body. Bring it back.
        if (idToFocus && isFocusLost() && isFocusWithinRef.current) {
            (elementToFocus ?? container)?.focus();
            return;
        }

        if (!elementToFocus) {
            return;
        }

        if (!container?.contains(activeElement) && container !== activeElement) {
            return;
        }

        elementToFocus.focus();
    }, [idToFocus, isFocusWithinRef]);

    return { containerRef };
}
