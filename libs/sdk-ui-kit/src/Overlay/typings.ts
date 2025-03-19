// (C) 2020-2025 GoodData Corporation
import { IAlignPoint } from "../typings/positioning.js";
import { Alignment, OverlayPositionType } from "../typings/overlay.js";

/**
 * @internal
 */
export interface IOverlayProps<T> {
    alignPoints?: IAlignPoint[];
    alignTo?: string | HTMLElement | null;
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    closeOnMouseDrag?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;
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
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
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
        right: number;
        width?: number;
        height?: number;
        align: string;
    };
    initialVisiblePart: number;
    overflow?: string;
    scrollTop?: number;
    observedHeight?: number;
}
