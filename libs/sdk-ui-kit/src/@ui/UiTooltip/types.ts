// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

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
    /** Tooltip content id */
    id?: string;
    /** Position of the tooltip arrow relative to the tooltip, controls also the position of the tooltip */
    arrowPlacement?: TooltipArrowPlacement;

    /** Anchor element to be used as reference for the tooltip */
    anchor: ReactNode;

    /** Content to be rendered inside the tooltip */
    content: ReactNode | ((args: { onClose: () => void; type: "screen-reader" | "live" }) => ReactNode);

    /** Whether tooltip should show on hover, focus or click */
    triggerBy?: Array<"hover" | "focus" | "click">;

    /** Delay in milliseconds before showing tooltip on hover */
    hoverOpenDelay?: number;

    /** Delay in milliseconds before hiding tooltip after hover out */
    hoverCloseDelay?: number;

    /** Whether to show the arrow pointer */
    showArrow?: boolean;

    /** Width of the tooltip in pixels, 'same-as-anchor' to match anchor width, if not specified tooltip will be as wide as content */
    width?: number | "same-as-anchor";

    /** Distance in pixels between tooltip and anchor element, default is arrow height */
    offset?: number;

    /** Whether tooltip should automatically adjust position if it would render outside viewport */
    optimalPlacement?: boolean;

    /** ARIA attributes configuration for accessibility */
    accessibilityConfig?: IAccessibilityConfigBase;

    /**
     * Tooltip styling variant
     * @defaultValue "default"
     */
    variant?: "default" | "error" | "none";

    /** If the tooltip is disabled, only the anchor element will be shown */
    disabled?: boolean;
    /**
     * Occurs when the tooltip is opened
     */
    onOpen?: () => void;
    /**
     * Occurs when the tooltip is closed
     */
    onClose?: () => void;

    /**
     * Controls the open state of the tooltip, overrides the triggerBy prop if set
     */
    isOpen?: boolean;
}

export type Dimensions = { width: number; height: number };

export type PlacementShift = { x?: number; y?: number };
