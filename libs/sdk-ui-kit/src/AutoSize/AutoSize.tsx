// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { throttle } from "lodash-es";

import { elementRegion } from "../utils/domUtilities.js";

/**
 * @internal
 */
export interface IAutoSizeChildren {
    width: number;
    height: number;
}

/**
 * @internal
 */
export interface IAutoSizeProps {
    children: ({ width, height }: IAutoSizeChildren) => ReactNode;
}

/**
 * @internal
 */
export function AutoSize({ children }: IAutoSizeProps) {
    const [state, setState] = useState({
        width: 0,
        height: 0,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    const updateSize = useCallback(() => {
        if (!wrapperRef.current) {
            return;
        }
        const { width, height } = elementRegion(wrapperRef.current);

        setState({
            width,
            height,
        });
    }, []);

    const throttledUpdateSize = useMemo(() => throttle(updateSize, 250, { leading: false }), [updateSize]);

    // Measure synchronously before paint so the first committed frame already has a real width
    // instead of 0 (which made children shrink-wrap). This handles the initial render.
    useLayoutEffect(() => {
        updateSize();
    }, [updateSize]);

    useEffect(() => {
        const node = wrapperRef.current;

        // Re-measure whenever the wrapper actually resizes. This catches the post-mount layout
        // settle (e.g. a fullscreen overlay finishing its alignment a few frames later, where the
        // synchronous measure above read a not-yet-final width - such as before a scrollbar
        // disappears) as well as any later container or window resize - precisely, instead of
        // guessing with a fixed timeout. Throttled to coalesce bursts during continuous resizing.
        let observer: ResizeObserver | undefined;
        if (node && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => {
                throttledUpdateSize();
            });
            observer.observe(node);
        } else {
            // Fallback for environments without ResizeObserver.
            window.addEventListener("resize", throttledUpdateSize);
        }

        return () => {
            observer?.disconnect();
            throttledUpdateSize.cancel();
            window.removeEventListener("resize", throttledUpdateSize);
        };
    }, [throttledUpdateSize]);

    const { width, height } = state;
    return (
        <div ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            {children({ width, height })}
        </div>
    );
}
