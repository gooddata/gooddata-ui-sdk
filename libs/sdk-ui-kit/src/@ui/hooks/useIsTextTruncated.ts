// (C) 2026 GoodData Corporation

import { useCallback, useLayoutEffect, useState } from "react";

/**
 * Tells whether the text of an element is cut off by its width. Attach the returned ref to the
 * element with `white-space: nowrap` and `overflow: hidden`, and pass the rendered text so a
 * new text in the same element is measured again; the answer also follows size changes.
 *
 * @internal
 */
export function useIsTextTruncated(text: string): {
    ref: (element: HTMLElement | null) => void;
    isTruncated: boolean;
} {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

    useLayoutEffect(() => {
        if (!element) {
            setIsTruncated(false);
            return undefined;
        }

        const measure = () => setIsTruncated(element.scrollWidth > element.clientWidth);
        measure();

        if (typeof ResizeObserver === "undefined") {
            return undefined;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [element, text]);

    return { ref, isTruncated };
}
