// (C) 2026 GoodData Corporation

import { type RefObject, useCallback } from "react";

import { type Rect, type Virtualizer } from "@tanstack/react-virtual";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

/**
 * `observeElementRect` for a vertical `useVirtualizer` that reports the scroll element's real
 * measurement, substituting the caller-provided height when the measurement is zero (jsdom/happy-dom
 * in tests, `display: none` ancestors). The virtualizer subscribes once per scroll element and
 * ignores later option changes, so the fallback is read through a ref to stay current.
 *
 * @internal
 */
export function useVirtualizerRectObserver<TScrollElement extends Element>(
    scrollElementRef: RefObject<TScrollElement | null>,
    fallbackHeight: number,
) {
    const fallbackHeightRef = useAutoupdateRef(fallbackHeight);

    return useCallback(
        (_instance: Virtualizer<TScrollElement, Element>, cb: (rect: Rect) => void) => {
            const el = scrollElementRef.current;
            if (!el) {
                return undefined;
            }
            const report = () => {
                const rect = el.getBoundingClientRect();
                cb({
                    width: rect.width,
                    height: rect.height || fallbackHeightRef.current,
                });
            };
            report();
            if (typeof ResizeObserver === "undefined") {
                return undefined;
            }
            const resizeObserver = new ResizeObserver(report);
            resizeObserver.observe(el);
            return () => resizeObserver.disconnect();
        },
        [scrollElementRef, fallbackHeightRef],
    );
}
