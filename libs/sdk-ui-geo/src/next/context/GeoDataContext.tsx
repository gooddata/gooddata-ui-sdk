// (C) 2025-2026 GoodData Corporation

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLayers } from "./GeoLayersContext.js";
import { type IAvailableLegends, type IGeoLegendItem } from "../types/common/legends.js";
import type { IGeoCommonData } from "../types/geoData/common.js";

export interface IGeoDataContext<TGeoData extends IGeoCommonData = IGeoCommonData> {
    geoData: TGeoData | null;
    colorStrategy: IColorStrategy | null;
    baseLegendItems: IGeoLegendItem[];
    availableLegends: IAvailableLegends;
}

/**
 * Hook to access geographic data derived from the primary layer.
 *
 * @internal
 */
export function useGeoData(): IGeoDataContext {
    const { primaryLayer } = useGeoLayers();

    if (!primaryLayer) {
        throw new Error("useGeoData requires a primary layer in GeoLayersContext");
    }

    return {
        geoData: primaryLayer.geoData ?? null,
        colorStrategy: primaryLayer.colorStrategy,
        baseLegendItems: primaryLayer.baseLegendItems,
        availableLegends: primaryLayer.availableLegends,
    };
}
