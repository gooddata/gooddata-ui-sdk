// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useLayoutEffect, useMemo, useRef, useState } from "react";

import { type IRootRef } from "../ExpandableTooltip.js";

import { useOutsideEvents } from "./useOutsideEvents.js";

interface ICachedPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

type Position = {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
};

export function useRePosition(
    reference: MutableRefObject<IRootRef | null>,
    elements: Array<HTMLElement>,
    className: string,
    opened: boolean,
    onDestroy: () => void,
    cachedPositions?: Array<ICachedPosition | undefined>,
): {
    element: MutableRefObject<HTMLDivElement | null>;
    position: Position;
} {
    const element = useRef<HTMLDivElement | null>(null);
    const [bounding, setBounding] = useState<DOMRect | null>(null);

    // Get valid rectangles from elements - using cached positions if elements are disconnected
    const rectangles = useMemo(() => {
        // Create rectangles from elements or cached positions
        const rects: Array<DOMRect> = [];

        elements.forEach((el, idx) => {
            const isConnected = el ? el.isConnected : false;
            const inBody = el ? document.body.contains(el) : false;

            let rect: DOMRect | null = null;

            // Try to get rectangle from element
            if (isConnected && inBody) {
                try {
                    rect = el.getBoundingClientRect();
                } catch {
                    // silent error
                }
            }

            // If element is disconnected, use cached position
            if ((!rect || rect.width === 0 || rect.height === 0) && cachedPositions?.[idx]) {
                const cached = cachedPositions[idx];
                // Create a DOMRect-like object from cached position if cached exists
                if (cached) {
                    rect = {
                        top: cached.top,
                        left: cached.left,
                        width: cached.width,
                        height: cached.height,
                        right: cached.left + cached.width,
                        bottom: cached.top + cached.height,
                        x: cached.left,
                        y: cached.top,
                        toJSON: () => ({}),
                    };
                }
            }

            if (rect && rect.width > 0 && rect.height > 0) {
                rects.push(rect);
            }
        });

        return rects;
    }, [elements, cachedPositions]);

    // Update bounding rect when element or tooltip state changes
    useLayoutEffect(() => {
        if (!element.current) return;

        // Update immediately
        const initialBounding = element.current.getBoundingClientRect();
        setBounding(initialBounding);

        // Update on resize too
        const observer = new ResizeObserver(() => {
            if (element.current) {
                setBounding(element.current.getBoundingClientRect());
            }
        });

        observer.observe(element.current);
        return () => observer.disconnect();
    }, [opened]);

    // Calculate position based on rectangles and window size
    const position = useMemo(() => {
        const { innerWidth, innerHeight } = window;
        const { width, height } = bounding || { width: 0, height: 0 };

        // If we have no valid rectangles, use a default position
        if (rectangles.length === 0) {
            return { top: 10, left: 10 };
        }

        const [topCorner, leftCorner] = getPosition(rectangles);

        const res = { top: topCorner, left: leftCorner } as Position;

        // Handle edge overflow
        if (leftCorner + width > innerWidth) {
            delete res.left;
            res.right = 0;
        }
        if (topCorner + height > innerHeight) {
            delete res.top;
            res.bottom = 0;
        }

        return res;
    }, [rectangles, bounding]);

    // Combined hook for all outside interactions
    useOutsideEvents(reference, rectangles, className, opened, onDestroy);

    return {
        element,
        position,
    };
}

function getPosition(rectangles: Array<DOMRect>): [number, number] {
    // Add a safeguard for empty rectangles array
    if (rectangles.length === 0) {
        return [10, 10]; // Provide a small default offset
    }

    const initialValues: [number, number] = [0, Number.MAX_SAFE_INTEGER];

    const finalPosition = rectangles.reduce((prev, current) => {
        if (!current) return prev;

        return [Math.max(prev[0], current.top + current.height), Math.min(prev[1], current.left)] as [
            number,
            number,
        ];
    }, initialValues);

    // If leftCorner is still MAX_SAFE_INTEGER, use a reasonable default
    if (finalPosition[1] === Number.MAX_SAFE_INTEGER) {
        finalPosition[1] = 10;
    }

    return finalPosition;
}
