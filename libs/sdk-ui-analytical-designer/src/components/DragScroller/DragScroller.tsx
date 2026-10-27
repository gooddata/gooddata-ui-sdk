// (C) 2021-2026 GoodData Corporation

import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef } from "react";

import { throttle } from "lodash-es";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

import { smoothingGenerator } from "./cd_smooth.js";
import { getTimeTracker } from "./time_tracker.js";
import { getAnimationRange, getAreaHit, getSmoothTime, isEventWithinRect } from "./utils.js";

const SPRING_STIFFNESS_FACTOR = 2;
const ACTIVE_CONTAINER_FRACTION = 4;
const MILLISECONDS_BETWEEN_EVENTS = 180;
const MINIMUM_SCROLLED_PIXELS = 5;

export interface IDragScrollerProps {
    className?: string;
    children: ReactNode;
    smoother?: (
        from: number,
        to: number,
        smoothTime: number,
        velocity?: number,
    ) => Generator<number, void, number>;
    scheduleAnimationFrame?: (animationFrame: () => void) => number;
    activeFraction?: number;
    window?: Window;
}

export function DragScroller({
    className = "",
    children,
    smoother = smoothingGenerator,
    scheduleAnimationFrame = window.requestAnimationFrame.bind(window),
    activeFraction = ACTIVE_CONTAINER_FRACTION,
    window: windowProp = window,
}: IDragScrollerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // user clicked the mouse
    const isMouseDownRef = useRef(false);

    // user is dragging mouse
    const isDraggingRef = useRef(false);

    // controls whether the animation is running
    const isRunningRef = useRef(false);

    // DOMRect of scroller element
    const containerRectRef = useRef<DOMRect | null>(null);

    // Inner container scroll height
    const containerScrollHeightRef = useRef(-1);

    const getContainer = useCallback(() => {
        return containerRef.current;
    }, []);

    const updateContainerRect = useCallback(() => {
        containerRectRef.current = getContainer()?.getBoundingClientRect();

        containerScrollHeightRef.current = getContainer() ? getContainer().scrollHeight : 0;
    }, [getContainer]);

    const dispatchScroll = useCallback(
        (event: MouseEvent) => {
            // Ignore scroll event when just scrollable container size has changed. Chrome issue.
            const { scrollHeight } = getContainer();
            if (scrollHeight !== containerScrollHeightRef.current) {
                updateContainerRect();
                return;
            }

            windowProp.dispatchEvent(
                new CustomEvent(GOODSTRAP_SCROLLED_EVENT, {
                    bubbles: true,
                    detail: {
                        node: event.target,
                    },
                }),
            );
        },
        [getContainer, updateContainerRect, windowProp],
    );

    const runAnimation = useCallback(
        (range: { from: number; to: number }, smoothTime: number) => {
            const smootherInstance = smoother(range.from, range.to, smoothTime);
            smootherInstance.next();

            const tick = getTimeTracker();

            const animationFrame = () => {
                const { done, value } = smootherInstance.next(tick());
                smootherInstance.next();

                isRunningRef.current = isRunningRef.current && !done;

                if (isRunningRef.current && getContainer()) {
                    getContainer().scrollTop = value as number;
                    scheduleAnimationFrame(animationFrame);
                }
            };

            scheduleAnimationFrame(animationFrame);
        },
        [getContainer, scheduleAnimationFrame, smoother],
    );

    const onMouseDown = useCallback(() => {
        isMouseDownRef.current = true;
        isDraggingRef.current = false;
    }, []);

    const onMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isMouseDownRef.current && isDraggingRef.current) {
                if (isEventWithinRect(event, containerRectRef.current)) {
                    const areaHit = getAreaHit(event, getContainer(), activeFraction);
                    if (areaHit === "middle") {
                        isRunningRef.current = false;
                        return;
                    }

                    if (!isRunningRef.current) {
                        const range = getAnimationRange(getContainer(), areaHit);
                        const smoothTime = getSmoothTime(range, SPRING_STIFFNESS_FACTOR);

                        if (range.to - range.from === 0) {
                            return;
                        }

                        isRunningRef.current = true;
                        runAnimation(range, smoothTime);
                    }

                    event.preventDefault();
                } else {
                    isRunningRef.current = false;
                }
            }
            if (isMouseDownRef.current) {
                // on first mouseDown, also mouseMove is called in Chrome on Windows
                // it is needed to ignore the very first mouseMove after mouseDown
                // https://stackoverflow.com/questions/30169521/how-to-prevent-mousemove-after-mousedown-or-mouseup-in-chrome-possible-bug-in-c
                isDraggingRef.current = true;
            }
        },
        [activeFraction, getContainer, runAnimation],
    );

    const onMouseUp = useCallback(() => {
        isMouseDownRef.current = false;
        isDraggingRef.current = false;
        isRunningRef.current = false;
    }, []);

    const onResize = useCallback(() => {
        updateContainerRect();
    }, [updateContainerRect]);

    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const scrollHandler = useCallback(
        throttle((e) => {
            if (getContainer() && getContainer().scrollTop >= MINIMUM_SCROLLED_PIXELS) {
                dispatchScroll(e);
            }
        }, MILLISECONDS_BETWEEN_EVENTS),
        [dispatchScroll, getContainer],
    );

    useEffect(() => {
        updateContainerRect();

        windowProp.addEventListener("resize", onResize, true);
        windowProp.addEventListener("mousedown", onMouseDown, true);
        windowProp.addEventListener("mouseup", onMouseUp, true);
        windowProp.addEventListener("mousemove", onMouseMove, true);

        const container = getContainer();
        if (container) {
            container.addEventListener("scroll", scrollHandler);
        }

        return () => {
            windowProp.removeEventListener("resize", onResize, true);
            windowProp.removeEventListener("mousedown", onMouseDown, true);
            windowProp.removeEventListener("mouseup", onMouseUp, true);
            windowProp.removeEventListener("mousemove", onMouseMove, true);

            if (container) {
                container.removeEventListener("scroll", scrollHandler);
            }
        };
    }, [
        getContainer,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onResize,
        scrollHandler,
        updateContainerRect,
        windowProp,
    ]);

    const styles: CSSProperties = { overflowY: "auto" };

    return (
        <div ref={containerRef} className={className} style={styles}>
            {children}
        </div>
    );
}
