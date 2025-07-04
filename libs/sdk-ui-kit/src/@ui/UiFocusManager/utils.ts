// (C) 2025 GoodData Corporation
import { RefObject } from "react";
import { NavigationDirection } from "./types.js";

/**
 * @internal
 */
export const resolveRef = (ref: string | RefObject<HTMLElement> | undefined | null) => {
    return typeof ref === "string" ? document.getElementById(ref) : ref?.current;
};

/**
 * Attempts to find a truly focusable element by trying subsequent elements in the focusable elements collection
 * This is useful when some elements are focusable but not reachable (e.g., out of viewport or disabled)
 *
 * @internal
 */
export const focusAndEnsureReachableElement = (
    initialElement: HTMLElement | undefined,
    focusableElements: HTMLElement[],
    direction: NavigationDirection,
): void => {
    const initialElementIndex = initialElement ? focusableElements.indexOf(initialElement) : -1;
    let currentElement: HTMLElement | undefined = initialElement;

    if (initialElementIndex === -1) {
        currentElement = focusableElements.at(direction === "forward" ? 0 : -1);
    }

    for (let attempt = 0; attempt < focusableElements.length && currentElement !== undefined; attempt++) {
        currentElement.focus();

        if (currentElement === document.activeElement) {
            return;
        }

        currentElement = getNextFocusableElement(currentElement, focusableElements, direction);
    }
};

/**
 * @internal
 */
export const getNextFocusableElement = (
    initialElement: HTMLElement | undefined,
    focusableElements: HTMLElement[],
    direction: NavigationDirection,
) => {
    const currentIndex = initialElement ? focusableElements.indexOf(initialElement) : -1;

    if (currentIndex === -1) {
        return focusableElements.at(direction === "forward" ? 0 : -1);
    }

    const nextIndex =
        direction === "backward"
            ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
            : (currentIndex + 1) % focusableElements.length;

    return focusableElements[nextIndex];
};
