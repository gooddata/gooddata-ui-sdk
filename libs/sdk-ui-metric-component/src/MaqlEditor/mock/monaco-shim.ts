// (C) 2021-2026 GoodData Corporation

/**
 * @internal
 */
export function shimMaqlEditor(): void {
    const noop = () => void 0 as unknown;

    //monaco shim methods
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
}
