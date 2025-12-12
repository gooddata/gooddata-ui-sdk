// (C) 2020-2025 GoodData Corporation

import { type IRegion } from "./domUtilities.js";
import { type IAlignPoint } from "./positioning.js";

/**
 * @internal
 */

export type GetOptimalAlignment = {
    targetRegion: IRegion;
    selfRegion: IRegion;
    ignoreScrollOffsets?: boolean;
    alignPoints: IAlignPoint[];
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
};

/**
 * @internal
 */

export type Alignment = {
    left: number;
    top: number;
    right?: number;
    width?: number;
    height?: number;
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
