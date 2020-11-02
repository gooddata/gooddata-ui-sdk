// (C) 2020 GoodData Corporation
import { IAlignPoint } from "../typings/positioning";
import { Alignment } from "../typings/overlay";

/**
 * @internal
 */
export interface IOverlayProps<T> {
    alignPoints?: IAlignPoint[];
    alignTo?: string | HTMLElement;
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
    ignoreClicksOnByClass?: string[];

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
    positionType?: string;
    shouldCloseOnClick?: (e: React.MouseEvent) => boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    zIndex?: number | undefined;
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
