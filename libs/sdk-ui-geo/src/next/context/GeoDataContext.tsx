// (C) 2025 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLayers } from "./GeoLayersContext.js";
import { IAvailableLegends, IGeoLegendItem } from "../types/common/legends.js";
import type { IGeoCommonData } from "../types/geoData/common.js";

export interface IGeoDataContext<TGeoData extends IGeoCommonData = IGeoCommonData> {
    geoData: TGeoData | null;
    colorStrategy: IColorStrategy | null;
    colorPalette: IColorPalette;
    baseLegendItems: IGeoLegendItem[];
    availableLegends: IAvailableLegends;
}

/**
 * Hook to access geographic data derived from the primary layer.
 *
 * @alpha
 */
export function useGeoData(): IGeoDataContext {
    const { primaryLayer, colorPalette } = useGeoLayers();

    if (!primaryLayer) {
        throw new Error("useGeoData requires a primary layer in GeoLayersContext");
    }

    return {
        geoData: primaryLayer.geoData ?? null,
        colorStrategy: primaryLayer.colorStrategy,
        colorPalette,
        baseLegendItems: primaryLayer.baseLegendItems,
        availableLegends: primaryLayer.availableLegends,
    };
}
