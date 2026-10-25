// (C) 2021-2026 GoodData Corporation

const ACTIVE_CONTAINER_FRACTION = 4;

/**
 * Find out whether an active area of the scroller was hit (upper/lower).
 *
 * @param event - dragOver or mouseOver event
 * @param element - scroller element
 * @param fraction - determines the length of the upper/lower active area
 */
export function getAreaHit(event: MouseEvent, element: HTMLElement, fraction = ACTIVE_CONTAINER_FRACTION) {
    const fractionPx = element.clientHeight / fraction;
    const diff = event.clientY - element.getBoundingClientRect().top;

    if (diff < fractionPx) {
        return "upper";
    }

    if (element.clientHeight - diff < fractionPx) {
        return "lower";
    }

    return "middle";
}

/**
 * Returns the range of scroll motion needed to travel to the active area hit.
 *
 * @param element - scroller element
 * @param area - active area hit
 */
export function getAnimationRange(element: HTMLElement, area: "upper" | "lower") {
    if (area === "upper") {
        return {
            from: element.scrollTop,
            to: 0,
        };
    }

    if (area === "lower") {
        return {
            from: element.scrollTop,
            to: element.scrollHeight - element.clientHeight,
        };
    }

    return null;
}

/**
 * Determines the value of smooth time property based on motion interval.
 * Gives only approximate idea of the animation length, tweak to find
 * what suits best.
 *
 * @param range - should contain `from` and `to` keys
 * @param stiffness - multiplication factor
 */
export function getSmoothTime({ from, to }: { from: number; to: number }, stiffness: number) {
    return Math.abs(to - from) * stiffness;
}

/**
 * Determines if a given mouse event happened within a given rectangle.
 *
 * @param event - mouse event (drag leave, mouse move, ...)
 * @param rect -
 */
export function isEventWithinRect(event: MouseEvent, rect: DOMRect) {
    const between = (x: number, min: number, max: number) => x > min && x < max;

    return between(event.pageX, rect.left, rect.right) && between(event.pageY, rect.top, rect.bottom);
}
