// (C) 2025-2026 GoodData Corporation

import type { IGeoLegendItem } from "../../types/common/legends.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import type { ILegendColorCategoryItem } from "../../types/legend/model.js";

/**
 * Fallback color used when no color is assigned to a legend item.
 *
 * @internal
 */
export const FALLBACK_LEGEND_COLOR = "#ccc";

/**
 * URI prefix for synthetic legend items representing attribute-only layers.
 *
 * @internal
 */
export const ATTRIBUTE_ONLY_URI_PREFIX = "__attribute_only__";

/**
 * Neutral grayscale start for segmented color scales.
 *
 * @internal
 */
export const SEGMENTED_COLOR_SCALE_MIN_COLOR = "var(--gd-palette-complementary-2)";

/**
 * Neutral grayscale end for segmented color scales.
 *
 * @internal
 */
export const SEGMENTED_COLOR_SCALE_MAX_COLOR = "var(--gd-palette-complementary-8)";

/**
 * Converts existing legend items to color category items.
 *
 * @param legendItems - Base legend items from layer output
 * @returns Array of color category items
 *
 * @internal
 */
export function convertToColorCategories(legendItems: IGeoLegendItem[]): ILegendColorCategoryItem[] {
    return legendItems.map((item) => ({
        type: "colorCategory" as const,
        label: item.name,
        color: item.color ?? FALLBACK_LEGEND_COLOR,
        uri: item.uri,
        isVisible: item.isVisible,
    }));
}

/**
 * Checks whether area geo data represents an attribute-only layer
 * (area attribute present, no segment or color measure).
 *
 * @internal
 */
export function isAttributeOnlyAreaData(geoData: IAreaGeoData): boolean {
    return !geoData.segment && !geoData.color && Boolean(geoData.area);
}

/**
 * Checks whether pushpin geo data represents an attribute-only layer
 * (location attribute present, no segment, color, or size measure).
 *
 * @internal
 */
export function isAttributeOnlyPushpinData(geoData: IPushpinGeoData): boolean {
    return !geoData.segment && !geoData.color && !geoData.size && Boolean(geoData.location);
}

/**
 * Checks whether geo data represents an attribute-only layer based on
 * the layer type discriminator.
 *
 * @internal
 */
export function isAttributeOnlyGeoData(geoData: IAreaGeoData, layerType: "area"): boolean;
export function isAttributeOnlyGeoData(geoData: IPushpinGeoData, layerType: "pushpin"): boolean;
export function isAttributeOnlyGeoData(
    geoData: IAreaGeoData | IPushpinGeoData,
    layerType: "area" | "pushpin",
): boolean;
export function isAttributeOnlyGeoData(
    geoData: IAreaGeoData | IPushpinGeoData,
    layerType: "area" | "pushpin",
): boolean {
    if (layerType === "area") {
        return isAttributeOnlyAreaData(geoData as IAreaGeoData);
    }
    return isAttributeOnlyPushpinData(geoData as IPushpinGeoData);
}
