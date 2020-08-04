// (C) 2020 GoodData Corporation
import { IPositioning, IAlignPoint } from "../typings/positioning";

export const positioningToAlignPoints = (positioning: IPositioning[]): IAlignPoint[] =>
    positioning.map(({ snapPoints, offset }) => ({
        align: `${snapPoints.parent} ${snapPoints.child}`,
        offset,
    }));
