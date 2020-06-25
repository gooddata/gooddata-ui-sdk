// (C) 2020 GoodData Corporation

/**
 * @alpha
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
 * @alpha
 */
export interface ISnapPoints {
    parent: SnapPoint;
    child: SnapPoint;
}

/**
 * @alpha
 */
export interface IOffset {
    x?: number;
    y?: number;
}

/**
 * @alpha
 */
export interface IPositioning {
    snapPoints: ISnapPoints;
    offset?: IOffset;
}
