// (C) 2025 GoodData Corporation

import React from "react";
import { getFocusableElements, isElementFocusable } from "./domUtilities.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";

/**
 * Focuses the element when it mounts.
 *
 * @internal
 */
export const useAutofocusOnMount = (timeout?: number) => {
    const [element, setElement] = React.useState<HTMLElement | null>(null);

    const hasFiredRef = React.useRef(false);
    const timeoutRef = useAutoupdateRef(timeout);

    React.useEffect(() => {
        if (!element) {
            return undefined;
        }

        if (element.contains(document.activeElement)) {
            // Do not change focus, if the focused element is already inside the ref
            return undefined;
        }

        const elementToFocus = isElementFocusable(element)
            ? element
            : getFocusableElements(element).firstElement;

        const timeoutId = window.setTimeout(() => {
            elementToFocus?.focus();
        }, timeoutRef.current);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [element, timeoutRef]);

    return React.useCallback((node: HTMLElement | null) => {
        if (hasFiredRef.current || !node) {
            return;
        }
        hasFiredRef.current = true;

        setElement(node);
    }, []);
};
