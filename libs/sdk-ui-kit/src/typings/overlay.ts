// (C) 2020-2022 GoodData Corporation
import { IAlignPoint } from "./positioning";
import { IRegion } from "./domUtilities";

/**
 * @internal
 */

export type GetOptimalAlignment = {
    targetRegion: IRegion;
    selfRegion: IRegion;
    ignoreScrollOffsets?: boolean;
    alignPoints: IAlignPoint[];
    overlayRootElement?: HTMLElement;
    getViewportRegion?: (ignoreScrollOffsets: boolean) => void;
    getDocumentRegion?: () => void;
};

/**
 * @internal
 */

export type GetPositionedSelfRegion = {
    targetRegion: IRegion;
    selfRegion: IRegion;
    bodyRegion: IRegion;
    alignPoint: IAlignPoint;
};

/**
 * @internal
 */

export type GetOptimalAlignmentForRegion = {
    boundaryRegion: any;
    targetRegion: any;
    selfRegion: any;
    alignPoints: IAlignPoint[];
    overlayRootElement: HTMLElement;
};

/**
 * @internal
 */

export type Alignment = {
    left: number;
    top: number;
    right: number;
    align: string;
};

/**
 * @internal
 */
export interface IOptimalAlignment {
    alignment: Alignment;
    visiblePart?: number;
}

/**
 * @internal
 */
export type SameAsTargetPosition = "sameAsTarget";

/**
 * @internal
 */
export type OverlayPositionType = "absolute" | "fixed" | SameAsTargetPosition;
