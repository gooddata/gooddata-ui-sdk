// (C) 2026 GoodData Corporation

import {
    type ReactElement,
    type ReactNode,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { clamp } from "lodash-es";

import { useLocalStorage } from "@gooddata/sdk-ui";
import { makeKeyboardNavigation, useCloseOnEscape } from "@gooddata/sdk-ui-kit";

const SIDEBAR_MIN_WIDTH = 230;
const SIDEBAR_MAX_WIDTH = 500;
const EDITOR_MIN_WIDTH = 960;
const KEYBOARD_STEP = 10;
const LOCAL_STORAGE_KEY = "gd-dashboard-sidebar-width";

const handleSeparatorKeyboardNavigation = makeKeyboardNavigation({
    shrink: [{ code: "ArrowLeft" }],
    grow: [{ code: "ArrowRight" }],
    minimize: [{ code: "Home" }],
    maximize: [{ code: "End" }],
});

/**
 * Returns the current `window.innerWidth`, kept in sync with the `resize` event.
 */
function useWindowWidth(): number {
    const [width, setWidth] = useState<number>(() => window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
}

/**
 * Internal presentational wrapper that holds the dashboard sidebar drag-to-resize state.
 *
 * Owns: committed width (persisted to localStorage), live drag width (only used for the dashed
 * indicator transform), drag phase, and a window-width tracker that enforces a minimum editor
 * canvas width without overwriting the user's persisted preference.
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

    const containerWidth = useWindowWidth();
    const [persistedWidth, setPersistedWidth] = useLocalStorage<number>(LOCAL_STORAGE_KEY, SIDEBAR_MIN_WIDTH);

    const effectiveMax = clamp(containerWidth - EDITOR_MIN_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);
    const effectiveWidth = clamp(persistedWidth, SIDEBAR_MIN_WIDTH, effectiveMax);

    const isDragging = dragWidth !== null;
    const isResizable = effectiveMax > SIDEBAR_MIN_WIDTH;

    const endDrag = () => {
        dragOriginRef.current = null;
        setDragWidth(null);
    };

    useCloseOnEscape(isDragging, endDrag);

    const handleKeyDown = handleSeparatorKeyboardNavigation({
        shrink: () =>
            setPersistedWidth(clamp(effectiveWidth - KEYBOARD_STEP, SIDEBAR_MIN_WIDTH, effectiveMax)),
        grow: () => setPersistedWidth(clamp(effectiveWidth + KEYBOARD_STEP, SIDEBAR_MIN_WIDTH, effectiveMax)),
        minimize: () => setPersistedWidth(SIDEBAR_MIN_WIDTH),
        maximize: () => setPersistedWidth(effectiveMax),
    });

    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragOriginRef.current = {
            clientX: event.clientX,
            width: effectiveWidth,
            pointerId: event.pointerId,
        };

        setDragWidth(effectiveWidth);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerId !== dragOriginRef.current?.pointerId) {
            return;
        }

        const width = widthFromClientX(event.clientX);

        if (width !== null) {
            setDragWidth(width);
        }
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerId !== dragOriginRef.current?.pointerId) {
            return;
        }

        const width = widthFromClientX(event.clientX);

        if (width !== null) {
            setPersistedWidth(width);
        }

        endDrag();
    };

    const widthFromClientX = (clientX: number): number | null => {
        const origin = dragOriginRef.current;

        if (!origin) {
            return null;
        }

        return clamp(origin.width + (clientX - origin.clientX), SIDEBAR_MIN_WIDTH, effectiveMax);
    };

    return (
        <div
            className={cx("gd-resizable-sidebar", {
                "gd-resizable-sidebar--resizable": isResizable,
                "gd-resizable-sidebar--dragging": isDragging,
            })}
            style={{ width: effectiveWidth }}
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
                            "--drag-x": `${isDragging ? dragWidth : effectiveWidth}px`,
                        } as React.CSSProperties
                    }
                    className={cx("gd-resizable-sidebar__handle", {
                        "gd-resizable-sidebar__handle--dragging": isDragging,
                    })}
                    disabled={!isResizable}
                    role="separator"
                    aria-orientation="vertical"
                    aria-valuemin={SIDEBAR_MIN_WIDTH}
                    aria-valuemax={effectiveMax}
                    aria-valuenow={effectiveWidth}
                    onPointerDown={isResizable ? handlePointerDown : undefined}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={endDrag}
                    onKeyDown={isDragging ? undefined : handleKeyDown}
                >
                    <span className="gd-resizable-sidebar__handle-grip" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
