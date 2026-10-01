// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactElement, useContext } from "react";

import { clamp } from "lodash-es";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";

import { UiResizableSidebarHandleContext } from "./UiResizableSidebarHandleContext.js";

const { e } = bem("gd-ui-kit-resizable-sidebar");

const handleSeparatorKeyboardNavigation = makeKeyboardNavigation({
    shrink: [{ code: "ArrowLeft" }],
    grow: [{ code: "ArrowRight" }],
    minimize: [{ code: "Home" }],
    maximize: [{ code: "End" }],
});

/**
 * @internal
 */
export interface IUiResizableSidebarHandleProps {
    accessibilityConfig?: Pick<IAccessibilityConfigBase, "ariaLabel" | "ariaLabelledBy" | "ariaControls">;
    dataTestId?: string;
}

/**
 * The drag handle of {@link UiResizableSidebar}: a vertical separator that follows the pointer during a
 * drag and resizes by arrow, Home and End keys when focused. Must be rendered inside the sidebar.
 *
 * @internal
 */
export function UiResizableSidebarHandle({
    accessibilityConfig,
    dataTestId,
}: IUiResizableSidebarHandleProps): ReactElement {
    const context = useContext(UiResizableSidebarHandleContext);

    if (!context) {
        throw new Error("`UiResizableSidebarHandle` must be rendered within `UiResizableSidebar`");
    }

    const {
        width,
        min,
        max,
        canResize,
        isDragging,
        dragWidth,
        keyboardStep,
        setWidth,
        onPointerDown,
        onPointerMove,
        onLostPointerCapture,
    } = context;

    const resizeTo = (next: number) => {
        const clamped = clamp(next, min, max);

        if (clamped !== width) {
            setWidth(clamped);
        }
    };

    const handleKeyDown = handleSeparatorKeyboardNavigation({
        shrink: () => resizeTo(width - keyboardStep),
        grow: () => resizeTo(width + keyboardStep),
        minimize: () => resizeTo(min),
        maximize: () => resizeTo(max),
    });

    return (
        <button
            type="button"
            style={{ "--resizable-sidebar-drag-x": `${isDragging ? dragWidth : width}px` } as CSSProperties}
            className={e("handle", { dragging: isDragging })}
            disabled={!canResize}
            role="separator"
            aria-orientation="vertical"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={width}
            aria-label={accessibilityConfig?.ariaLabel}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            aria-controls={accessibilityConfig?.ariaControls}
            data-testid={dataTestId}
            onPointerDown={canResize ? onPointerDown : undefined}
            onPointerMove={onPointerMove}
            onLostPointerCapture={onLostPointerCapture}
            onKeyDown={isDragging ? undefined : handleKeyDown}
        />
    );
}
