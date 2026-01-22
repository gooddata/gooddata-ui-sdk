// (C) 2025-2026 GoodData Corporation

import { computeColorScale } from "./computeColorScale.js";
import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import {
    type ILegendColorCategoryItem,
    type ILegendGroup,
    type ILegendSection,
} from "../../types/legend/model.js";

/**
 * Converts legend items to color category items for area layers.
 *
 * @param legendItems - Base legend items from layer output
 * @returns Array of color category items
 *
 * @internal
 */
function convertToColorCategories(legendItems: IGeoLegendItem[]): ILegendColorCategoryItem[] {
    return legendItems.map((item) => ({
        type: "colorCategory" as const,
        label: item.name,
        color: item.color ?? "#ccc", // Fallback color for undefined
        uri: item.uri,
        isVisible: item.isVisible,
    }));
}

/**
 * Input parameters for computing area legend section.
 *
 * @internal
 */
export interface IComputeAreaLegendParams {
    layerId: string;
    layerName: string;
    geoData: IAreaGeoData;
    legendItems: IGeoLegendItem[];
    availableLegends: IAvailableLegends;
    numericSymbols?: string[];
}

/**
 * Computes legend section for an area layer.
 *
 * @remarks
 * Creates a legend section with color legend items. Supports both:
 * - Categorical color (segment attribute) - shows color swatches per category
 * - Numeric color scale (measure) - shows min/max gradient scale
 * Area layers do not have size legends.
 * Returns null when there are no legend groups to display (e.g., area-only charts).
 *
 * @param params - Parameters for computation
 * @returns Legend section for the area layer, or null if no legend data
 *
 * @alpha
 */
export function computeAreaLegend(params: IComputeAreaLegendParams): ILegendSection | null {
    const { layerId, layerName, geoData, legendItems, availableLegends, numericSymbols } = params;

    const groups: ILegendGroup[] = [];

    // Add categorical color legend group if available (segment attribute)
    if (availableLegends.hasCategoryLegend && legendItems.length > 0) {
        const colorCategories = convertToColorCategories(legendItems);
        groups.push({
            kind: "color",
            title: geoData.segment?.name ?? "Color",
            items: colorCategories,
        });
    }

    // Add numeric color scale group if available (color measure)
    if (availableLegends.hasColorLegend && geoData.color) {
        const colorScale = computeColorScale(geoData.color.data, geoData.color.format, numericSymbols);
        if (colorScale) {
            groups.push({
                kind: "colorScale",
                title: geoData.color.name,
                items: [colorScale],
            });
        }
    }

    // Return null when there are no legend groups (e.g., area-only charts)
    if (groups.length === 0) {
        return null;
    }

    return {
        layerId,
        layerTitle: layerName,
        layerKind: "area",
        groups,
    };
}
