// (C) 2025 GoodData Corporation

import React, { useEffect, useRef } from "react";

/**
 * @internal
 */
export interface UiFocusTrapProps {
    children: React.ReactNode;
    onDeactivate?: () => void;
    returnFocusTo?: HTMLElement;
}
const focusableElementsSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (element?: HTMLElement) => {
    const focusableElements = element?.querySelectorAll<HTMLElement>(focusableElementsSelector);
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    return { focusableElements, firstElement, lastElement };
};

/**
 * @internal
 */
export const UiFocusTrap: React.FC<UiFocusTrapProps> = ({ children, onDeactivate, returnFocusTo }) => {
    const trapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const { firstElement } = getFocusableElements(trapRef.current);

        const handleKeyDown = (event: KeyboardEvent) => {
            // get fresh focusable elements set as they could change in meantime
            const { firstElement, lastElement } = getFocusableElements(trapRef.current);
            if (event.key === "Tab") {
                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement?.focus();
                    }
                }
            } else if (event.key === "Escape") {
                if (onDeactivate) {
                    onDeactivate();
                }
                if (returnFocusTo) {
                    returnFocusTo.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Move focus to the first element in the trap at start
        setTimeout(() => {
            console.log("🚀 ~ setTimeout ~ firstElement:", firstElement);
            firstElement?.focus();
            console.log("🚀 ~ useEffect ~ activeElement:", document.activeElement);
        }, 100);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onDeactivate, returnFocusTo]);

    return (
        <div className="gd-focus-trap" ref={trapRef}>
            {children}
        </div>
    );
};
