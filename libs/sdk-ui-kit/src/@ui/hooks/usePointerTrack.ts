// (C) 2026 GoodData Corporation

import { type PointerEvent as ReactPointerEvent, useRef } from "react";

/**
 * @internal
 */
export interface IPointerTrackHandlers {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
    onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * Follows a press and everything it drags through.
 *
 * @remarks
 * The handlers must be spread on the element the gesture is measured against: they report
 * `currentTarget`, and a caller that reads a child's or a parent's size instead will place the value
 * somewhere the pointer is not.
 *
 * @internal
 */
export function usePointerTrack(
    track: (event: ReactPointerEvent<HTMLElement>) => void,
): IPointerTrackHandlers {
    const isTracking = useRef(false);

    const stop = () => {
        isTracking.current = false;
    };

    return {
        onPointerDown: (event) => {
            if (event.button !== 0) {
                return;
            }
            isTracking.current = true;
            // Capturing keeps the gesture on this element, so a drag that leaves it keeps reporting
            // and ends wherever it is released, with no window listeners to lose to a re-render.
            event.currentTarget.setPointerCapture?.(event.pointerId);
            track(event);
        },
        onPointerMove: (event) => {
            if (!isTracking.current) {
                return;
            }
            // A move with nothing held is a plain hover: the press ended somewhere this element was
            // not told about, and following it would change the value without being touched.
            if (event.buttons === 0) {
                stop();
                return;
            }
            track(event);
        },
        onPointerUp: stop,
        onPointerCancel: stop,
        onLostPointerCapture: stop,
    };
}
