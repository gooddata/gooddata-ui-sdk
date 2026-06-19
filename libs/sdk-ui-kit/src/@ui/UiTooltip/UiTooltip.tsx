// (C) 2025-2026 GoodData Corporation

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
    FloatingArrow,
    FloatingPortal,
    type Middleware,
    safePolygon,
    useClick,
    useDismiss,
    useFocus,
    useHover,
    useInteractions,
} from "@floating-ui/react";

import { ConditionalScopedThemeProvider, useIsScopeThemed, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { bem } from "../@utils/bem.js";
import {
    FLOATING_ELEMENT_DATA_ATTR,
    isClickInsideOwnSubtree,
    useRegisterFloatingAnchor,
} from "../hooks/useCloseOnOutsideClick.js";
import { useFloatingPosition } from "../UiFloatingElement/useFloatingPosition.js";

import { ARROW_HEIGHT, ARROW_WIDTH, HIDE_DELAY, SHOW_DELAY } from "./constants.js";
import { type Dimensions, type IUiTooltipProps } from "./types.js";
import {
    computeArrowOffset,
    computeTooltipShift,
    getDimensionsFromRect,
    getFlipFallbackOrder,
    getOppositeBasicPlacement,
} from "./utils.js";

const { b, e } = bem("gd-ui-kit-tooltip");

/**
 * @internal
 */
export function UiTooltip({
    id,
    anchor,
    content,
    behaviour = "tooltip",
    arrowPlacement = "top",
    triggerBy = [],
    hoverOpenDelay = SHOW_DELAY,
    hoverCloseDelay = HIDE_DELAY,
    showArrow = true,
    width,
    offset: offsetProp,
    optimalPlacement = false,
    accessibilityConfig,
    variant = "default",
    disabled,
    isOpen: isOpenProp,
    onOpen,
    onClose,
    onOpenChange,
    anchorWrapperStyles,
}: IUiTooltipProps) {
    const [isOpenInternal, setIsOpen] = useState(false);
    const isControlled = isOpenProp !== undefined;
    const isOpen = !disabled && (isControlled ? isOpenProp : isOpenInternal || triggerBy.length === 0);

    const arrowRef = useRef<SVGSVGElement>(null);
    const themeFromContext = useTheme();
    const isScopeThemed = useIsScopeThemed();
    const theme = isScopeThemed ? themeFromContext : undefined;

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            onOpenChange?.(open);
            if (open) {
                onOpen?.();
            } else {
                onClose?.();
            }
        },
        [onClose, onOpen, onOpenChange],
    );

    const handleClose = useCallback(() => {
        setIsOpen(false);
        onOpenChange?.(false);
        onClose?.();
    }, [onClose, onOpenChange]);

    // Custom shift middleware for tooltip arrow positioning
    const customShiftMiddleware: Middleware = useMemo(
        () => ({
            name: "customShift",
            fn(args) {
                if (behaviour === "popover") {
                    return {};
                }
                const { x, y, rects, middlewareData } = args;
                const currentFloatingDimensions = getDimensionsFromRect(rects?.floating);
                const enable = !middlewareData?.["flip"]?.index;
                const shift = computeTooltipShift(arrowPlacement, currentFloatingDimensions, enable, theme);
                return {
                    x: shift.x ? x + shift.x : x,
                    y: shift.y ? y + shift.y : y,
                };
            },
        }),
        [arrowPlacement, behaviour, theme],
    );

    // Use shared floating position hook
    const { refs, floatingStyles, zIndex, context, middlewareData } = useFloatingPosition({
        isOpen,
        onOpenChange: handleOpenChange,
        placement: getOppositeBasicPlacement(arrowPlacement, behaviour),
        offset: offsetProp ?? ARROW_HEIGHT,
        autoFlip: optimalPlacement,
        fallbackPlacements: optimalPlacement ? getFlipFallbackOrder(arrowPlacement, behaviour) : undefined,
        arrowRef: showArrow ? arrowRef : undefined,
        customMiddleware: [customShiftMiddleware],
    });

    // Get dimensions for width calculation
    const triggerDimensions = useMemo(() => {
        const rect = refs.reference.current?.getBoundingClientRect?.();
        return getDimensionsFromRect(rect ?? null);
    }, [refs.reference, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Use state + layoutEffect to get dimensions AFTER DOM paints
    // This fixes arrow positioning for *-end placements on initial render
    const [floatingDimensions, setFloatingDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    useLayoutEffect(() => {
        if (isOpen && refs.floating.current) {
            const rect = refs.floating.current.getBoundingClientRect();
            setFloatingDimensions(getDimensionsFromRect(rect));
        } else {
            setFloatingDimensions({ width: 0, height: 0 });
        }
    }, [isOpen, refs.floating]);

    // Trigger events using floating-ui interactions (handles hover, focus, click).
    // When controlled the open state is owned by the parent, so the anchor's own
    // triggers are suppressed — otherwise an anchor that is shared with another
    // popover (e.g. the labels picker reusing the permission-menu button) would
    // toggle both.
    const hover = useHover(context, {
        enabled: !isControlled && triggerBy.includes("hover"),
        move: false,
        handleClose: safePolygon({ requireIntent: true }),
        delay: {
            open: hoverOpenDelay,
            close: hoverCloseDelay,
        },
    });

    const focus = useFocus(context, {
        enabled: !isControlled && triggerBy.includes("focus"),
    });

    const click = useClick(context, {
        enabled: !isControlled && triggerBy.includes("click"),
    });

    // Read the anchor lazily — floating-ui's `refs.reference` is a mutable
    // ref that only has a current value once the reference element mounts,
    // which is independent of our render cycle.
    const setFloatingWithAnchorRegistry = useRegisterFloatingAnchor(refs.setFloating, () =>
        refs.reference.current instanceof Element ? refs.reference.current : null,
    );

    // Dismiss stays enabled even when controlled so outside-click / Escape can
    // request a close; the request is surfaced through handleOpenChange → onOpenChange.
    const dismiss = useDismiss(context, {
        outsidePress: (event) =>
            !isClickInsideOwnSubtree(event.target as Element | null, refs.floating.current),
    });
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, hover, focus, click]);

    return (
        <>
            <div
                className={e("anchor")}
                ref={refs.setReference}
                style={anchorWrapperStyles}
                {...getReferenceProps()}
            >
                {anchor}
            </div>

            {/* Accessibility: make the tooltip accessible to screen readers */}
            <span className="sr-only" id={id}>
                {isOpen
                    ? typeof content === "function"
                        ? content({ onClose: handleClose, type: "screen-reader" })
                        : content
                    : null}
            </span>

            {isOpen ? (
                <FloatingPortal>
                    <ConditionalScopedThemeProvider>
                        <div
                            className={b({
                                width: width === "same-as-anchor" ? "same-as-anchor" : false,
                                variant,
                            })}
                            ref={setFloatingWithAnchorRegistry}
                            style={{
                                zIndex,
                                ...floatingStyles,
                                width: width === "same-as-anchor" ? triggerDimensions?.width : width,
                            }}
                            {...{ [FLOATING_ELEMENT_DATA_ATTR]: true }}
                            aria-label={accessibilityConfig?.ariaLabel}
                            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                            aria-describedby={accessibilityConfig?.ariaDescribedBy}
                            aria-expanded={accessibilityConfig?.ariaExpanded}
                            role={accessibilityConfig?.role ?? "tooltip"}
                            {...getFloatingProps()}
                        >
                            {typeof content === "function"
                                ? content({ onClose: handleClose, type: "live" })
                                : content}

                            {showArrow ? (
                                <FloatingArrow
                                    staticOffset={computeArrowOffset(
                                        arrowPlacement,
                                        floatingDimensions,
                                        !middlewareData?.["flip"]?.index,
                                        theme,
                                    )}
                                    className={e("arrow")}
                                    ref={arrowRef}
                                    tipRadius={1}
                                    context={context}
                                    height={ARROW_HEIGHT}
                                    width={ARROW_WIDTH}
                                />
                            ) : null}
                        </div>
                    </ConditionalScopedThemeProvider>
                </FloatingPortal>
            ) : null}
        </>
    );
}
