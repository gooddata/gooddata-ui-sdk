// (C) 2024-2026 GoodData Corporation

import { type DependencyList, useLayoutEffect, useRef, useState } from "react";

/**
 * @internal
 */
export function useElementSize<T extends HTMLElement>(deps?: DependencyList) {
    const ref = useRef<T | null>(null);
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);

    useLayoutEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const [entry] = entries;
            if (entry) {
                setHeight(entry.contentRect.height);
                setWidth(entry.contentRect.width);
            }
        });

        if (ref.current) {
            resizeObserver.observe(ref.current);
            setHeight(ref.current.offsetHeight);
            setWidth(ref.current.offsetWidth);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
                setHeight(0);
                setWidth(0);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps ?? []);

    return {
        ref,
        height,
        width,
    };
}
