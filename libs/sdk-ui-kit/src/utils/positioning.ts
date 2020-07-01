// (C) 2020 GoodData Corporation
import { IPositioning } from "../typings/positioning";

export const positioningToAlignPoints = (positioning: IPositioning[]) =>
    positioning.map(({ snapPoints, offset }) => ({
        align: `${snapPoints.parent} ${snapPoints.child}`,
        offset,
    }));
