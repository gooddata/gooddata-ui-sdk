// (C) 2020-2025 GoodData Corporation

import { KeyboardEvent } from "react";

import { CONFIRM_DIALOG_BASE_ID } from "../Dialog/elementId.js";
import { IRegion } from "../typings/domUtilities.js";
import { NavigationDirection } from "../typings/navigation.js";

/**
 * Removes the element specified from the DOM
 */
export const removeFromDom = (element: HTMLElement): void => {
    if (element?.parentNode) {
        element.parentNode.removeChild(element);
    }
};

/**
 * Returns bounding rectangle of specified elements
 * in local (relative to offset parent of element)
 * coordinate space
 *
 * @param element - element to get the region for
 * @param ignoreScrollOffsets - whether to ignore scrollOffsets
 * @param windowObject - use for unit test only
 * @returns Bounding rectangle
 */
export const region = (
    element: HTMLElement,
    ignoreScrollOffsets?: boolean,
    windowObject = window,
): IRegion => {
    const boundingRect = element.getBoundingClientRect();
    const offsetLeft = (ignoreScrollOffsets ? 0 : windowObject.pageXOffset) + boundingRect.left;
    const offsetTop = (ignoreScrollOffsets ? 0 : windowObject.pageYOffset) + boundingRect.top;
    const width = element.offsetWidth || boundingRect.width;
    const height = element.offsetHeight || boundingRect.height;

    return {
        left: offsetLeft,
        top: offsetTop,
        width,
        height,
        bottom: offsetTop + height,
        right: offsetLeft + width,
    };
};

/**
 * Returns a value indicating whether the element
 * specified is mounted to the DOM
 */
const isInDom = (element: any) => {
    let elem = element;
    while (elem) {
        if (elem === document) {
            return true;
        }
        elem = elem.parentNode;
    }
    return false;
};

/**
 * Returns a value indicating whether the element
 * specified is fixed position
 * or is contained in fixed position element
 */
export const isFixedPosition = (element: HTMLElement | string): boolean => {
    let elem = typeof element === "string" ? (document.querySelector(element) as HTMLElement) : element;

    if (!elem) {
        return true;
    }

    while (elem) {
        if (elem.style?.position === "fixed") {
            return true;
        }
        elem = elem.parentNode as HTMLElement;
    }

    return false;
};

/**
 * Returns bounding rectangle of specified elements
 * in local (relative to offset parent of element)
 * coordinate space
 */
export const elementRegion = (
    elementOrSelector: HTMLElement | string,
    getRegionBasedOnPosition?: boolean,
): IRegion => {
    const elem =
        typeof elementOrSelector === "string"
            ? (document.querySelector(elementOrSelector) as HTMLElement)
            : elementOrSelector;

    if (!elem) {
        return {} as IRegion;
    }

    if (isInDom(elem)) {
        // If element is contained within DOM, we can simply measure it as is
        return region(elem, getRegionBasedOnPosition && isFixedPosition(elem));
    }

    // In case the element is not yet in DOM
    // we have to append it first to be able to measure it.
    // Since we don't want to overwrite any CSS properties previously defined
    // on element, we have to back the old CSS properties up.
    const originalCss = {
        position: elem.style.position,
        visibility: elem.style.visibility,
    };

    // Append the element to DOM and ensure its not visible neither it causes
    // document reflow
    elem.style.position = "absolute";
    elem.style.visibility = "hidden";
    document.body.appendChild(elem);

    // Measure the element now
    const reg = region(elem);

    // Restore previous state as much as possible
    removeFromDom(elem);
    elem.style.position = originalCss.position;
    elem.style.visibility = originalCss.visibility;

    return reg;
};

export const isElementTextInput = (element: HTMLElement | EventTarget | null | undefined): boolean => {
    if (!element || !("tagName" in element)) {
        return false;
    }

    const { tagName, type } = element as HTMLInputElement;

    const tagNameInLowercase = tagName.toLowerCase();
    const typeInLowercase = type ? type.toLowerCase() : "";

    return (
        tagNameInLowercase === "textarea" ||
        (tagNameInLowercase === "input" && (typeInLowercase === "text" || typeInLowercase === "number"))
    );
};

export const isElementSubmitButton = (event: KeyboardEvent) => {
    const { id } = event.target as HTMLElement;

    return id === CONFIRM_DIALOG_BASE_ID;
};

