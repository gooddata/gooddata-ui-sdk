// (C) 2025 GoodData Corporation

import { type CSSProperties, useCallback, useEffect, useState } from "react";

import { FloatingPortal } from "@floating-ui/react";
import cx from "classnames";

import { ConditionalScopedThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { type IUiFloatingElementProps } from "./types.js";
import { useFloatingPosition } from "./useFloatingPosition.js";
import { getDimensionsFromRef, resolveAnchor } from "./utils.js";
import { bem } from "../@utils/bem.js";
import { useCloseOnEscape } from "../hooks/useCloseOnEscape.js";
import { useCloseOnMouseDrag } from "../hooks/useCloseOnMouseDrag.js";
import { FLOATING_ELEMENT_DATA_ATTR, useCloseOnOutsideClick } from "../hooks/useCloseOnOutsideClick.js";
import { useCloseOnParentScroll } from "../hooks/useCloseOnParentScroll.js";

const { b, e } = bem("gd-ui-kit-floating-element");

// Stable empty array to avoid re-creating on every render
const EMPTY_IGNORE_CLICKS_ON: Array<string | HTMLElement> = [];

/**
 * A low-level component for rendering floating elements (dropdowns, popovers, tooltips, etc.)
 * using floating-ui for positioning.
 *
 * @remarks
 * This component is designed as a modern replacement for the Overlay component,
 * providing similar functionality with a simpler API and better performance.
 *
 * Features:
 * - Automatic positioning with floating-ui
 * - Portal rendering to avoid overflow issues
 * - Close on outside click, escape, parent scroll, mouse drag
 * - Legacy align point format support for easier migration
 * - Z-index management via OverlayController
 *
 * @internal
 */
export function UiFloatingElement({
    children,
    anchor,
    isOpen,
    onClose,
    placement = "bottom-start",
    alignPoints,
    strategy = "absolute",
    offset,
    autoFlip = true,
    closeOnOutsideClick = true,
    closeOnEscape = false,
    closeOnParentScroll = false,
    closeOnMouseDrag = false,
    ignoreClicksOn = EMPTY_IGNORE_CLICKS_ON,
    shouldCloseOnClick,
    zIndex: zIndexProp,
    className,
    contentClassName,
    style,
    width = "auto",
    maxWidth,
    maxHeight,
    accessibilityConfig,
    onPlacementChange,
}: IUiFloatingElementProps) {
    const [resolvedAnchor, setResolvedAnchor] = useState(() => resolveAnchor(anchor));

    // Core positioning
    const {
        refs,
        floatingStyles,
        placement: actualPlacement,
        zIndex,
    } = useFloatingPosition({
        isOpen,
        placement,
        alignPoints,
        strategy,
        offset,
        autoFlip,
        maxWidth,
        maxHeight,
        zIndex: zIndexProp,
    });

    // Close behaviors - each hook is independent and composable
    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    useCloseOnOutsideClick(isOpen && closeOnOutsideClick, handleClose, {
        floatingRef: refs.floating,
        anchorRef: refs.reference,
        ignoreClicksOn,
        shouldCloseOnClick,
    });

    useCloseOnEscape(isOpen && closeOnEscape, handleClose);

    useCloseOnParentScroll(isOpen && closeOnParentScroll, handleClose, refs.reference);

    useCloseOnMouseDrag(isOpen && closeOnMouseDrag, handleClose);

    // Update anchor reference when it changes
    useEffect(() => {
        const resolved = resolveAnchor(anchor);
        setResolvedAnchor(resolved);
        refs.setReference(resolved);
    }, [anchor, refs]);

    // Notify when placement changes
    useEffect(() => {
        onPlacementChange?.(actualPlacement);
    }, [actualPlacement, onPlacementChange]);

    // Compute width style
    const getWidthStyle = useCallback((): CSSProperties => {
        if (width === "same-as-anchor") {
            const dimensions = getDimensionsFromRef(resolvedAnchor);
            return { width: dimensions.width };
        }
        if (typeof width === "number") {
            return { width };
        }
        return {};
    }, [width, resolvedAnchor]);

    if (!isOpen) {
        return null;
    }

    return (
        <FloatingPortal>
            <ConditionalScopedThemeProvider>
                <div
                    ref={refs.setFloating}
                    className={cx(b(), className)}
                    style={{
                        ...floatingStyles,
                        ...getWidthStyle(),
                        ...style,
                        zIndex,
                    }}
                    {...{ [FLOATING_ELEMENT_DATA_ATTR]: true }}
                    role={accessibilityConfig?.role}
                    aria-label={accessibilityConfig?.ariaLabel}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                >
                    <div className={cx(e("content"), contentClassName)}>{children}</div>
                </div>
            </ConditionalScopedThemeProvider>
        </FloatingPortal>
    );
}
