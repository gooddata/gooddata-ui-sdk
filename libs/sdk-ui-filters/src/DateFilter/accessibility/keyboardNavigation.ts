// (C) 2025 GoodData Corporation
import React from "react";
import { getFocusableElements, makeLinearKeyboardNavigation } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
enum ActiveElementRole {
    OPTION = "option",
    TAB = "tab",
}

/**
 * Configuration for Date filter keyboard navigation handler
 * @internal
 */
interface IDateFilterKeyboardNavigationConfig {
    /** Reference to the date filter container element */
    dateFilterContainerRef: React.MutableRefObject<HTMLDivElement>;
    /** Reference to the date filter body element */
    dateFilterBodyRef: React.MutableRefObject<HTMLDivElement>;
    /** Optional callback to close the dropdown */
    closeDropdown?: () => void;
}

/**
 * Configuration for Date filter - Relative form keyboard navigation handler
 * @internal
 */
interface IDateFilterRelativeFormKeyboardNavigationConfig {
    /** Reference to the relative filter body element */
    relativeDateFilterRef: React.MutableRefObject<HTMLDivElement>;
    /** Reference to the relative filter granularity tabs element */
    tabGranularityRef: React.MutableRefObject<HTMLDivElement>;
    /** Callback to close the dropdown */
    closeDropdown?: () => void;
}

/**
 * Checks if keyboard navigation should be handled for the given element
 * @param ref - Reference to the container element
 * @param activeElement - Currently active HTML element
 * @param role - Role of the active HTML element
 * @returns boolean indicating if keyboard navigation should be handled
 * @internal
 */
const shouldHandleKeyboardNavigation = (
    ref: React.MutableRefObject<HTMLDivElement>,
    activeElement: HTMLElement,
    role: ActiveElementRole,
): boolean => ref.current.contains(activeElement) && activeElement.role === role;

/**
 * Checks if an element is a tab list item
 * @param element - The element to check
 * @returns boolean indicating if the element is a tab list item
 * @internal
 */
const isTabListItem = (element: HTMLElement): boolean => element.getAttribute("role") === "tab";

/**
 * Finds the next focusable element in the given direction
 * @param items - Array of focusable elements
 * @param currentIndex - Current element index
 * @param direction - Direction to search (-1 for previous, 1 for next)
 * @returns The next focusable element or undefined if not found
 * @internal
 */
const findNextFocusableElement = (
    items: Element[],
    currentIndex: number,
    direction: number,
): HTMLElement | undefined => {
    let nextIndex = currentIndex;
    let nextElement: HTMLElement | undefined;

    do {
        nextIndex = (nextIndex + direction + items.length) % items.length;
        nextElement = items[nextIndex] as HTMLElement;
    } while (isTabListItem(nextElement));

    return nextElement;
};

// Iterates through dropdown list, exclude period input, cancel and apply button.
const handleTabNavigation = (
    event: React.KeyboardEvent,
    dateFilterContainerRef: React.MutableRefObject<HTMLDivElement>,
): void => {
    if (event.key !== "Tab") {
        return;
    }

    event.stopPropagation();
    event.preventDefault();

    const focusableElementsSelector = [
        '[tabindex]:not([tabindex="-1"]):not(:disabled):not([aria-disabled="true"])',
        'input:not(:disabled):not([aria-disabled="true"])',
    ].join(",");

    const focusableElements = Array.from(
        dateFilterContainerRef.current?.querySelectorAll<HTMLElement>(focusableElementsSelector) ?? [],
    );

    const active = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(active);

    if (currentIndex !== -1) {
        const direction = event.shiftKey ? -1 : 1;
        const nextIndex = (currentIndex + direction + focusableElements.length) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
    } else {
        const direction = event.shiftKey ? focusableElements.length - 1 : 1;
        focusableElements[direction]?.focus();
    }
};

/**
 * Creates a keyboard event handler for the date filter component
 * @param config - Configuration object containing ref and optional close handler
 * @returns Keyboard event handler function
 * @internal
 */
