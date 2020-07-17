// (C) 2007-2020 GoodData Corporation
import once from "lodash/once";

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

export const sleep = async (delay: number): Promise<void> => {
    return new Promise((resolve) => {
        // tslint:disable-next-line no-string-based-set-timeout
        setTimeout(resolve, delay);
    });
};
