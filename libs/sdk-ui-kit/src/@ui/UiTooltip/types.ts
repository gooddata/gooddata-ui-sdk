// (C) 2025 GoodData Corporation

import React from "react";
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";

/**
 * @internal
 */
export type TooltipArrowPlacement =
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";

/**
 * @internal
 */
export interface UiTooltipProps {
    /** Position of the tooltip arrow relative to the tooltip, controls also the position of the tooltip */
    arrowPlacement?: TooltipArrowPlacement;

    /** Anchor element to be used as reference for the tooltip */
    anchor: React.ReactNode;

    /** Content to be rendered inside the tooltip */
    content: React.ReactNode | ((args: { onClose: () => void }) => React.ReactNode);

    /** Whether tooltip should show on hover, focus or click */
    triggerBy?: Array<"hover" | "focus" | "click">;

    /** Delay in milliseconds before showing tooltip on hover */
    hoverOpenDelay?: number;

    /** Delay in milliseconds before hiding tooltip after hover out */
    hoverCloseDelay?: number;

    /** Whether to show the arrow pointer */
    showArrow?: boolean;

    /** Width of the tooltip in pixels, or 'auto' to match anchor width */
    width?: number | "auto";

    /** Distance in pixels between tooltip and anchor element, default is arrow height */
    offset?: number;

    /** Whether tooltip should automatically adjust position if it would render outside viewport */
    optimalPlacement?: boolean;

    /** ARIA attributes configuration for accessibility */
    accessibilityConfig?: IAccessibilityConfigBase;
}

export type Dimensions = { width: number; height: number };

export type PlacementShift = { x?: number; y?: number };
