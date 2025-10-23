// (C) 2025 GoodData Corporation

import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { IGeoDataSourceProps, createPushpinDataSource } from "../../providers/maplibre/maplibreDataSource.js";
import { IMapConfig } from "../../types/mapProvider.js";
import { IGeoData } from "../../types/shared.js";
import { isClusteringAllowed } from "../clustering/clustering.js";

/**
 * Create GeoJSON data source for map
 *
 * @remarks
 * This function creates a GeoJSON data source from geographic data, applying
 * the color strategy and configuring clustering if enabled. The resulting
 * source can be added to the map with map.addSource().
 *
 * @param geoData - Geographic data to display
 * @param colorStrategy - Color strategy for styling
 * @param config - Map configuration
 * @returns GeoJSON source specification
 *
 * @internal
 */
export function createGeoDataSource(geoData: IGeoData, colorStrategy: IColorStrategy, config: IMapConfig) {
    const { points: geoPointsConfig = {} } = config;
    const hasClustering = isClusteringAllowed(geoData, geoPointsConfig.groupNearbyPoints);

    const dataSourceProps: IGeoDataSourceProps = {
        geoData,
        config,
        colorStrategy,
        hasClustering,
    };

    return createPushpinDataSource(dataSourceProps);
}
