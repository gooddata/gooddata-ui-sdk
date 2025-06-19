// (C) 2025 GoodData Corporation

import {
    useFloating,
    autoUpdate,
    flip,
    offset,
    arrow,
    useHover,
    useFocus,
    useDismiss,
    useInteractions,
    FloatingPortal,
    FloatingArrow,
} from "@floating-ui/react";
import React, { useRef, useMemo, useState } from "react";
import { bem } from "@gooddata/sdk-ui-kit";
import { UiTooltipProps } from "./types.js";
import { UiTooltipAnchor } from "./UiTooltipAnchor.js";
import { UiTooltipContent } from "./UiTooltipContent.js";
import {
    computeArrowOffset,
    computeTooltipShift,
    getDimensionsFromRect,
    getDimensionsFromRef,
    getFlipFallbackOrder,
    getOppositeBasicPlacement,
} from "./utils.js";
import { ARROW_HEIGHT, ARROW_WIDTH, ARROW_EDGE_OFFSET } from "./constants.js";

const { b, e } = bem("gd-ui-kit-tooltip");

/**
 * @internal
 */
export const UiTooltip: React.FC<UiTooltipProps> = ({
    children,
    arrowPlacement = "top",
    hoverTrigger = false,
    focusTrigger = false,
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

    const customShiftMiddleware = {
        name: "customShift",
        fn(args) {
            const { x, y, rects, middlewareData } = args;
            const currentFloatingDimensions = getDimensionsFromRect(rects?.floating);
            const enable = !middlewareData?.flip?.index;
            const shift = computeTooltipShift(arrowPlacement, currentFloatingDimensions, enable);
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
                padding: ARROW_EDGE_OFFSET,
            }),
        ],
    });

    const triggerDimensions = getDimensionsFromRef(refs.reference);
    const floatingDimensions = getDimensionsFromRef(refs.floating);

    const showTooltip = useMemo(
        () => isOpen || !(hoverTrigger || focusTrigger),
        [hoverTrigger, focusTrigger, isOpen],
    );

    // trigger events
    const hover = useHover(context, {
        enabled: hoverTrigger,
        move: false,
        delay: {
            open: hoverOpenDelay,
            close: hoverCloseDelay,
        },
    });
    const focus = useFocus(context, {
        enabled: focusTrigger,
    });
    //close on escape
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, hover, focus]);

    //children rendering logic
    const childrenArray = React.Children.toArray(children);
    const anchorChild = childrenArray.find(
        (child): child is React.ReactElement => React.isValidElement(child) && child.type === UiTooltipAnchor,
    );
    const contentChild = childrenArray.find(
        (child): child is React.ReactElement =>
            React.isValidElement(child) && child.type === UiTooltipContent,
    );

    return (
        <>
            <div className={e("anchor")} ref={refs.setReference} {...getReferenceProps()}>
                {anchorChild}
            </div>

            <FloatingPortal>
                {showTooltip ? (
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
                        {contentChild}
                        {showArrow ? (
                            <FloatingArrow
                                staticOffset={computeArrowOffset(
                                    arrowPlacement,
                                    floatingDimensions,
                                    !middlewareData?.flip?.index,
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
                ) : null}
            </FloatingPortal>
        </>
    );
};
