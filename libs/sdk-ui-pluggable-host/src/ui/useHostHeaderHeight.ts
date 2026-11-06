// (C) 2026 GoodData Corporation

import { type CSSProperties, type RefObject, useLayoutEffect, useMemo, useState } from "react";

// A non-`--gd` name keeps the variable out of the theme specification.
export const HOST_HEADER_HEIGHT_VARIABLE = "--host-header-height";

export function useHostHeaderHeightStyle(
    headerRef: RefObject<HTMLElement | null>,
    isHeaderRendered: boolean,
): CSSProperties {
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!isHeaderRendered || !header) {
            setHeight(0);
            return undefined;
        }
        const measure = () => setHeight(header.offsetHeight);
        measure();
        if (typeof ResizeObserver === "undefined") {
            return undefined;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(header);
        return () => observer.disconnect();
    }, [headerRef, isHeaderRendered]);

    return useMemo(() => ({ [HOST_HEADER_HEIGHT_VARIABLE]: `${height}px` }) as CSSProperties, [height]);
}
