// (C) 2007-2025 GoodData Corporation
import { type ReactElement, createElement } from "react";

const SCREENSHOT_WRAPPER_CLASS = "screenshot-wrapper";

/**
 * Short post interaction wait timeout - use when component renders fast, almost instantly in your browser.
 */
export const ShortPostInteractionTimeout = 1000;

/**
 * Long post interaction wait timeout - use when component renders slow - up to one second before it renders
 * in your browser.
 */
export const LongPostInteractionTimeout = 5000;

/**
 * Wraps a given render function so that its output is wrapped with a SCREENSHOT_WRAPPER_CLASS div.
 * @param render - the original render function
 */
export function wrapForBackstop(render: () => ReactElement): () => ReactElement {
    function BackstopWrapped() {
        return createElement("div", { className: SCREENSHOT_WRAPPER_CLASS }, render());
    }

    return BackstopWrapped;
}
