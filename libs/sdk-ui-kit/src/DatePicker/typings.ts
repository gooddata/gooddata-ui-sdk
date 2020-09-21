// (C) 2020 GoodData Corporation
import { IAlignPoint } from "../typings/positioning";

/**
 * @internal
 */

export interface Region {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
}

/**
 * @internal
 */

export type GetOptimalAlignment = {
    targetRegion: Record<string, unknown>;
    selfRegion: Record<string, unknown>;
    ignoreScrollOffsets?: boolean;
    alignPoints: IAlignPoint[];
    getViewportRegion?: (ignoreScrollOffsets: boolean) => void;
    getDocumentRegion?: () => void;
};

/**
 * @internal
 */

export type GetPositionedSelfRegion = {
    targetRegion: Region;
    selfRegion: Region;
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
