// (C) 2025 GoodData Corporation

import {
    useFloating,
    autoUpdate,
    flip,
    offset,
    arrow,
    useHover,
    useFocus,
    useClick,
    useDismiss,
    useInteractions,
    FloatingPortal,
    FloatingArrow,
} from "@floating-ui/react";
import React, { useRef, useMemo, useState } from "react";
import { bem } from "../@utils/bem.js";
import { UiTooltipProps } from "./types.js";
import {
    computeArrowOffset,
    computeTooltipShift,
    getDimensionsFromRect,
    getDimensionsFromRef,
    getFlipFallbackOrder,
    getOppositeBasicPlacement,
} from "./utils.js";
import { ARROW_HEIGHT, ARROW_WIDTH } from "./constants.js";
import { useTheme, useIsScopeThemed, ConditionalScopedThemeProvider } from "@gooddata/sdk-ui-theme-provider";

const { b, e } = bem("gd-ui-kit-tooltip");

/**
 * @internal
 */
export const UiTooltip: React.FC<UiTooltipProps> = ({
    anchor,
    content,
    arrowPlacement = "top",
    triggerBy = [],
    hoverOpenDelay = 0,
    hoverCloseDelay = 0,
    showArrow = true,
    width,
    offset: offsetProp,
    optimalPlacement = false,
    accessibilityConfig,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef<SVGSVGElement>(null);
    const themeFromContext = useTheme();
    const isScopeThemed = useIsScopeThemed();
    const theme = isScopeThemed ? themeFromContext : undefined;

    const customShiftMiddleware = {
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

    const showTooltip = useMemo(() => isOpen || triggerBy.length === 0, [triggerBy, isOpen]);

    // trigger events
    const hover = useHover(context, {
        enabled: triggerBy.includes("hover"),
        move: false,
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

    //close on escape
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, hover, focus, click]);

    return (
        <>
            <div className={e("anchor")} ref={refs.setReference} {...getReferenceProps()}>
                {anchor}
            </div>

            <FloatingPortal>
                {showTooltip ? (
                    <ConditionalScopedThemeProvider>
                        <div
                            className={b({ width: width === "auto" ? "auto" : undefined })}
                            ref={refs.setFloating}
                            style={{
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
                            {content}
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
                ) : null}
            </FloatingPortal>
        </>
    );
};
