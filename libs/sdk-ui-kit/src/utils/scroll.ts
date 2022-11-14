// (C) 2022 GoodData Corporation
import throttle from "lodash/throttle";
import CustomEventPolyfill from "custom-event"; // TODO: FET-772 Remove IE-specific polyfills, upgrade blocked dependencies

const fireGoodstrapScrollEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEventPolyfill("goodstrap.scrolled", {
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
export const handleOnScrollEvent = throttle(
    (node: HTMLElement) => fireGoodstrapScrollEvent(node, window),
    500,
);
