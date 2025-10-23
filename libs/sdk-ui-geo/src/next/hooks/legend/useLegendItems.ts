// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { IGeoData } from "../../types/shared.js";

/**
 * Creates legend items from geo data for segment-based coloring.
 *
 * @remarks
 * This hook creates category legend items when the visualization uses segment-based
 * coloring (attribute-based). Each unique segment value gets a legend item with:
 * - name: Display name of the segment value
 * - uri: URI of the segment value for identification
 * - color: Color from the color strategy
 * - legendIndex: Index for consistent ordering
 * - isVisible: Visibility state (all visible by default)
 *
 * Legend items are used to display the category legend and to filter visible pushpins
 * by toggling legend items on/off.
 *
 * @param dataView - Data view facade for attribute metadata
 * @param geoData - Transformed geographic data containing segment information
 * @param colorStrategy - Color strategy to get colors for legend items
 * @returns Array of category legend items, empty if no segments
 *
 * @alpha
 */
export function useLegendItems(
    dataView: DataViewFacade | null,
    geoData: IGeoData | null,
    colorStrategy: IColorStrategy | null,
): IPushpinCategoryLegendItem[] {
    return useMemo(() => {
        if (!dataView || !geoData?.segment || !colorStrategy) {
            return [];
        }

        const { segment } = geoData;

        // Get unique segment values with their URIs
        const uniqueSegments = new Map<string, { name: string; uri: string }>();

        segment.data.forEach((segmentValue: string, index: number) => {
            const uri = segment.uris?.[index];
            if (uri && !uniqueSegments.has(uri)) {
                uniqueSegments.set(uri, {
                    name: segmentValue,
                    uri,
                });
            }
        });

        // Create legend items from unique segments with colors
        const legendItems: IPushpinCategoryLegendItem[] = Array.from(uniqueSegments.values()).map(
            ({ name, uri }, index) => ({
                type: "pushpin",
                name,
                uri,
                color: colorStrategy.getColorByIndex(index),
                legendIndex: index,
                isVisible: true,
            }),
        );

        return legendItems;
    }, [dataView, geoData, colorStrategy]);
}
