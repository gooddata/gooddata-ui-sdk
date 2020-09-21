// (C) 2020 GoodData Corporation

/**
 * Removes the element specifed from the DOM
 * @param {HTMLElement} element
 */
export const removeFromDom = (element: HTMLElement) => {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

/**
 * Returns bounding rectangle of specified elements
 * in local (relative to offset parent of element)
 * coordinate space
 *
 * @param  {HTMLElement}  element
 * @param  {boolean}      ignoreScrollOffsets
 * @param  {Object}       windowObject - use for unit test only
 * @return {Object}       Bounding rectangle
 */
export const region = (element: HTMLElement, ignoreScrollOffsets?: any, windowObject = window) => {
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
 * @param {HTMLElement} element
 * @returns {boolean}
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
 * @param {HTMLElement|string} element
 * @returns {boolean}
 */
export const isFixedPosition = (element: any) => {
    let elem = typeof element === "string" ? document.querySelector(element) : element;

    if (!elem) {
        return {};
    }

    while (elem) {
        if (elem.style && elem.style.position === "fixed") {
            return true;
        }
        elem = elem.parentNode;
    }

    return false;
};

/**
 * Returns bounding rectangle of specified elements
 * in local (relative to offset parent of element)
 * coordinate space
 * @param {HTMLElement|string} elementOrSelector
 */
export const elementRegion = (elementOrSelector: any, getRegionBasedOnPosition?: any) => {
    const elem =
        typeof elementOrSelector === "string" ? document.querySelector(elementOrSelector) : elementOrSelector;

    if (!elem) {
        return {};
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