export const createDateFilterKeyboardHandler =
    ({ dateFilterContainerRef, dateFilterBodyRef, closeDropdown }: IDateFilterKeyboardNavigationConfig) =>
    (event: React.KeyboardEvent): void => {
        if (!dateFilterBodyRef.current || !dateFilterContainerRef.current) {
            return;
        }

        const items = Array.from(dateFilterBodyRef.current.querySelectorAll("[tabindex]"));
        const activeElement = document.activeElement as HTMLElement;

        const keyboardHandler = makeLinearKeyboardNavigation({
            onFocusPrevious: () => {
                if (
                    shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement, ActiveElementRole.OPTION)
                ) {
                    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
                    const previousElement = findNextFocusableElement(items, currentIndex, -1);
                    previousElement?.focus();
                }
            },
            onFocusNext: () => {
                if (
                    shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement, ActiveElementRole.OPTION)
                ) {
                    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
                    const nextElement = findNextFocusableElement(items, currentIndex, 1);
                    nextElement?.focus();
                }
            },
            onFocusFirst: () => {
                if (
                    shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement, ActiveElementRole.OPTION)
                ) {
                    const { firstElement } = getFocusableElements(dateFilterBodyRef.current);
                    firstElement?.focus();
                }
            },
            onFocusLast: () => {
                if (
                    shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement, ActiveElementRole.OPTION)
                ) {
                    const { lastElement } = getFocusableElements(dateFilterBodyRef.current);
                    lastElement?.focus();
                }
            },
            onClose: closeDropdown,
            onUnhandledKeyDown: (event) => {
                if (event.key === "Tab") {
                    handleTabNavigation(event, dateFilterContainerRef);
                }
            },
        });

        keyboardHandler(event);
    };

/**
 * Creates a keyboard event handler for the date filter component
 * @param config - Configuration object containing ref and optional close handler
 * @returns Keyboard event handler function
 * @internal
 */
export const createDateFilterRelativeFormKeyboardHandler = ({
    tabGranularityRef,
    closeDropdown,
}: IDateFilterRelativeFormKeyboardNavigationConfig) => {
    return (event: React.KeyboardEvent): void => {
        if (!tabGranularityRef.current) {
            return;
        }

        const items = Array.from(tabGranularityRef.current.querySelectorAll("[tabindex]"));
        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = items.findIndex((item) => item === activeElement);

        const keyboardHandler = makeLinearKeyboardNavigation({
            onFocusNext: () => {
                if (shouldHandleKeyboardNavigation(tabGranularityRef, activeElement, ActiveElementRole.TAB)) {
                    const nextElement =
                        currentIndex === items.length - 1 ? items[0] : items[currentIndex + 1];
                    (nextElement as HTMLElement)?.focus();
                }
            },
            onFocusPrevious: () => {
                if (shouldHandleKeyboardNavigation(tabGranularityRef, activeElement, ActiveElementRole.TAB)) {
                    const previousElement =
                        currentIndex <= 0 ? items[items.length - 1] : items[currentIndex - 1];
                    (previousElement as HTMLElement)?.focus();
                }
            },
            onFocusFirst: () => {
                if (shouldHandleKeyboardNavigation(tabGranularityRef, activeElement, ActiveElementRole.TAB)) {
                    const { firstElement } = getFocusableElements(tabGranularityRef.current);
                    firstElement?.focus();
                }
            },
            onFocusLast: () => {
                if (shouldHandleKeyboardNavigation(tabGranularityRef, activeElement, ActiveElementRole.TAB)) {
                    const { lastElement } = getFocusableElements(tabGranularityRef.current);
                    lastElement?.focus();
                }
            },
            onClose: closeDropdown,
        });

        keyboardHandler(event);
    };
};

export const submitRelativeDateFilterForm = (
    event: React.KeyboardEvent,
    canSubmit: boolean,
    onSubmit: () => void,
    submit: () => void,
) => {
    if (event.key === "Enter") {
        const canSubmitForm = canSubmit && document.activeElement instanceof HTMLInputElement;
        if (canSubmitForm) {
            submit();
            onSubmit();
        }
    }

    if (event.key !== "Escape") {
        event.stopPropagation();
    }
};
