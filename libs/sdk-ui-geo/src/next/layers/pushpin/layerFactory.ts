// (C) 2025 GoodData Corporation

import { IGeoLayerPushpin } from "../../types/layers/index.js";

/**
 * Default id for the primary pushpin layer produced by GeoPushpinChartNext.
 */
export const PUSHPIN_LAYER_ID = "pushpin-layer";

/**
 * Creates a pushpin layer configuration object.
 *
 * @remarks
 * Use this factory to create pushpin layer definitions for GeoChartNext.
 * The factory ensures proper type and id assignment.
 *
 * @param layer - Layer configuration without type and id
 * @param id - Optional custom layer id, defaults to "pushpin-layer"
 * @returns Complete pushpin layer configuration
 *
 * @alpha
 */
export function createPushpinLayer(
    layer: Omit<IGeoLayerPushpin, "type" | "id">,
    id: string = PUSHPIN_LAYER_ID,
): IGeoLayerPushpin {
    return {
        ...layer,
        id,
        type: "pushpin",
    };
}
