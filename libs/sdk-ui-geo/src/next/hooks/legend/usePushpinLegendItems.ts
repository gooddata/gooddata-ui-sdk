// (C) 2025 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { IPushpinGeoData } from "../../types/shared.js";
import { useSegmentLegendItems } from "../shared/useSegmentLegendItems.js";

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
export function usePushpinLegendItems(
    dataView: DataViewFacade | null,
    geoData: IPushpinGeoData | null,
    colorStrategy: IColorStrategy | null,
): IPushpinCategoryLegendItem[] {
    return useSegmentLegendItems({
        type: "pushpin",
        dataView,
        geoData,
        colorStrategy,
    });
}
