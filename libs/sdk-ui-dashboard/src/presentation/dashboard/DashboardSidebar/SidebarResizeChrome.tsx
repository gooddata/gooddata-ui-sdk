// (C) 2026 GoodData Corporation

import {
    type ReactElement,
    type ReactNode,
    type PointerEvent as ReactPointerEvent,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { clamp } from "lodash-es";

import { makeKeyboardNavigation, useCloseOnEscape } from "@gooddata/sdk-ui-kit";

import { useResizableSidebar } from "./SidebarResizeContext.js";

const KEYBOARD_STEP = 10;

const handleSeparatorKeyboardNavigation = makeKeyboardNavigation({
    shrink: [{ code: "ArrowLeft" }],
    grow: [{ code: "ArrowRight" }],
    minimize: [{ code: "Home" }],
    maximize: [{ code: "End" }],
});

/**
 * Internal presentational wrapper that drives the dashboard sidebar drag-to-resize interaction.
 *
 * Owns only the live drag state (drag width — used for the dashed indicator transform — and drag
 * phase). The committed width, min/max, and the editor-canvas constraint live in the shared
 * {@link useResizableSidebar} state, so the same value also feeds the content area's width via the
 * `--gd-dashboard-sidebar-width` custom property.
 *
 * Renders `.gd-sidebar-container` itself so the resize handle can be positioned absolutely inside
 * it — that element is sticky+100vh, so the handle (and the grip centered inside it) tracks the
 * visible viewport rather than the full dashboard-root height.
 *
 * Drag uses `setPointerCapture` on the handle button so pointer events keep flowing to it even
 * when the cursor leaves the 6 px hit area. No DOM overlay or window-level listener is needed.
 *
 * @internal
 */
export function SidebarResizeChrome({
    onContainerClick,
    children,
}: {
    onContainerClick?: () => void;
    children: ReactNode;
}): ReactElement {
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const dragOriginRef = useRef<{
        clientX: number;
        width: number;
        pointerId: number;
    } | null>(null);

    const { width, min, max, canResize, setWidth } = useResizableSidebar();

    const isDragging = dragWidth !== null;

    // Tear down the drag without committing — used when the user presses Escape.
    const endDrag = () => {
        dragOriginRef.current = null;
        setDragWidth(null);
    };

    useCloseOnEscape(isDragging, endDrag);

    const handleKeyDown = handleSeparatorKeyboardNavigation({
        shrink: () => setWidth(width - KEYBOARD_STEP),
        grow: () => setWidth(width + KEYBOARD_STEP),
        minimize: () => setWidth(min),
        maximize: () => setWidth(max),
    });

    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragOriginRef.current = {
            clientX: event.clientX,
            width,
            pointerId: event.pointerId,
        };

        setDragWidth(width);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerId !== dragOriginRef.current?.pointerId) {
            return;
        }

        const nextWidth = widthFromClientX(event.clientX);

        if (nextWidth !== null) {
            setDragWidth(nextWidth);
        }
    };

    // Commit the last dragged width, then tear the drag down. onLostPointerCapture fires whenever the
    // captured pointer is released for any reason — pointerup, pointercancel, or the pointer being
    // lost (e.g. the mouse released outside the iframe/window) — so the final width is always
    // persisted even if a plain pointerup never reaches us.
    const handleLostPointerCapture = () => {
        if (dragWidth !== null) {
            setWidth(dragWidth);
        }

        endDrag();
    };

    const widthFromClientX = (clientX: number): number | null => {
        const origin = dragOriginRef.current;

        if (!origin) {
            return null;
        }

        return clamp(origin.width + (clientX - origin.clientX), min, max);
    };

    return (
        <div
            className={cx("gd-resizable-sidebar", {
                "gd-resizable-sidebar--resizable": canResize,
                "gd-resizable-sidebar--dragging": isDragging,
            })}
            style={{ width }}
        >
            <div
                className="col gd-flex-item gd-sidebar-container gd-sidebar-container--resizable"
                onClick={onContainerClick}
            >
                {children}

                <button
                    type="button"
                    style={
                        {
                            "--drag-x": `${isDragging ? dragWidth : width}px`,
                        } as React.CSSProperties
                    }
                    className={cx("gd-resizable-sidebar__handle", {
                        "gd-resizable-sidebar__handle--dragging": isDragging,
                    })}
                    disabled={!canResize}
                    role="separator"
                    aria-orientation="vertical"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={width}
                    onPointerDown={canResize ? handlePointerDown : undefined}
                    onPointerMove={handlePointerMove}
                    onLostPointerCapture={handleLostPointerCapture}
                    onKeyDown={isDragging ? undefined : handleKeyDown}
                >
                    <span className="gd-resizable-sidebar__handle-grip" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
