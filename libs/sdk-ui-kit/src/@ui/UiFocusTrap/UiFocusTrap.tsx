// (C) 2025 GoodData Corporation

import React, { useEffect, useRef } from "react";

/**
 * @internal
 */
export interface UiFocusTrapProps {
    children: React.ReactNode;
    onDeactivate?: () => void;
    returnFocusTo?: React.RefObject<HTMLElement>;
}
const focusableElementsSelector = [
    // Interactive form elements
    'button:not(:disabled):not([aria-disabled="true"])',
    'input:not(:disabled):not([aria-disabled="true"])',
    'select:not(:disabled):not([aria-disabled="true"])',
    'textarea:not(:disabled):not([aria-disabled="true"])',

    // Links and areas
    "a[href]",
    "area[href]",

    // Custom elements with tabindex
    '[tabindex]:not([tabindex="-1"]):not(:disabled):not([aria-disabled="true"])',

    // Media with controls
    "audio[controls]",
    "video[controls]",

    // Editable content
    '[contenteditable]:not([contenteditable="false"])',
].join(",");

const getFocusableElements = (element?: HTMLElement) => {
    const focusableElements = element?.querySelectorAll<HTMLElement>(focusableElementsSelector);
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    return { focusableElements, firstElement, lastElement };
};

/**
 * Attempts to find a truly focusable element by trying subsequent elements in the focusable elements collection
 * This is useful when some elements are focusable but not reachable (e.g., out of viewport or disabled)
 */
const focusAndEnsureReachableElement = (
    initialElement: HTMLElement,
    focusableElements: NodeListOf<HTMLElement>,
    shiftKey: boolean,
): void => {
    let nextElement = initialElement;
    let attempts = 0;
    const maxAttempts = focusableElements.length;

    nextElement.focus();

    while (nextElement !== document.activeElement && attempts < maxAttempts) {
        attempts++;
        const currentIndex = Array.from(focusableElements).indexOf(nextElement);
        const nextIndex = shiftKey
            ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
            : (currentIndex + 1) % focusableElements.length;
        nextElement = focusableElements[nextIndex];
        nextElement?.focus();
    }
};

/**
 * @internal
 */
export const UiFocusTrap: React.FC<UiFocusTrapProps> = ({ children, onDeactivate, returnFocusTo }) => {
    const trapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getNextElement = (focusableElements, firstElement, lastElement, shiftKey: boolean) => {
            const elements = Array.from(focusableElements);
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);

            if (shiftKey) {
                // Shift + Tab - moving backwards
                return currentIndex <= 0 ? lastElement : elements[currentIndex - 1];
            } else {
                // Tab - moving forwards
                return currentIndex === elements.length - 1 ? firstElement : elements[currentIndex + 1];
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            // get fresh focusable elements set as they could change in meantime
            const { firstElement, lastElement, focusableElements } = getFocusableElements(trapRef.current);
            if (event.key === "Tab") {
                const nextElement = getNextElement(
                    focusableElements,
                    firstElement,
                    lastElement,
                    event.shiftKey,
                );

                if (nextElement) {
                    event.preventDefault();
                    focusAndEnsureReachableElement(nextElement, focusableElements, event.shiftKey);
                }
            } else if (event.key === "Escape") {
                if (onDeactivate) {
                    onDeactivate();
                }
                if (returnFocusTo.current) {
                    returnFocusTo.current.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        const focusTrapTimeout = setTimeout(() => {
            // Move focus to the first element in the trap at start
            const { firstElement } = getFocusableElements(trapRef.current);
            firstElement?.focus();
        }, 100);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            clearTimeout(focusTrapTimeout);
        };
    }, [onDeactivate, returnFocusTo]);

    return (
        <div className="gd-focus-trap" ref={trapRef}>
            {children}
        </div>
    );
};
