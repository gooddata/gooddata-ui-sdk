// (C) 2025-2026 GoodData Corporation

import { type IGeoLayerArea } from "../../types/layers/index.js";

/**
 * Default id for the primary area layer produced by GeoAreaChart.
 *
 * @public
 */
export const AREA_LAYER_ID = "area-layer";

/**
 * Creates an area layer configuration object.
 *
 * @remarks
 * Use this factory to create area layer definitions for GeoChart.
 * The factory ensures proper type and id assignment.
 *
 * @param layer - Layer configuration without type and id
 * @param id - Optional custom layer id, defaults to "area-layer"
 * @returns Complete area layer configuration
 *
 * @public
 */
export function createAreaLayer(
    layer: Omit<IGeoLayerArea, "type" | "id">,
    id: string = AREA_LAYER_ID,
): IGeoLayerArea {
    return {
        ...layer,
        id,
        type: "area",
    };
}
