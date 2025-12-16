// (C) 2025 GoodData Corporation

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

import { ARROW_HEIGHT, ARROW_WIDTH, HIDE_DELAY, SHOW_DELAY } from "./constants.js";
import { type Dimensions, type UiTooltipProps } from "./types.js";
import {
    computeArrowOffset,
    computeTooltipShift,
    getDimensionsFromRect,
    getFlipFallbackOrder,
    getOppositeBasicPlacement,
} from "./utils.js";
import { bem } from "../@utils/bem.js";
import { FLOATING_ELEMENT_DATA_ATTR } from "../hooks/useCloseOnOutsideClick.js";
import { useFloatingPosition } from "../UiFloatingElement/useFloatingPosition.js";

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
    anchorWrapperStyles,
}: UiTooltipProps) {
    const [isOpenInternal, setIsOpen] = useState(false);
    const isOpen =
        !disabled && (isOpenProp === undefined ? isOpenInternal || triggerBy.length === 0 : isOpenProp);

    const arrowRef = useRef<SVGSVGElement>(null);
    const themeFromContext = useTheme();
    const isScopeThemed = useIsScopeThemed();
    const theme = isScopeThemed ? themeFromContext : undefined;

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open) {
                onOpen?.();
            } else {
                onClose?.();
            }
        },
        [onClose, onOpen],
    );

    const handleClose = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

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

    // Trigger events using floating-ui interactions (handles hover, focus, click)
    const hover = useHover(context, {
        enabled: triggerBy.includes("hover"),
        move: false,
        handleClose: safePolygon({ requireIntent: true }),
        delay: {
            open: hoverOpenDelay,
            close: hoverCloseDelay,
        },
    });

    const focus = useFocus(context, {
        enabled: triggerBy.includes("focus"),
    });

    const click = useClick(context, {
        enabled: triggerBy.includes("click"),
    });

    // Close on escape/outside click
    const dismiss = useDismiss(context, { enabled: isOpenProp === undefined });
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
                            ref={refs.setFloating}
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
