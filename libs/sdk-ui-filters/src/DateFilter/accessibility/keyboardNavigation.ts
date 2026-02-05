// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MutableRefObject } from "react";

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
    dateFilterContainerRef: MutableRefObject<HTMLDivElement | null>;
    /** Reference to the date filter body element */
    dateFilterBodyRef: MutableRefObject<HTMLDivElement | null>;
    /** Optional callback to close the dropdown */
    closeDropdown?: () => void;
}

/**
 * Configuration for Date filter - Relative form keyboard navigation handler
 * @internal
 */
interface IDateFilterRelativeFormKeyboardNavigationConfig {
    /** Reference to the relative filter body element */
    relativeDateFilterRef: MutableRefObject<HTMLDivElement | null>;
    /** Reference to the relative filter granularity tabs element */
    tabGranularityRef: MutableRefObject<HTMLDivElement | null>;
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
    ref: MutableRefObject<HTMLDivElement | null>,
    activeElement: HTMLElement,
    role: ActiveElementRole,
): boolean => ref.current?.contains(activeElement) === true && activeElement.role === role;

/**
 * Finds the next focusable element in the given direction
 * @param items - Array of focusable elements
 * @param currentIndex - Current element index
 * @param direction - Direction to search (-1 for previous, 1 for next)
 * @returns The next focusable element or undefined if not found
 * @internal
 */
const findNextFocusableElement = (
    items: HTMLElement[],
    currentIndex: number,
    direction: number,
): HTMLElement | undefined => {
    if (items.length === 0) {
        return undefined;
    }
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    return items[nextIndex];
};

// Iterates through dropdown list, exclude period input, cancel and apply button.
const handleTabNavigation = (
    event: KeyboardEvent,
    dateFilterContainerRef: MutableRefObject<HTMLDivElement | null>,
): void => {
    if (event.key !== "Tab") {
        return;
    }

    event.stopPropagation();
    event.preventDefault();

    const focusableElementsSelector = [
        '[tabindex]:not([tabindex="-1"]):not(:disabled)',
        "input:not(:disabled)",
        'button:not([tabindex="-1"]):not(:disabled)',
    ].join(",");

    const focusableElements = Array.from(
        dateFilterContainerRef.current?.querySelectorAll<HTMLElement>(focusableElementsSelector) ?? [],
    ).filter((element) => !element.closest("[hidden]"));

    const active = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(active);

    if (currentIndex === -1) {
        const direction = event.shiftKey ? focusableElements.length - 1 : 1;
        focusableElements[direction]?.focus();
    } else {
        const direction = event.shiftKey ? -1 : 1;
        const nextIndex = (currentIndex + direction + focusableElements.length) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
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
    (event: KeyboardEvent): void => {
        if (!dateFilterBodyRef.current || !dateFilterContainerRef.current) {
            return;
        }

        const items = Array.from(
            dateFilterBodyRef.current.querySelectorAll<HTMLElement>("[role='option']"),
        ).filter((element) => !element.closest("[hidden]"));
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
                    items[0]?.focus();
                }
            },
            onFocusLast: () => {
                if (
                    shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement, ActiveElementRole.OPTION)
                ) {
                    items[items.length - 1]?.focus();
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
    return (event: KeyboardEvent): void => {
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
    event: KeyboardEvent,
    canSubmit: boolean,
    withoutApply: boolean,
    onSubmit: () => void,
    submit: () => void,
) => {
    if (event.key === "Enter") {
        const canSubmitForm = canSubmit && document.activeElement instanceof HTMLInputElement;
        if (canSubmitForm && !withoutApply) {
            submit();
            onSubmit();
        }
    }

    if (event.key !== "Escape") {
        event.stopPropagation();
    }
};
