// (C) 2026 GoodData Corporation

import {
    type ReactElement,
    type ReactNode,
    type PointerEvent as ReactPointerEvent,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { clamp } from "lodash-es";

import { bem } from "../@utils/bem.js";
import { useCloseOnEscape } from "../hooks/useCloseOnEscape.js";

import { type IUiResizableSidebarState } from "./types.js";
import { useOptionalUiResizableSidebar } from "./UiResizableSidebarContext.js";
import {
    type IUiResizableSidebarHandleContext,
    UiResizableSidebarHandleContext,
} from "./UiResizableSidebarHandleContext.js";

const { b } = bem("gd-ui-kit-resizable-sidebar");

const DEFAULT_KEYBOARD_STEP = 10;

/**
 * @internal
 */
export interface IUiResizableSidebarProps {
    /**
     * Width state to render. Defaults to the state of the nearest {@link UiResizableSidebarProvider}; one
     * of the two is required. `setWidth` is called once per gesture with the width to commit: on pointer
     * release, or on every key press.
     */
    state?: IUiResizableSidebarState;
    /**
     * Pixels one arrow key press resizes by. Defaults to 10.
     */
    keyboardStep?: number;
    dataTestId?: string;
    /**
     * The sidebar content. Render {@link UiResizableSidebarHandle} as a direct child of the sidebar, next to
     * the content, so it spans the sidebar's full height and tracks its right edge.
     */
    children: ReactNode;
}

/**
 * Drag-to-resize wrapper for a sidebar. Owns only the in-progress drag: the sidebar keeps its committed
 * width during the gesture while the handle shows the indicated width, and the width is committed on
 * release. Escape cancels the drag.
 *
 * @remarks
 * The width transition can be kept in step with sibling layout transitions by setting the
 * `--resizable-sidebar-slide-duration` custom property on the sidebar element. A sidebar collapsed to
 * zero width is inert, so its collapse toggle cannot restore it: render a second
 * {@link UiResizableSidebarCollapseToggle} or a {@link UiResizableSidebarExpandTrigger} outside it.
 *
 * @internal
 */
export function UiResizableSidebar({
    state,
    keyboardStep = DEFAULT_KEYBOARD_STEP,
    dataTestId,
    children,
}: IUiResizableSidebarProps): ReactElement {
    const providedState = useOptionalUiResizableSidebar();
    const resolvedState = state ?? providedState;

    if (!resolvedState) {
        throw new Error(
            "`UiResizableSidebar` needs a `state` prop or a `UiResizableSidebarProvider` above it",
        );
    }

    const { width, min, max, canResize, setWidth: onWidthChange, isCollapsed } = resolvedState;
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const dragRef = useRef<{
        originX: number;
        originWidth: number;
        pointerId: number;
        width: number;
        handle: HTMLButtonElement;
    } | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);

    const isDragging = dragWidth !== null;
    const isHidden = isCollapsed && width === 0;

    // Set imperatively: React 18 drops a boolean `inert` and React 19 treats an empty string as false.
    useLayoutEffect(() => {
        rootRef.current?.toggleAttribute("inert", isHidden);
    }, [isHidden]);

    const endDrag = useCallback(() => {
        const drag = dragRef.current;
        dragRef.current = null;
        setDragWidth(null);

        // Clearing the drag first keeps the resulting lostpointercapture from committing anything.
        if (drag?.handle.hasPointerCapture?.(drag.pointerId)) {
            drag.handle.releasePointerCapture(drag.pointerId);
        }
    }, []);

    useCloseOnEscape(isDragging, endDrag);

    const onPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLButtonElement>) => {
            if (!event.isPrimary || event.button !== 0) {
                return;
            }

            event.preventDefault();
            // Capturing keeps the gesture on the handle even when the cursor leaves its narrow hit area.
            event.currentTarget.setPointerCapture?.(event.pointerId);
            dragRef.current = {
                originX: event.clientX,
                originWidth: width,
                pointerId: event.pointerId,
                width,
                handle: event.currentTarget,
            };
            setDragWidth(width);
        },
        [width],
    );

    const onPointerMove = useCallback(
        (event: ReactPointerEvent<HTMLButtonElement>) => {
            const drag = dragRef.current;

            if (!drag) {
                return;
            }

            if (event.pointerId !== drag.pointerId) {
                return;
            }

            drag.width = clamp(drag.originWidth + (event.clientX - drag.originX), min, max);
            setDragWidth(drag.width);
        },
        [min, max],
    );

    // Fires for pointerup, pointercancel, and a pointer lost to another window, so the width is committed
    // even when no plain pointerup reaches the handle.
    const onLostPointerCapture = useCallback(() => {
        if (dragRef.current) {
            onWidthChange(dragRef.current.width);
        }

        endDrag();
    }, [onWidthChange, endDrag]);

    const handleContext = useMemo<IUiResizableSidebarHandleContext>(
        () => ({
            width,
            min,
            max,
            canResize,
            isDragging,
            dragWidth,
            keyboardStep,
            setWidth: onWidthChange,
            onPointerDown,
            onPointerMove,
            onLostPointerCapture,
        }),
        [
            width,
            min,
            max,
            canResize,
            isDragging,
            dragWidth,
            keyboardStep,
            onWidthChange,
            onPointerDown,
            onPointerMove,
            onLostPointerCapture,
        ],
    );

    return (
        <UiResizableSidebarHandleContext.Provider value={handleContext}>
            <div
                ref={rootRef}
                className={b({
                    resizable: canResize,
                    dragging: isDragging,
                    collapsed: isCollapsed,
                    hidden: isHidden,
                })}
                style={{ width }}
                data-testid={dataTestId}
            >
                {children}
            </div>
        </UiResizableSidebarHandleContext.Provider>
    );
}
