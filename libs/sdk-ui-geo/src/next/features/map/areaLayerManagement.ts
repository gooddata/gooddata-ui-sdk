// (C) 2025 GoodData Corporation

import type { Map as MapLibreMap } from "maplibre-gl";

import { IGeoJsonFeature } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { DEFAULT_DATA_SOURCE_NAME } from "../../constants/geoChart.js";
import {
    DEFAULT_AREA_LAYER_NAME,
    DEFAULT_AREA_OUTLINE_LAYER_NAME,
    createAreaFillLayer,
    createAreaOutlineLayer,
} from "../../providers/maplibre/maplibreDataLayersArea.js";
import { createAreaDataSource } from "../../providers/maplibre/maplibreDataSourceArea.js";
import { IGeoAreaChartConfig } from "../../types/areaConfig.js";
import { IAreaGeoData } from "../../types/shared.js";

export interface IAreaLayerUpdateOptions {
    features?: IGeoJsonFeature[];
}

/**
 * Add area layers to the map
 *
 * @remarks
 * This function adds fill and outline layers for area visualization.
 * The fill layer renders the colored areas, and the outline layer provides borders.
 *
 * @param map - MapLibre map instance
 * @param dataSourceId - ID of the data source to use
 * @param config - Area configuration
 *
 * @internal
 */
export function addAreaLayers(map: MapLibreMap, dataSourceId: string, config: IGeoAreaChartConfig): void {
    // Add fill layer first (renders below outline)
    map.addLayer(createAreaFillLayer(dataSourceId, config));

    // Add outline layer on top
    map.addLayer(createAreaOutlineLayer(dataSourceId, config));
}

/**
 * Remove all area-related layers from the map
 *
 * @remarks
 * This function removes all area layers along with their data source.
 * It's typically called before updating the map with new data.
 *
 * @param map - MapLibre map instance
 *
 * @internal
 */
export function removeAreaLayers(map: MapLibreMap): void {
    const layersToRemove = [DEFAULT_AREA_LAYER_NAME, DEFAULT_AREA_OUTLINE_LAYER_NAME];

    layersToRemove.forEach((layerId) => {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
    });

    if (map.getSource(DEFAULT_DATA_SOURCE_NAME)) {
        map.removeSource(DEFAULT_DATA_SOURCE_NAME);
    }
}

/**
 * Add data source and layers to the map for area
 *
 * @remarks
 * This function combines data source creation and layer addition into a single
 * operation. It removes any existing layers/source first, then creates a new
 * data source and adds the area layers.
 *
 * @param map - MapLibre map instance
 * @param geoData - Area geographic data to display
 * @param config - Map configuration
 * @param colorStrategy - Color strategy for styling
 *
 * @internal
 */
export function updateAreaMapLayers(
    map: MapLibreMap,
    geoData: IAreaGeoData,
    config: IGeoAreaChartConfig,
    colorStrategy: IColorStrategy,
    options: IAreaLayerUpdateOptions = {},
): void {
    if (!map.isStyleLoaded()) {
        void map.once("styledata", () => {
            updateAreaMapLayers(map, geoData, config, colorStrategy, options);
        });
        return;
    }

    // Remove existing layers and source
    removeAreaLayers(map);

    // Create and add new data source
    const source = createAreaDataSource({
        geoData,
        config,
        colorStrategy,
        features: options.features,
    });
    map.addSource(DEFAULT_DATA_SOURCE_NAME, source);

    // Add area layers
    addAreaLayers(map, DEFAULT_DATA_SOURCE_NAME, config);
}
