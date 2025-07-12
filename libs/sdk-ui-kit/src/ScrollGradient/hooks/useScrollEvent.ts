// (C) 2022-2025 GoodData Corporation

import { useEffect, useCallback, MouseEvent } from "react";

import { useNumberState } from "./useNumberState.js";
import { useContentHeight } from "./useContentHeight.js";

export function useScrollEvent(
    content: HTMLElement | null,
    size: number,
    onScroll?: (event: MouseEvent<HTMLDivElement>) => void,
): {
    top: number;
    bottom: number;
    onScrollHandler: (event: MouseEvent<HTMLDivElement>) => void;
} {
    const [top, setTop] = useNumberState();
    const [bottom, setBottom] = useNumberState();
    const contentHeight = useContentHeight(content);

    useEffect(() => {
        calculateOpacities(content, size, [top, setTop], [bottom, setBottom]);
    }, [bottom, setBottom, setTop, size, top, content, contentHeight]);

    const onScrollHandler = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            calculateOpacities(content, size, [top, setTop], [bottom, setBottom]);
            onScroll?.(event);
        },
        [bottom, onScroll, setBottom, setTop, size, top, content],
    );

    return { top, bottom, onScrollHandler };
}

function calculateOpacities(
    content: HTMLElement | null,
    size: number,
    t: ReturnType<typeof useNumberState>,
    b: ReturnType<typeof useNumberState>,
) {
    const scrollTop = content ? content.scrollTop : 0;
    const topOpacity = calculateOpacity(scrollTop, size);

    const scrollBottom = content ? content.scrollHeight - content.offsetHeight - content.scrollTop : 0;
    const bottomOpacity = calculateOpacity(scrollBottom, size);

    const [top, setTop] = t;
    if (top !== topOpacity) {
        setTop(topOpacity);
    }

    const [bottom, setBottom] = b;
    if (bottom !== bottomOpacity) {
        setBottom(bottomOpacity);
    }
}

function calculateOpacity(current: number, size: number) {
    const opacity = Math.min(current / size, 1);

    if (opacity > 0) {
        return Math.max(opacity, 0.2);
    }
    return opacity;
}
