// (C) 2025 GoodData Corporation

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

    /** Content to be rendered inside the tooltip, should include UiTooltipAnchor and UiTooltipContent */
    children?: React.ReactNode;

    /** Whether tooltip should show on hover */
    hoverTrigger?: boolean;

    /** Whether tooltip should show on focus */
    focusTrigger?: boolean;

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