const focusableElementsSelector = [
    // Interactive form elements
    "button:not(:disabled)",
    "input:not(:disabled)",
    "select:not(:disabled)",
    "textarea:not(:disabled)",

    // Links and areas
    "a[href]",
    "area[href]",

    // Custom elements with tabindex
    "[tabindex]:not(:disabled)",

    // Media with controls
    "audio[controls]",
    "video[controls]",

    // Editable content
    '[contenteditable]:not([contenteditable="false"])',
].join(",");

const isNotNegativeTabIndex = (element: HTMLElement) => !element.tabIndex || element.tabIndex >= 0;

const isVisible = (element: HTMLElement, includeHidden: boolean = false) => {
    // checkVisibility if available (modern browsers)
    if ("checkVisibility" in element) {
        const options = includeHidden
            ? {
                  // does only basic visibility check
              }
            : {
                  // Commented out because it was causing issues with our custom checkboxes since they are hidden by opacity: 0
                  // opacityProperty: true,
                  visibilityProperty: true,
              };

        return element.checkVisibility({
            ...options,
        });
    }
    // offsetParent (hacky fallback for older browsers)
    // offset parent is not defined if some ancestor is hidden
    return (element as any).offsetParent !== null;
};

const isFocusable = (element: HTMLElement, includeHidden: boolean = false) => {
    return isNotNegativeTabIndex(element) && isVisible(element, includeHidden);
};
/**
 * @internal
 * Returns the focusable elements of the given element
 * @param element - the element to get the focusable elements from
 * @returns an object containing the focusable elements, the first focusable element, and the last focusable element
 */
export const getFocusableElements = (element?: HTMLElement | null, includeHidden: boolean = false) => {
    const focusableElements = Array.from(
        element?.querySelectorAll<HTMLElement>(focusableElementsSelector) ?? [],
    ).filter((element) => {
        return isFocusable(element, includeHidden);
    });
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    return { focusableElements, firstElement, lastElement };
};

/**
 * @internal
 * @param element - the element to test for focusability
 * @returns whether or not the supplied element is focusable
 */
export const isElementFocusable = (element?: HTMLElement | null, includeHidden: boolean = false) => {
    return element?.matches(focusableElementsSelector) && isFocusable(element, includeHidden);
};

/**
 * @internal
 * Check a single sibling element for focusable descendants.
 *
 * @param sibling - The sibling element to check
 * @param direction - Direction to determine which focusable element to return
 * @returns The first or last focusable element within the sibling, or null
 */
export const findFocusableElementInSibling = (
    sibling: Element,
    direction: NavigationDirection = "forward",
): HTMLElement | null => {
    const siblingElement = sibling as HTMLElement;

    // Skip hidden elements early - avoid expensive querySelectorAll on hidden subtrees
    // offsetParent is null if element or ancestor is display:none
    if (siblingElement.offsetParent === null && siblingElement !== document.body) {
        return null;
    }

    const { firstElement, lastElement } = getFocusableElements(siblingElement);

    // Use the pre-computed first/last element instead of array access
    return direction === "forward" ? (firstElement ?? null) : (lastElement ?? null);
};

/**
 * @internal
 * Find the next or previous focusable element outside of a given container by traversing up the DOM tree.
 * This is more efficient than querying all focusable elements on the page.
 *
 * @param container - The container to find focusable elements outside of
 * @param direction - 'forward' for next element (Tab), 'backward' for previous element (Shift+Tab)
 * @returns The next/previous focusable element, or null if none found
 */
export const findFocusableElementOutsideContainer = (
    container: HTMLElement,
    direction: NavigationDirection = "forward",
): HTMLElement | null => {
    let currentElement: HTMLElement | null = container;

    // Traverse up the DOM tree
    while (currentElement) {
        // Check siblings one by one (lazy evaluation)
        let sibling =
            direction === "forward"
                ? currentElement.nextElementSibling
                : currentElement.previousElementSibling;

        // Check each sibling immediately instead of collecting all first
        while (sibling) {
            const targetElement = findFocusableElementInSibling(sibling, direction);
            if (targetElement) {
                return targetElement;
            }

            // Move to next/previous sibling
            sibling = direction === "forward" ? sibling.nextElementSibling : sibling.previousElementSibling;
        }

        // Move up to parent and continue searching
        currentElement = currentElement.parentElement;
    }

    return null;
};
