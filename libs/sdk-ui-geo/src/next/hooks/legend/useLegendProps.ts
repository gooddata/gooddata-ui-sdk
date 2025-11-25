// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { useGeoData } from "../../context/GeoDataContext.js";
import { IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IPushpinGeoData } from "../../types/shared.js";

/**
 * Props for legend renderer components.
 *
 * @alpha
 */
export interface ILegendProps {
    /**
     * Geographic data for rendering color and size legends
     */
    geoData: IPushpinGeoData | null;

    /**
     * Category items for rendering category legend
     */
    categoryItems: IPushpinCategoryLegendItem[];

    /**
     * Color strategy for legend colors
     */
    colorStrategy: IColorStrategy | null;

    /**
     * First color from the color strategy (used for color legend)
     */
    colorLegendValue: string | null;

    /**
     * Format string for measure values
     */
    format: string | undefined;

    /**
     * Geo configuration
     */
    config: IGeoPushpinChartNextConfig | undefined;
}

/**
 * Hook to prepare props for legend components from context.
 *
 * @remarks
 * This hook consolidates data from various contexts and prepares
 * the props needed by legend renderer components. It extracts:
 * - Geographic data for color/size legends
 * - Category items for segment-based legends (with visibility state)
 * - Color strategy and format information
 *
 * @param colorStrategy - Color strategy for the chart
 * @param config - Geo configuration
 * @param categoryItems - Category legend items with visibility state
 * @returns Props for legend components
 *
 * @alpha
 */
export function useLegendProps(
    colorStrategy: IColorStrategy | null,
    config: IGeoPushpinChartNextConfig | undefined,
    categoryItems: IPushpinCategoryLegendItem[],
): ILegendProps {
    const { geoData } = useGeoData<IPushpinGeoData>();

    return useMemo(() => {
        const colorFormat = geoData?.color?.format;
        const sizeFormat = geoData?.size?.format;
        const format = colorFormat || sizeFormat;

        const colorLegendValue = colorStrategy ? colorStrategy.getColorByIndex(0) : null;

        return {
            geoData,
            categoryItems,
            colorStrategy,
            colorLegendValue,
            format,
            config,
        };
    }, [geoData, categoryItems, colorStrategy, config]);
}
