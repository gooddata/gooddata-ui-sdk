// (C) 2007-2025 GoodData Corporation
import React, { useEffect, useRef, useState, useCallback } from "react";
import throttle from "lodash/throttle.js";
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
    children: ({ width, height }: IAutoSizeChildren) => React.ReactNode;
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
        const { width, height } = elementRegion(wrapperRef.current);

        setState({
            width,
            height,
        });
    }, []);

    const throttledUpdateSize = useCallback(() => {
        return throttle(updateSize, 250, { leading: false });
    }, [updateSize]);

    useEffect(() => {
        const throttled = throttledUpdateSize();

        window.addEventListener("resize", throttled);
        throttled();

        return () => {
            throttled.cancel();
            window.removeEventListener("resize", throttled);
        };
    }, [throttledUpdateSize]);

    const { width, height } = state;
    return (
        <div ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            {children({ width, height })}
        </div>
    );
}
