// (C) 2025 GoodData Corporation

import { IGeoData } from "../../types/shared.js";

/**
 * Clustering functionality for GeoPushpinChartNext
 *
 * @internal
 */

/**
 * Determines if clustering should be enabled based on geo data configuration
 *
 * @remarks
 * Clustering is only allowed when:
 * - groupNearbyPoints is enabled
 * - location data exists
 * - no color, segment, or size measures are present
 *
 * @param geoData - Geo data configuration
 * @param groupNearbyPoints - Whether clustering is enabled in config
 * @returns True if clustering should be enabled
 *
 * @internal
 */
export function isClusteringAllowed(geoData: IGeoData, groupNearbyPoints = true): boolean {
    const { color, location, segment, size } = geoData;
    return Boolean(groupNearbyPoints && location && !(color || segment || size));
}
