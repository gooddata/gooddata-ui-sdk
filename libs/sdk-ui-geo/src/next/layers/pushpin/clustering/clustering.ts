// (C) 2025 GoodData Corporation

import { type IPushpinGeoData } from "../../../types/geoData/pushpin.js";

/**
 * Determines if clustering should be enabled for the given geo data.
 *
 * @internal
 */
export function isClusteringAllowed(geoData: IPushpinGeoData, groupNearbyPoints = true): boolean {
    const { color, location, segment, size } = geoData;
    return Boolean(groupNearbyPoints && location && !(color || segment || size));
}
