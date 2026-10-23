// (C) 2020-2026 GoodData Corporation

import { type MouseEvent, type ReactNode } from "react";

import { type Alignment, type OverlayPositionType } from "../typings/overlay.js";
import { type IAlignPoint } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IOverlayProps<T> {
    id?: string;
    alignPoints?: IAlignPoint[];
    alignTo?: string | HTMLElement | null;
    children?: ReactNode;
    className?: string;
    containerClassName?: string;
    closeOnMouseDrag?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;
    /**
     * Re-align the overlay to its anchor when any scrollable parent of the anchor is scrolled.
     * When not set, the value is taken from the closest OverlayAlignOnParentScrollProvider (off by default).
     */
    alignOnParentScroll?: boolean;
    /**
     * Call onClose once the anchor gets fully hidden, e.g. scrolled out of view of a scrollable parent.
     * When not set, the value is taken from the closest OverlayAlignOnParentScrollProvider (off by default).
     */
    closeOnAnchorHidden?: boolean;
    closeOnEscape?: boolean;
    width?: number | string;
    maxWidth?: number | string;

    /**
     * Specifies a threshold for resizing the component when its content changes.
     * The threshold is a percentage (0-1) of the component's height.
     * For example, a threshold of 0.1 means the component will resize when its content
     * changes by 10% of its height.
     */
    resizeObserverThreshold?: number;

    /**
     * Keeps the align point chosen on open. When the overlay height changes, its bottom edge stays in place
     * and the overlay moves only to stay within the viewport, so a control clicked near the bottom stays under
     * the pointer. Requires resizeObserverThreshold lower than 1. Not meant to be combined with ensureVisibility.
     */
    keepBottomOnResize?: boolean;

    /**
     * Array of refs where user clicks should be ignored
     * and overlay should not be closed by clicking on them
     */
    ignoreClicksOn?: T[];
    ignoreClicksOnByClass?: string[];

    isModal?: boolean;
    onAlign?: (optimalAlign: Alignment) => void;
    onClose?: () => void;
    /**
     * positionType: sameAsTarget
     * Overlay's position is calculated based on the target's position type
     * If target's position is fixed,
     *  - the overlay will also be in fixed position (position: fixed)
     *  - the overlay's offsets (top, left) will be calculated based on
     *    target's offsets (top, left), without scroll offsets
     */
    positionType?: OverlayPositionType;

    shouldCloseOnClick?: (e: Event) => boolean;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
    zIndex?: number | undefined;
    ensureVisibility?: boolean;
}

/**
 * @internal
 */

export interface IOverlayState {
    alignment: {
        left: number;
        top: number;
        right?: number;
        width?: number;
        height?: number;
        align: string;
    };
    visiblePart: number;
    overflow?: string;
    scrollTop?: number;
    observedHeight: number;
}
