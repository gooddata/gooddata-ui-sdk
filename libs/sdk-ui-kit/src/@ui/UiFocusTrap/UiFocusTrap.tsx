// (C) 2025 GoodData Corporation

import React, { useEffect, useRef, useCallback } from "react";
import { makeDialogKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { getFocusableElements } from "../../utils/domUtilities.js";
import { useAutofocusOnMount } from "../../utils/useAutofocusOnMount.js";
import { useCombineRefs } from "@gooddata/sdk-ui";

type NavigationDirection = "forward" | "backward";

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
     * If true, the focus will be returned to the element referenced by the returnFocusTo prop when the trap is unmounted.
     */
    returnFocusOnUnmount?: boolean;
    /**
     * Specify the element that should receive focus when the trap is activated.
     * If not provided, the first focusable element will be focused.
     */
    initialFocus?: React.RefObject<HTMLElement> | string;
    /**
     * You can retrigger focusing on `initialFocus` by changing the value of this key.
     */
    refocusKey?: unknown;
    /**
     * Specify a custom keyboard navigation handler.
     * If not provided, the default keyboard navigation handler will be used.
     */
    customKeyboardNavigationHandler?: (event: KeyboardEvent) => void;
    isTabCaught?: boolean;
}

/**
 * Attempts to find a truly focusable element by trying subsequent elements in the focusable elements collection
 * This is useful when some elements are focusable but not reachable (e.g., out of viewport or disabled)
 */
const focusAndEnsureReachableElement = (
    initialElement: HTMLElement,
    focusableElements: HTMLElement[],
    direction: NavigationDirection,
): void => {
    let nextElement = initialElement;
    let attempts = 0;
    const maxAttempts = focusableElements.length;

    nextElement.focus();

    while (nextElement !== document.activeElement && attempts < maxAttempts) {
        attempts++;
        const currentIndex = Array.from(focusableElements).indexOf(nextElement);
        const nextIndex =
            direction === "backward"
                ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
                : (currentIndex + 1) % focusableElements.length;
        nextElement = focusableElements[nextIndex];
        nextElement?.focus();
    }
};

const useDialogKeyboardNavigation = ({
    trapRef,
    returnFocus,
    onDeactivate,
    isTabCaught = true,
}: {
    trapRef: React.RefObject<HTMLDivElement>;
    returnFocus: () => void;
    onDeactivate?: () => void;
    isTabCaught?: boolean;
}) => {
    const handleFocusNavigation = useCallback(
        (focusableElements: HTMLElement[], direction: NavigationDirection) => {
            const elements = Array.from(focusableElements);
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            let nextElement;

            if (direction === "backward") {
                // Shift + Tab - moving backwards
                nextElement = currentIndex <= 0 ? lastElement : elements[currentIndex - 1];
            } else {
                // Tab - moving forwards
                nextElement =
                    currentIndex === elements.length - 1 ? firstElement : elements[currentIndex + 1];
            }

            if (nextElement) {
                focusAndEnsureReachableElement(nextElement, focusableElements, direction);
            }
        },
        [],
    );

    const keyboardNavigationHandler = useCallback(
        (event: KeyboardEvent) => {
            if (!trapRef.current?.contains(event.target as Node)) {
                return;
            }

            return makeDialogKeyboardNavigation<KeyboardEvent>({
                onFocusNext: isTabCaught
                    ? () => {
                          const { focusableElements } = getFocusableElements(trapRef.current);
                          if (!focusableElements?.length) {
                              return;
                          }
                          handleFocusNavigation(focusableElements, "forward");
                      }
                    : undefined,
                onFocusPrevious: isTabCaught
                    ? () => {
                          const { focusableElements } = getFocusableElements(trapRef.current);
                          if (!focusableElements?.length) {
                              return;
                          }
                          handleFocusNavigation(focusableElements, "backward");
                      }
                    : undefined,
                onClose: () => {
                    onDeactivate?.();
                    returnFocus();
                },
                onUnhandledKeyDown: (e) => {
                    if (isTabCaught || e.code !== "Tab") {
                        return;
                    }

                    onDeactivate?.();
                    returnFocus();
                },
            })(event);
        },
        [handleFocusNavigation, onDeactivate, returnFocus, trapRef, isTabCaught],
    );

    return {
        keyboardNavigationHandler,
    };
};

/**
 * @internal
 */
export const UiFocusTrap: React.FC<UiFocusTrapProps> = ({
    children,
    onDeactivate,
    returnFocusTo: returnFocusToProp,
    autofocusOnOpen = false,
    returnFocusOnUnmount = true,
    initialFocus,
    refocusKey,
    customKeyboardNavigationHandler,
    isTabCaught = true,
}) => {
    const trapRef = useRef<HTMLDivElement | null>(null);
    const [trapElement, setTrapElement] = React.useState<HTMLDivElement | null>(null);
    const defaultReturnFocusToRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement);

    const returnFocusTo = returnFocusToProp ?? defaultReturnFocusToRef;

    const returnFocus = useCallback(() => {
        if (
            // different browsers have different default focusable element
            document.activeElement !== document.body &&
            document.activeElement !== document.documentElement &&
            !trapRef.current?.contains(document.activeElement)
        ) {
            // if Trap was closed by clicking outside, do not return focus
            return;
        }
        if (typeof returnFocusTo === "string") {
            const element = document.getElementById(returnFocusTo);
            element?.focus();
        } else if (returnFocusTo?.current) {
            returnFocusTo.current.focus();
        }
    }, [returnFocusTo]);

    const { keyboardNavigationHandler } = useDialogKeyboardNavigation({
        trapRef,
        returnFocus,
        onDeactivate,
        isTabCaught,
    });

    const keyboardHandler = customKeyboardNavigationHandler ?? keyboardNavigationHandler;

    useEffect(() => {
        return () => {
            if (returnFocusOnUnmount) {
                returnFocus();
            }
        };
    }, [returnFocusOnUnmount, returnFocus]);

    const elementToFocus = React.useMemo(() => {
        if (typeof initialFocus === "string") {
            return document.getElementById(initialFocus);
        }
        return initialFocus?.current ?? trapElement;
    }, [initialFocus, trapElement]);

    useAutofocusOnMount(elementToFocus, { isDisabled: !autofocusOnOpen, refocusKey });

    useEffect(() => {
        document.addEventListener("keydown", keyboardHandler);

        return () => {
            document.removeEventListener("keydown", keyboardHandler);
        };
    }, [keyboardHandler]);

    return (
        <div className="gd-focus-trap" ref={useCombineRefs(trapRef, setTrapElement)}>
            {children}
        </div>
    );
};
