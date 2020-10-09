// (C) 2020 GoodData Corporation
import { IAlignPoint } from "../typings/positioning";
import { IRegion } from "../typings/domUtilities";

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
export interface IOptimalAlignment {
    alignment: {
        left: number;
        top: number;
        right: number;
        align: string;
    };
    visiblePart: number;
}

/**
 * @internal
 */

export type OverlayPositionType = "absolute" | "fixed" | "sameAsTarget";
