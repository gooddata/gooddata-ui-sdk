// (C) 2022-2026 GoodData Corporation

import { type DebouncedFunc, throttle } from "lodash-es";

/**
 * Custom event name for goodstrap scroll events.
 * Used by Overlay to handle closeOnParentScroll and other scroll-related behaviors.
 * @internal
 */
export const GOODSTRAP_SCROLLED_EVENT = "goodstrap.scrolled";

const fireGoodstrapScrollEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEvent(GOODSTRAP_SCROLLED_EVENT, {
            // this will close dropdowns with closeOnParentScroll=true
            bubbles: true,
            detail: {
                node,
            },
        }),
    );
};

/**
 * This is custom dom goodstrap event, it is used by Overlay to handle CloseOnParentScroll
 * This event is throttled by default
 * @internal
 */
export const handleOnScrollEvent: DebouncedFunc<(node: HTMLElement) => void> = throttle(
    (node: HTMLElement) => fireGoodstrapScrollEvent(node, window),
    500,
);
