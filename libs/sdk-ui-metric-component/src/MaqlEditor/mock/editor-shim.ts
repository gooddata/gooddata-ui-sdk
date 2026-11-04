// (C) 2021-2026 GoodData Corporation

/**
 * Fills in the browser APIs the editor needs that a DOM test environment lacks.
 *
 * @internal
 */
export function shimMaqlEditor(): void {
    const noop = () => void 0 as unknown;

    if (!document.queryCommandSupported) {
        document.queryCommandSupported = () => false;
    }
    if (!global.matchMedia) {
        global.matchMedia = () => {
            return {
                matches: false,
                media: "",
                dispatchEvent: noop,
                addEventListener: noop,
                removeEventListener: noop,
                addListener: noop,
                removeListener: noop,
                onchange: noop,
            } as MediaQueryList;
        };
    }
    if (!global.ResizeObserver) {
        class ResizeObserver {
            observe() {
                // do nothing
            }
            unobserve() {
                // do nothing
            }
            disconnect() {
                // do nothing
            }
        }
        global.ResizeObserver = ResizeObserver;
    }

    // CodeMirror measures text through DOM ranges, which the test environments leave unimplemented.
    const emptyRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
    };
    if (typeof Range !== "undefined") {
        const prototype = Range.prototype as Partial<Range>;
        if (!prototype.getClientRects) {
            prototype.getClientRects = () =>
                ({
                    length: 0,
                    item: () => null,
                    [Symbol.iterator]: [][Symbol.iterator],
                }) as unknown as DOMRectList;
        }
        if (!prototype.getBoundingClientRect) {
            prototype.getBoundingClientRect = () => emptyRect as DOMRect;
        }
    }
}
