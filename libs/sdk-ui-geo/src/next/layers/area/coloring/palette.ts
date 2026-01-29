// (C) 2025-2026 GoodData Corporation

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { type IPushpinColor } from "../../../types/geoData/pushpin.js";
import { getPushpinColors } from "../../pushpin/coloring/palette.js";
import { DEFAULT_AREA_FILL_COLOR } from "../constants.js";

/**
 * Color for filled geographic areas
 *
 * @internal
 */
export interface IAreaAreaColor {
    /**
     * Fill color for the area (CSS color string or RGB color value)
     */
    fill: string;
}

function mapPushpinColorsToAreas(pushpinColors: IPushpinColor[]): IAreaAreaColor[] {
    if (pushpinColors.length === 0) {
        return [{ fill: DEFAULT_AREA_FILL_COLOR }];
    }

    return pushpinColors.map((pushpinColor) => ({
        fill: pushpinColor.background ?? DEFAULT_AREA_FILL_COLOR,
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
 * @internal
 */
export function getAreaAreaColors(
    colorData: number[],
    segmentData: string[],
    colorStrategy: IColorStrategy | null,
): IAreaAreaColor[] {
    if (!colorStrategy) {
        return [{ fill: DEFAULT_AREA_FILL_COLOR }];
    }

    if (segmentData.length > 0) {
        // Segment-based coloring should provide a stable color per category.
        const pushpinColors = getPushpinColors([], segmentData, colorStrategy);
        return mapPushpinColorsToAreas(pushpinColors);
    }

    if (colorData.length > 0) {
        const pushpinColors = getPushpinColors(colorData, [], colorStrategy);
        return mapPushpinColorsToAreas(pushpinColors);
    }

    return [{ fill: DEFAULT_AREA_FILL_COLOR }];
}
