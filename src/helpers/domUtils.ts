// (C) 2007-2019 GoodData Corporation
import once = require("lodash/once");

const getScrollbarWidthBody = (): number => {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add inner div
    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
};

/**
 * Returns the current actual scrollbar width.
 * For performance reasons this is memoized as the value is highly unlikely to change
 */
export const getScrollbarWidth = once(getScrollbarWidthBody);

export const isCssMultiLineTruncationSupported = (): boolean => {
    // support -webkit-line-clamp
    return "webkitLineClamp" in document.body.style;
};
