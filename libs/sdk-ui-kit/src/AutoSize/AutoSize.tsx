// (C) 2007-2025 GoodData Corporation
import { ReactElement, useEffect, useRef, useState } from "react";
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
    children: ({ width, height }: IAutoSizeChildren) => ReactElement;
}

/**
 * @internal
 */
export function AutoSize({ children }: IAutoSizeProps): ReactElement {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const updateSize = () => {
        const { width, height } = elementRegion(wrapperRef.current);
        setDimensions({ width, height });
    };

    const throttledUpdateSize = useRef(throttle(updateSize, 250, { leading: false })).current;

    useEffect(() => {
        window.addEventListener("resize", throttledUpdateSize);
        throttledUpdateSize();

        return () => {
            throttledUpdateSize.cancel();
            window.removeEventListener("resize", throttledUpdateSize);
        };
    }, [throttledUpdateSize]);

    return (
        <div ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            {children(dimensions)}
        </div>
    );
}
