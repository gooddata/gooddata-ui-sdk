// (C) 2020-2025 GoodData Corporation
import { assertNever } from "@gooddata/sdk-model";

import { type IAlignPoint, type IOffset } from "../typings/positioning.js";

/**
 * @internal
 */
export type HorizontalPosition = "left" | "center" | "right";

/**
 * @internal
 */
export type VerticalPosition = "top" | "center" | "bottom";

/**
 * @internal
 */
export type PositionPoint = `${VerticalPosition}-${HorizontalPosition}`;

/**
 * @internal
 */
export function positionPointToAlignPoint(positionPoint: PositionPoint): string {
    const [verticalAlign, horizontalAlign] = positionPoint.split("-");

    return `${convertVerticalPoint(verticalAlign as VerticalPosition)}${convertHorizontalPoint(
        horizontalAlign as HorizontalPosition,
    )}`;
}

/**
 * @internal
 */
export type AlignConfig = {
    triggerAlignPoint: PositionPoint;
    overlayAlignPoint: PositionPoint;
    offset?: IOffset;
};

/**
 * @internal
 */
export function alignConfigToAlignPoint({
    triggerAlignPoint,
    overlayAlignPoint,
    offset,
}: AlignConfig): IAlignPoint {
    return {
        align: `${positionPointToAlignPoint(triggerAlignPoint)} ${positionPointToAlignPoint(
            overlayAlignPoint,
        )}`,
        offset,
    };
}

function convertVerticalPoint(verticalPoint: VerticalPosition): string {
    switch (verticalPoint) {
        case "top":
            return "t";
        case "center":
            return "c";
        case "bottom":
            return "b";
        default:
            assertNever(verticalPoint);
            return "c";
    }
}

function convertHorizontalPoint(horizontalPoint: HorizontalPosition): string {
    switch (horizontalPoint) {
        case "left":
            return "l";
        case "center":
            return "c";
        case "right":
            return "r";
        default:
            assertNever(horizontalPoint);
            return "c";
    }
}
