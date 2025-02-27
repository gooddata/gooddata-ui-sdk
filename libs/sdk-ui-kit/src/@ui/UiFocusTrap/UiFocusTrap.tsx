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
        const getNextElement = (focusableElements, firstElement, lastElement, shiftKey: boolean) => {
            const elements = Array.from(focusableElements);
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);

            let nextElement: HTMLElement | undefined;
            if (shiftKey) {
                // Shift + Tab - moving backwards
                nextElement = currentIndex <= 0 ? lastElement : elements[currentIndex - 1];
            } else {
                // Tab - moving forwards
                nextElement =
                    currentIndex === elements.length - 1 ? firstElement : elements[currentIndex + 1];
            }
            return nextElement;
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
                    nextElement.focus();
                    // handle elements which are focusable but not reachable because eg. out of view port
                    // It is eg. virtualized list inside the trap which renders some invisible items which are in focusableElements collection but when focused they do nothing -> skip them and reach some really focusable element
                    let elements = Array.from(focusableElements);
                    let newNextElement = nextElement;
                    while (newNextElement !== document.activeElement && newNextElement !== undefined) {
                        const currentIndex = elements.indexOf(newNextElement as HTMLElement);
                        elements = elements.slice(currentIndex !== -1 ? currentIndex + 1 : 1);
                        const firstElement = elements[0];
                        const lastElement = elements[elements.length - 1];
                        newNextElement = getNextElement(elements, firstElement, lastElement, event.shiftKey);
                        newNextElement?.focus();
                    }
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

        // Move focus to the first element in the trap at start
        const { firstElement } = getFocusableElements(trapRef.current);

        setTimeout(() => {
            firstElement?.focus();
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
