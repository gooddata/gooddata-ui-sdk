// (C) 2025 GoodData Corporation

import type { Map as MapLibreMap } from "maplibre-gl";

import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import {
    DEFAULT_CLUSTER_LAYER_NAME,
    DEFAULT_DATA_SOURCE_NAME,
    DEFAULT_LAYER_NAME,
} from "../../constants/geoChart.js";
import {
    createClusterLabels,
    createClusterPoints,
    createPushpinDataLayer,
    createUnclusterPoints,
} from "../../providers/maplibre/maplibreDataLayers.js";
import { IMapConfig } from "../../types/mapProvider.js";
import { IPushpinGeoData } from "../../types/shared.js";
import { isClusteringAllowed } from "../clustering/clustering.js";
import { createGeoDataSource } from "../data/dataSourceManagement.js";

/**
 * Add pushpin layers to the map
 *
 * @remarks
 * This function adds the appropriate layers for displaying pushpin data on the map.
 * If clustering is enabled, it adds cluster layers (cluster points, cluster labels, and
 * unclustered points). Otherwise, it adds a single pushpin layer, attempting to insert
 * it before state labels if they exist for better visual hierarchy.
 *
 * @param map - MapLibre map instance
 * @param dataSourceId - ID of the data source to use
 * @param geoData - Geographic data to display
 * @param config - Map configuration
 * @param hasClustering - Whether clustering is enabled
 *
 * @internal
 */
export function addPushpinLayers(
    map: MapLibreMap,
    dataSourceId: string,
    geoData: IPushpinGeoData,
    config: IMapConfig,
    hasClustering: boolean,
): void {
    if (hasClustering) {
        map.addLayer(createClusterPoints(dataSourceId));
        map.addLayer(createClusterLabels(dataSourceId));
        map.addLayer(createUnclusterPoints(dataSourceId));
    } else {
        // Try to add layer before state labels if they exist, otherwise add on top
        const layerToInsertBefore = "state-label";
        const beforeLayerExists = map.getLayer(layerToInsertBefore);

        if (beforeLayerExists) {
            map.addLayer(createPushpinDataLayer(dataSourceId, geoData, config), layerToInsertBefore);
        } else {
            map.addLayer(createPushpinDataLayer(dataSourceId, geoData, config));
        }
    }
}

/**
 * Remove all geo-related layers from the map
 *
 * @remarks
 * This function removes all pushpin and cluster layers along with their data source.
 * It's typically called before updating the map with new data.
 *
 * @param map - MapLibre map instance
 *
 * @internal
 */
export function removeGeoLayers(map: MapLibreMap): void {
    const layersToRemove = [DEFAULT_LAYER_NAME, DEFAULT_CLUSTER_LAYER_NAME, "gdcClusterLabels"];

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
 * Add data source and layers to the map
 *
 * @remarks
 * This function combines data source creation and layer addition into a single
 * operation. It removes any existing layers/source first, then creates a new
 * data source and adds the appropriate layers based on clustering configuration.
 *
 * @param map - MapLibre map instance
 * @param geoData - Geographic data to display
 * @param config - Map configuration
 * @param colorStrategy - Color strategy for styling
 *
 * @internal
 */
export function updateMapLayers(
    map: MapLibreMap,
    geoData: IPushpinGeoData,
    config: IMapConfig,
    colorStrategy: IColorStrategy,
): void {
    if (!map.isStyleLoaded()) {
        void map.once("styledata", () => {
            updateMapLayers(map, geoData, config, colorStrategy);
        });
        return;
    }

    const { points: geoPointsConfig = {} } = config;
    const hasClustering = isClusteringAllowed(geoData, geoPointsConfig.groupNearbyPoints);

    // Remove existing layers and source
    removeGeoLayers(map);

    // Create and add new data source using data management utility
    const source = createGeoDataSource(geoData, colorStrategy, config);
    map.addSource(DEFAULT_DATA_SOURCE_NAME, source);

    // Add layers
    addPushpinLayers(map, DEFAULT_DATA_SOURCE_NAME, geoData, config, hasClustering);
}
