// (C) 2020-2025 GoodData Corporation
import { IAlignPoint, IPositioning } from "../typings/positioning.js";

export const positioningToAlignPoints = (positioning: IPositioning[]): IAlignPoint[] =>
    positioning.map(({ snapPoints, offset }) => ({
        align: `${snapPoints.parent} ${snapPoints.child}`,
        offset,
    }));
