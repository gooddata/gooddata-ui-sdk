// (C) 2021-2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";

export function useMouseDownRepeat(
    timeout: number,
    onMouseDownHandler?: (e: MouseEvent) => void,
): (e: MouseEvent) => void {
    const callback = useCallback((e: MouseEvent) => onMouseDownHandler?.(e), [onMouseDownHandler]);
    const [start, stop] = useInterval(callback, timeout);

    useEffect(() => {
        document.addEventListener("mouseup", stop);
        return () => document.removeEventListener("mouseup", stop);
    }, [stop]);

    return useCallback(
        (e: MouseEvent) => {
            start(e);
            if (onMouseDownHandler) {
                onMouseDownHandler(e);
            }
        },
        [onMouseDownHandler, start],
    );
}

function useInterval<T extends Array<unknown>>(
    handler: (...args: T) => void,
    timeout: number,
): [(...args: T) => void, () => void] {
    const timer = useRef<number>(-1);
    const [start, setStart] = useState(false);
    const [fnArgs, setArguments] = useState<T>([] as unknown as T);

    const clear = useCallback(() => {
        window.clearInterval(timer.current);
    }, []);

    useEffect(() => {
        if (start) {
            timer.current = window.setInterval(() => handler(...fnArgs), timeout);
        } else {
            clear();
        }
        return clear;
    }, [clear, fnArgs, handler, start, timeout]);

    return [
        (...args: T) => {
            setArguments(args);
            setStart(true);
        },
        () => {
            setStart(false);
            clear();
        },
    ];
}
