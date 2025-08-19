// (C) 2025 GoodData Corporation

import React, { useRef, useState } from "react";

import {
    FloatingArrow,
    FloatingPortal,
    Middleware,
    arrow,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    useClick,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
} from "@floating-ui/react";

import { ConditionalScopedThemeProvider, useIsScopeThemed, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ARROW_HEIGHT, ARROW_WIDTH, HIDE_DELAY, SHOW_DELAY } from "./constants.js";
import { UiTooltipProps } from "./types.js";
import {
    computeArrowOffset,
    computeTooltipShift,
    getDimensionsFromRect,
    getDimensionsFromRef,
    getFlipFallbackOrder,
    getOppositeBasicPlacement,
} from "./utils.js";
import { useOverlayZIndexWithRegister } from "../../Overlay/index.js";
import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-tooltip");

/**
 * @internal
 */
export const UiTooltip: React.FC<UiTooltipProps> = ({
    id,
    anchor,
    content,
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
}) => {
    const [isOpenInternal, setIsOpen] = useState(false);
    const isOpen = (isOpenInternal || triggerBy.length === 0) && !disabled;

    const arrowRef = useRef<SVGSVGElement>(null);
    const themeFromContext = useTheme();
    const isScopeThemed = useIsScopeThemed();
    const theme = isScopeThemed ? themeFromContext : undefined;

    const zIndex = useOverlayZIndexWithRegister();

    const customShiftMiddleware: Middleware = {
        name: "customShift",
        fn(args) {
            const { x, y, rects, middlewareData } = args;
            const currentFloatingDimensions = getDimensionsFromRect(rects?.floating);
            const enable = !middlewareData?.flip?.index;
            const shift = computeTooltipShift(arrowPlacement, currentFloatingDimensions, enable, theme);
            return {
                x: shift.x ? x + shift.x : x,
                y: shift.y ? y + shift.y : y,
            };
        },
    };

    const { refs, floatingStyles, context, middlewareData } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: getOppositeBasicPlacement(arrowPlacement),
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(offsetProp ?? ARROW_HEIGHT),
            customShiftMiddleware,
            ...(optimalPlacement
                ? [
                      flip({
                          fallbackPlacements: getFlipFallbackOrder(arrowPlacement),
                          fallbackStrategy: "initialPlacement",
                      }),
                  ]
                : []),
            arrow({
                element: arrowRef,
            }),
        ],
    });

    const triggerDimensions = getDimensionsFromRef(refs.reference);
    const floatingDimensions = getDimensionsFromRef(refs.floating);

    // trigger events
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

    const handleClose = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    //close on escape
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, hover, focus, click]);

    return (
        <>
            <div className={e("anchor")} ref={refs.setReference} {...getReferenceProps()}>
                {anchor}
            </div>

            {/* Accessibility: make the tooltip accessible to screen readers */}
            <span className="sr-only" id={id}>
                {isOpen
                    ? typeof content === "function"
                        ? content({ onClose: handleClose })
                        : content
                    : null}
            </span>

            {isOpen ? (
                <FloatingPortal>
                    <ConditionalScopedThemeProvider>
                        <div
                            className={b({ width: width === "auto" ? "auto" : false, variant })}
                            ref={refs.setFloating}
                            style={{
                                zIndex,
                                ...floatingStyles,
                                width: width === "auto" ? triggerDimensions.width : width,
                            }}
                            aria-label={accessibilityConfig?.ariaLabel}
                            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                            aria-describedby={accessibilityConfig?.ariaDescribedBy}
                            aria-expanded={accessibilityConfig?.ariaExpanded}
                            role={accessibilityConfig?.role ?? "tooltip"}
                            {...getFloatingProps()}
                        >
                            {typeof content === "function" ? content({ onClose: handleClose }) : content}

                            {showArrow ? (
                                <FloatingArrow
                                    staticOffset={computeArrowOffset(
                                        arrowPlacement,
                                        floatingDimensions,
                                        !middlewareData?.flip?.index,
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
};
