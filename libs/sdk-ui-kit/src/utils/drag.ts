// (C) 2022-2023 GoodData Corporation
import throttle from "lodash/throttle.js";

const fireGoodstrapDragEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEvent("goodstrap.drag", {
            // this will close dropdowns with closeOnMouseDrag=true
            bubbles: true,
            detail: {
                node,
            },
        }),
    );
};

/**
 * This is custom dom goodstrap event, it is used by Overlay to handle CloseOnParentDrag
 * This event is throttled by default
 * @internal
 */
export const handleOnGoodstrapDragEvent = throttle(() => fireGoodstrapDragEvent(document.body, window), 500);
