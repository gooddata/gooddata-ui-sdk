// (C) 2025 GoodData Corporation

import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { getPushpinColors } from "./palette.js";
import { IPushpinColor } from "../../types/shared.js";

/**
 * Color for filled geographic areas
 *
 * @alpha
 */
export interface IAreaAreaColor {
    /**
     * Fill color for the area (CSS color string or RGB color value)
     */
    fill: string;
}

const DEFAULT_AREA_COLOR = "#20B2E2";

function mapPushpinColorsToAreas(pushpinColors: IPushpinColor[]): IAreaAreaColor[] {
    if (pushpinColors.length === 0) {
        return [{ fill: DEFAULT_AREA_COLOR }];
    }

    return pushpinColors.map((pushpinColor) => ({
        fill: pushpinColor.background ?? DEFAULT_AREA_COLOR,
    }));
}

/**
 * Gets colors for geographic areas based on color strategy
 *
 * @remarks
 * Retrieves fill colors for geographic areas from the color strategy.
 * If segments exist, uses segment-based coloring. Otherwise, uses color measure values for gradients.
 *
 * @param colorData - Array of color measure values
 * @param segmentData - Array of segment values
 * @param colorStrategy - Color strategy to use
 * @returns Array of area colors matching the data
 *
 * @alpha
 */
export function getAreaAreaColors(
    colorData: number[],
    segmentData: string[],
    colorStrategy: IColorStrategy | null,
): IAreaAreaColor[] {
    if (!colorStrategy) {
        return [{ fill: DEFAULT_AREA_COLOR }];
    }

    if (segmentData.length > 0) {
        // Segment-based coloring should provide a stable color per category.
        const pushpinColors = getPushpinColors([], segmentData, colorStrategy);
        return mapPushpinColorsToAreas(pushpinColors);
    }

    if (colorData.length > 0) {
        const pushpinColors = getPushpinColors(colorData as Array<number | null>, [], colorStrategy);
        return mapPushpinColorsToAreas(pushpinColors);
    }

    return [{ fill: DEFAULT_AREA_COLOR }];
}
