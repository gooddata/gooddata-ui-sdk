// (C) 2020-2025 GoodData Corporation

import { KeyboardEvent } from "react";
import { CONFIRM_DIALOG_BASE_ID } from "../Dialog/elementId.js";
import { IRegion } from "../typings/domUtilities.js";

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
    'button:not(:disabled):not([aria-disabled="true"])',
    'input:not(:disabled):not([aria-disabled="true"])',
    'select:not(:disabled):not([aria-disabled="true"])',
    'textarea:not(:disabled):not([aria-disabled="true"])',

    // Links and areas
    "a[href]",
    "area[href]",

    // Custom elements with tabindex
    '[tabindex]:not(:disabled):not([aria-disabled="true"])',

    // Media with controls
    "audio[controls]",
    "video[controls]",

    // Editable content
    '[contenteditable]:not([contenteditable="false"])',
].join(",");

const isNotNegativeTabIndex = (element: HTMLElement) => !element.tabIndex || element.tabIndex >= 0;

/**
 * @internal
 * Returns the focusable elements of the given element
 * @param element - the element to get the focusable elements from
 * @returns an object containing the focusable elements, the first focusable element, and the last focusable element
 */
export const getFocusableElements = (element?: HTMLElement | null) => {
    const focusableElements = Array.from(
        element?.querySelectorAll<HTMLElement>(focusableElementsSelector) ?? [],
    ).filter(isNotNegativeTabIndex);
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    return { focusableElements, firstElement, lastElement };
};

/**
 * @internal
 * @param element - the element to test for focusability
 * @returns whether or not the supplied element is focusable
 */
export const isElementFocusable = (element?: HTMLElement | null) => {
    return element?.matches(focusableElementsSelector) && isNotNegativeTabIndex(element);
};
