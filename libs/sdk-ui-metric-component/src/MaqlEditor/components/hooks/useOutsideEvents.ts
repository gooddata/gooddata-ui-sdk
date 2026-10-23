// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect } from "react";

import { type IRootRef } from "../ExpandableTooltip.js";

import { isInside, isIntersect, isKeyCancel } from "./utils.js";

/**
 * Custom hook that handles all outside events for the tooltip
 * - Mouse move: Close tooltip when mouse moves outside both the decorated text and tooltip
 * - Mouse down: Close tooltip when user clicks outside the tooltip (if expanded)
 * - Key down: Close tooltip when user presses Escape (if expanded)
 */
export function useOutsideEvents(
    _reference: MutableRefObject<IRootRef | null>,
    rectangles: Array<DOMRect>,
    className: string | null,
    expanded: boolean,
    onDestroy: () => void,
): void {
    useEffect(() => {
        // Handle mouse movement to close on hover out (when not expanded)
        const handleMouseMove = (e: MouseEvent) => {
            if (expanded) return;

            const point = [e.clientX, e.clientY] as [number, number];
            const intersects =
                rectangles.some((data) => isIntersect(data, point, 5)) || isInside(e, className);

            if (!intersects) {
                onDestroy();
            }
        };

        // Handle mouse click outside the tooltip (when expanded)
        const handleMouseDown = (e: MouseEvent) => {
            if (expanded && !isInside(e, className)) {
                onDestroy();
            }
        };

        // Handle keyboard escape (when expanded)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (expanded && isKeyCancel(e)) {
                onDestroy();
            }
        };

        document.body.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mousedown", handleMouseDown);
        document.body.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mousedown", handleMouseDown);
            document.body.removeEventListener("keydown", handleKeyDown);
        };
    }, [rectangles, className, expanded, onDestroy]);
}
