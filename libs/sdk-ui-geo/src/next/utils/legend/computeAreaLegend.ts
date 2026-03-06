// (C) 2025-2026 GoodData Corporation

import { computeColorScale } from "./computeColorScale.js";
import {
    ATTRIBUTE_ONLY_URI_PREFIX,
    FALLBACK_LEGEND_COLOR,
    convertToColorCategories,
    isAttributeOnlyAreaData,
} from "./legendUtils.js";
import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import { type ILegendGroup, type ILegendSection } from "../../types/legend/model.js";

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
    colorScaleBaseColor?: string;
}

/**
 * Computes legend section for an area layer.
 *
 * @remarks
 * Creates a legend section with color legend items. Supports both:
 * - Categorical color (segment attribute) - shows color swatches per category
 * - Numeric color scale (measure) - shows min/max gradient scale
 * - Attribute-only fallback (area attribute only) - shows configured color and attribute name
 * Area layers do not have size legends.
 * Returns null when there are no legend groups to display.
 *
 * @param params - Parameters for computation
 * @returns Legend section for the area layer, or null if no legend data
 *
 * @internal
 */
export function computeAreaLegend(params: IComputeAreaLegendParams): ILegendSection | null {
    const {
        layerId,
        layerName,
        geoData,
        legendItems,
        availableLegends,
        numericSymbols,
        colorScaleBaseColor,
    } = params;

    const groups: ILegendGroup[] = [];
    const hasCategoryLegend = availableLegends.hasCategoryLegend && legendItems.length > 0;

    // Add categorical color legend group if available (segment attribute)
    if (hasCategoryLegend) {
        const colorCategories = convertToColorCategories(legendItems);
        groups.push({
            kind: "color",
            title: geoData.segment?.name ?? "Color",
            items: colorCategories,
        });
    }

    // Add numeric color scale group if available (color measure).
    // Segment/category legend has precedence over gradient, so we only render the
    // color scale when no category legend is present.
    if (availableLegends.hasColorLegend && geoData.color && !hasCategoryLegend) {
        const colorScale = computeColorScale(
            geoData.color.data,
            geoData.color.format,
            numericSymbols,
            colorScaleBaseColor,
            { allowFlatScale: true },
        );
        if (colorScale) {
            groups.push({
                kind: "colorScale",
                title: geoData.color.name,
                items: [colorScale],
            });
        }
    }

    // Attribute-only fallback is mutually exclusive with category/color groups above:
    // isAttributeOnlyAreaData requires !segment && !color, which prevents those branches from running.
    const hasAttributeOnlyLegend = isAttributeOnlyAreaData(geoData);
    if (hasAttributeOnlyLegend) {
        const attributeName = geoData.area?.name ?? "Area";
        groups.push({
            kind: "color",
            title: "",
            items: [
                {
                    type: "colorCategory",
                    label: attributeName,
                    color: colorScaleBaseColor ?? FALLBACK_LEGEND_COLOR,
                    uri: `${ATTRIBUTE_ONLY_URI_PREFIX}:${layerId}`,
                    isVisible: true,
                },
            ],
            isInteractive: false,
        });
    }

    // Return null when there are no legend groups
    if (groups.length === 0) {
        return null;
    }

    return {
        layerId,
        layerTitle: layerName,
        layerKind: "area",
        groups,
        isAttributeOnlySection: hasAttributeOnlyLegend,
    };
}
