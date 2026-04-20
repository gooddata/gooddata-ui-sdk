// (C) 2025-2026 GoodData Corporation

import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { IGeoLayerOutput } from "./adapterTypes.js";

/**
 * Converts loaded layer data into adapter output shape.
 *
 * @internal
 */
export function buildOutputFromLayerData(layerData: IGeoLayerData): IGeoLayerOutput | null {
    if (!layerData.source || !layerData.geoData || !layerData.colorStrategy) {
        return null;
    }

    return {
        source: layerData.source,
        legend: {
            items: layerData.baseLegendItems,
            available: layerData.availableLegends,
        },
        geoData: layerData.geoData,
        colorStrategy: layerData.colorStrategy,
        initialViewport: layerData.initialViewport,
    };
}
