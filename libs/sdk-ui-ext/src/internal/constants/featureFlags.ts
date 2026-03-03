// (C) 2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

export const ENABLE_GEO_CHARTS_VIEWPORT_CONFIG = "enableGeoChartsViewportConfig";
export const ENABLE_GEO_BASEMAP_CONFIG = "enableGeoBasemapConfig";

export function isGeoChartsViewportConfigEnabled(featureFlags?: ISettings): boolean {
    const value = featureFlags?.[ENABLE_GEO_CHARTS_VIEWPORT_CONFIG];
    return value === true;
}

export function isGeoBasemapConfigEnabled(featureFlags?: ISettings): boolean {
    const value = featureFlags?.[ENABLE_GEO_BASEMAP_CONFIG];
    return value === true;
}
