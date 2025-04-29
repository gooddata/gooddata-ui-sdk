// (C) 2025 GoodData Corporation

import React, { useEffect, useRef, useCallback } from "react";
import { makeDialogKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { getFocusableElements } from "../../utils/domUtilities.js";

/**
 * @internal
 */
export interface UiFocusTrapProps {
    children: React.ReactNode;
    autofocusOnOpen?: boolean;
    onDeactivate?: () => void;
    /**
     * Specify the element to return focus to when the trap is deactivated/closed.
     * If a string is provided, the focus will be returned to the element with the given id.
     * If a ref is provided, the focus will be returned to the element referenced by the ref.
     */
    returnFocusTo?: React.RefObject<HTMLElement> | string;
    /**
     * Specify the element that should receive focus when the trap is activated.
     * If not provided, the first focusable element will be focused.
     */
    initialFocus?: React.RefObject<HTMLElement> | string;
    /**
     * Specify a custom keyboard navigation handler.
     * If not provided, the default keyboard navigation handler will be used.
     */
    customKeyboardNavigationHandler?: (event: KeyboardEvent) => void;
}

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

const useDialogKeyboardNavigation = (
    trapRef: React.RefObject<HTMLDivElement>,
    onDeactivate: () => void,
    returnFocusTo: React.RefObject<HTMLElement> | string,
) => {
    const returnFocus = useCallback(() => {
        if (typeof returnFocusTo === "string") {
            const element = document.getElementById(returnFocusTo);
            if (element) {
                element.focus();
            }
        } else if (returnFocusTo?.current) {
            returnFocusTo.current.focus();
        }
    }, [returnFocusTo]);

    const handleFocusNavigation = useCallback(
        (focusableElements: NodeListOf<HTMLElement>, shiftKey: boolean) => {
            const elements = Array.from(focusableElements);
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            let nextElement;

            if (shiftKey) {
                // Shift + Tab - moving backwards
                nextElement = currentIndex <= 0 ? lastElement : elements[currentIndex - 1];
            } else {
                // Tab - moving forwards
                nextElement =
                    currentIndex === elements.length - 1 ? firstElement : elements[currentIndex + 1];
            }

            if (nextElement) {
                focusAndEnsureReachableElement(nextElement, focusableElements, shiftKey);
            }
        },
        [],
    );

    const keyboardNavigationHandler = useCallback(
        (event: KeyboardEvent) => {
            if (!trapRef.current?.contains(event.target as Node)) {
                return;
            }

            return makeDialogKeyboardNavigation({
                onFocusNext: () => {
                    const { focusableElements } = getFocusableElements(trapRef.current);
                    if (!focusableElements?.length) {
                        return;
                    }
                    handleFocusNavigation(focusableElements, false);
                },
                onFocusPrevious: () => {
                    const { focusableElements } = getFocusableElements(trapRef.current);
                    if (!focusableElements?.length) {
                        return;
                    }
                    handleFocusNavigation(focusableElements, true);
                },
                onClose: () => {
                    onDeactivate?.();
                    returnFocus();
                },
            })(event);
        },
        [handleFocusNavigation, onDeactivate, returnFocus, trapRef],
    );

    return {
        keyboardNavigationHandler,
        returnFocus,
    };
};

/**
 * @internal
 */
export const UiFocusTrap: React.FC<UiFocusTrapProps> = ({
    children,
    onDeactivate,
    returnFocusTo,
    autofocusOnOpen = false,
    initialFocus,
    customKeyboardNavigationHandler,
}) => {
    const trapRef = useRef<HTMLDivElement>(null);
    const defaultReturnFocusToRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        defaultReturnFocusToRef.current = document.activeElement as HTMLElement;
    }, []);

    const { keyboardNavigationHandler, returnFocus } = useDialogKeyboardNavigation(
        trapRef,
        onDeactivate,
        returnFocusTo ?? defaultReturnFocusToRef,
    );

    const keyboardHandler = customKeyboardNavigationHandler ?? keyboardNavigationHandler;

    useEffect(() => {
        document.addEventListener("keydown", keyboardHandler);
        const focusTrapTimeout = setTimeout(() => {
            if (!autofocusOnOpen) {
                return;
            }

            if (trapRef.current?.contains(document.activeElement)) {
                // Do not change focus, if the focused element is already inside the trap
                return;
            }

            if (initialFocus) {
                if (typeof initialFocus === "string") {
                    const element = document.getElementById(initialFocus);
                    if (element) {
                        element.focus();
                        return;
                    }
                } else if (initialFocus.current) {
                    initialFocus.current.focus();
                    return;
                }
            }

            // Move focus to the first element in the trap at start
            const { firstElement } = getFocusableElements(trapRef.current);
            firstElement?.focus();
        }, 100);

        return () => {
            clearTimeout(focusTrapTimeout);
            document.removeEventListener("keydown", keyboardHandler);
            returnFocus();
        };
    }, [autofocusOnOpen, initialFocus, returnFocus, keyboardHandler]);

    return (
        <div className="gd-focus-trap" ref={trapRef}>
            {children}
        </div>
    );
};
