// (C) 2007-2026 GoodData Corporation

import {
    Children,
    type ReactElement,
    cloneElement,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { pickBy, throttle } from "lodash-es";

import { elementRegion } from "../utils/domUtilities.js";

import {
    type IFlexDimensionsHandle,
    type IFlexDimensionsProps,
    type IFlexDimensionsState,
} from "./typings.js";

/**
 * @internal
 */
export const FlexDimensions = forwardRef<IFlexDimensionsHandle, IFlexDimensionsProps>(function FlexDimensions(
    { children = false, className = "", measureWidth = true, measureHeight = true },
    ref,
) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [{ width, height }, setDimensions] = useState<IFlexDimensionsState>({ width: 0, height: 0 });

    const updateSize = useCallback((): void => {
        if (!wrapperRef.current) {
            return;
        }
        const { width, height } = elementRegion(wrapperRef.current);

        setDimensions({ width, height });
    }, []);

    useImperativeHandle(ref, () => ({ updateSize }), [updateSize]);

    const throttledUpdateSize = useMemo(() => throttle(updateSize, 250, { leading: false }), [updateSize]);

    useEffect(() => {
        // constructed here rather than during render so that this component can be rendered in
        // environments without a ResizeObserver (server-side rendering and the like)
        let resizeObserver: ResizeObserver | undefined;

        if (wrapperRef.current && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(throttledUpdateSize);
            resizeObserver.observe(wrapperRef.current);
        }

        throttledUpdateSize();

        return () => {
            throttledUpdateSize.cancel();
            resizeObserver?.disconnect();
        };
    }, [throttledUpdateSize]);

    const childrenDimensions = pickBy({ width, height }, (_, key) => {
        const setWidth = measureWidth && key === "width";
        const setHeight = measureHeight && key === "height";

        return setWidth || setHeight;
    });

    const child = Children.only(children);

    return (
        <div ref={wrapperRef} className={cx(className)}>
            {cloneElement(child as ReactElement<unknown>, childrenDimensions)}
        </div>
    );
});
