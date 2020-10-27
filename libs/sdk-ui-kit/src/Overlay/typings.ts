// (C) 2020 GoodData Corporation
import { IAlignPoint } from "../typings/positioning";
import { OverlayPositionType, Alignment } from "../typings/overlay";

/**
 * @public
 */

/**
 * @internal
 */
export interface IOverlayProps<T> {
    alignPoints?: IAlignPoint[];
    alignTo?: string;
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    closeOnMouseDrag?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;
    closeOnEscape?: boolean;

    /**
     * Array of refs where user clicks should be ignored
     * and overlay should not be closed by clicking on them
     */
    ignoreClicksOn?: T[];
    ignoreClicksOnByClass?: T[];

    isModal?: boolean;
    onAlign?: (optiimalAlign: Alignment) => void;
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
    shouldCloseOnClick?: (e: React.MouseEvent) => boolean;
    onClick?: () => void;
    onMouseOver?: () => void;
    onMouseUp?: () => void;
    zIndex?: number;
}

/**
 * @internal
 */

export interface IOverlayState {
    alignment: {
        left: number;
        top: number;
        right: number;
        align: string;
    };
    overflow?: string;
    scrollTop?: number;
}
