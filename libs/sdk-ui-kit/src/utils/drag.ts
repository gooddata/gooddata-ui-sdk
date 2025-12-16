// (C) 2022-2025 GoodData Corporation
import { throttle } from "lodash-es";

/**
 * Custom event name for goodstrap drag events.
 * Used by Overlay to handle closeOnMouseDrag and other drag-related behaviors.
 * @internal
 */
export const GOODSTRAP_DRAG_EVENT = "goodstrap.drag";

const fireGoodstrapDragEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEvent(GOODSTRAP_DRAG_EVENT, {
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
