// (C) 2025 GoodData Corporation

import React from "react";
import { getFocusableElements, isElementFocusable } from "./domUtilities.js";

/**
 * Focuses the element when it mounts.
 *
 * @internal
 */
export const useAutofocusOnMount = () => {
    const [element, setElement] = React.useState<HTMLElement | null>(null);

    const hasFiredRef = React.useRef(false);

    // If the element is outside of the viewport, calling focus() will not work.
    // This can happen for example with floating elements, that are repositioned after they mount
    React.useEffect(() => {
        if (!element || element.contains(document.activeElement)) {
            return undefined;
        }

        const observer = new IntersectionObserver(() => {
            if (!element) {
                return;
            }

            const elementToFocus = isElementFocusable(element)
                ? element
                : getFocusableElements(element).firstElement;

            // Focusing a newly created element sometimes fails if not done through requestAnimationFrame()
            window.requestAnimationFrame(() => {
                elementToFocus.focus();

                if (document.activeElement === elementToFocus) {
                    observer.disconnect();
                }
            });
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [element]);

    return React.useCallback((node: HTMLElement | null) => {
        if (hasFiredRef.current || !node) {
            return;
        }
        hasFiredRef.current = true;

        setElement(node);
    }, []);
};

/**
 * @internal
 */
export const AutofocusOnMount: React.FC<React.HTMLProps<HTMLDivElement>> = ({ ...props }) => {
    const ref = useAutofocusOnMount();

    return <div ref={ref} {...props} />;
};
