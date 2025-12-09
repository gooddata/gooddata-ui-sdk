// (C) 2025 GoodData Corporation

import type { IAreaGeoData } from "./area.js";
import type { IPushpinGeoData } from "./pushpin.js";

/**
 * Type guard to check if geo data is pushpin data.
 *
 * @param data - Geo data to check
 * @returns True if data is IPushpinGeoData
 *
 * @internal
 */
export function isPushpinGeoData(data: IPushpinGeoData | IAreaGeoData): data is IPushpinGeoData {
    return "location" in data && !("area" in data);
}

/**
 * Type guard to check if geo data is area data.
 *
 * @param data - Geo data to check
 * @returns True if data is IAreaGeoData
 *
 * @internal
 */
export function isAreaGeoData(data: IPushpinGeoData | IAreaGeoData): data is IAreaGeoData {
    return "area" in data;
}
