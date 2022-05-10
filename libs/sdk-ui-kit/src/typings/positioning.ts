// (C) 2020-2022 GoodData Corporation

/**
 * @internal
 */
export enum SnapPoint {
    TopLeft = "tl",
    TopCenter = "tc",
    TopRight = "tr",
    CenterLeft = "cl",
    CenterCenter = "cc",
    CenterRight = "cr",
    BottomLeft = "bl",
    BottomCenter = "bc",
    BottomRight = "br",
}

/**
 * @internal
 */
export interface ISnapPoints {
    parent: SnapPoint;
    child: SnapPoint;
}

/**
 * @internal
 */
export interface IOffset {
    x?: number;
    y?: number;
}

/**
 * @internal
 */
export interface IPositioning {
    snapPoints: ISnapPoints;
    offset?: IOffset;
}

/**
 * @internal
 */
export interface IAlignPoint {
    align: string;
    offset?: IOffset;
}

/**
 * @internal
 */
export type HelpMenuDropdownAlignPoints = "br tr" | "bl tl";
