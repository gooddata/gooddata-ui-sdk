// (C) 2025 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoPushData } from "./useGeoPushData.js";
import { useGeoAreaData } from "../../context/GeoAreaDataContext.js";
import { useGeoAreaProps } from "../../context/GeoAreaPropsContext.js";
import { IAvailableLegends } from "../../types/shared.js";

/**
 * Area-specific hook to push data to analytical designer for configuration panel updates.
 *
 * @internal
 */
export function useAreaPushData(colorStrategy: IColorStrategy | null, colorPalette: IColorPalette): void {
    useGeoPushData(colorStrategy, colorPalette, {
        useProps: useGeoAreaProps,
        useLegendContext: useGeoAreaData,
        getLegendVisibility: isAreaLegendVisible,
    });
}

export function isAreaLegendVisible(availableLegends: IAvailableLegends): boolean {
    return availableLegends.hasCategoryLegend || availableLegends.hasColorLegend;
}
