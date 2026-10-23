// (C) 2022-2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useMouseDownRepeat } from "./useMouseDownRepeat.js";

export function useScrollByButtons(
    element: HTMLElement | null,
    timeout = 150,
    step = 100,
): {
    enabled: boolean;
    canLeft: boolean;
    canRight: boolean;
    onLeft: (e: MouseEvent) => void;
    onRight: (e: MouseEvent) => void;
} {
    const { enabled, canLeft, canRight } = useChanged(element);
    const changed = useScroll(element);

    const onLeftHandler = useCallback(() => onMove(element, -step), [element, step]);
    const onLeft = useMouseDownRepeat(timeout, onLeftHandler);

    const onRightHandler = useCallback(() => onMove(element, step), [element, step]);
    const onRight = useMouseDownRepeat(timeout, onRightHandler);

    return useMemo(
        () => ({
            enabled,
            canLeft,
            canRight,
            onLeft,
            onRight,
        }),
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [enabled, canLeft, canRight, onLeft, onRight, changed],
    );
}

function useScroll(element: HTMLElement | null) {
    const [changed, setChanged] = useState("");

    useEffect(() => {
        if (!element) {
            return;
        }
        const handler = (e: Event) => setChanged(e.timeStamp + Math.random().toString(36));
        element.addEventListener("scroll", handler);
        return () => {
            element.removeEventListener("scroll", handler);
        };
    }, [element]);

    return changed;
}

function useChanged(element: HTMLElement | null) {
    const { offsetWidth = 0, scrollWidth = 0, scrollLeft = 0 } = element || {};
    const [width, setWidth] = useState(offsetWidth);
    const [contentWidth, setContentWidth] = useState(scrollWidth);

    const enabled = contentWidth > width;
    const canLeft = scrollLeft > 0;
    const canRight = scrollLeft < contentWidth - width;

    useEffect(() => {
        let pointer: number;

        const checkChange = () => {
            const { offsetWidth = 0, scrollWidth = 0 } = element || {};
            if (width !== offsetWidth) {
                setWidth(offsetWidth);
            }
            if (contentWidth !== scrollWidth) {
                setContentWidth(scrollWidth);
            }
            pointer = window.requestAnimationFrame(checkChange);
        };
        pointer = window.requestAnimationFrame(checkChange);
        return () => window.cancelAnimationFrame(pointer);
    }, [contentWidth, element, width]);

    return {
        enabled,
        canLeft,
        canRight,
    };
}

function onMove(element: HTMLElement | null, step: number) {
    if (!element) {
        return;
    }

    if (element.scrollBy) {
        element.scrollBy({
            left: step,
            behavior: "smooth",
        });
        return;
    }
    //fallback for IE
    element.scrollLeft += step;
}
