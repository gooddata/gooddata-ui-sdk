// (C) 2026 GoodData Corporation

/**
 * Scrolls `container` so that `element` is visible in it, like `element.scrollIntoView({ block: "nearest" })`, but
 * without scrolling anything above `container`, such as the whole page. The native `element.scrollIntoView()` scrolls
 * by default every scrollable ancestor.
 *
 * This can be replaced by `element.scrollIntoView({ block: "nearest", container: "nearest" })` in the future, once
 * all the relevant browsers support the `container` option. As of October 2026, Chrome and Edge 140+ have it, Firefox
 * and Safari don't.
 *
 * @internal
 */
export function scrollIntoView(container: HTMLElement, element: HTMLElement): void {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    if (elementRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - elementRect.top;
    } else if (elementRect.bottom > containerRect.bottom) {
        container.scrollTop += elementRect.bottom - containerRect.bottom;
    }
}
