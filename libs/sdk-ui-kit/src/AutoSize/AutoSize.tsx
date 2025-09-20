// (C) 2007-2025 GoodData Corporation

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
        const { width, height } = elementRegion(wrapperRef.current);

        setState({
            width,
            height,
        });
    }, []);

    const throttledUpdateSize = useMemo(() => throttle(updateSize, 250, { leading: false }), [updateSize]);

    useEffect(() => {
        window.addEventListener("resize", throttledUpdateSize);
        throttledUpdateSize();

        return () => {
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
