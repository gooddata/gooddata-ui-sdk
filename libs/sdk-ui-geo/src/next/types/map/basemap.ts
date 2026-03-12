// (C) 2025-2026 GoodData Corporation

/**
 * Supported basemap identifiers passed to the location style endpoint.
 *
 * @alpha
 */
export type GeoBasemap = "standard" | "satellite" | "monochrome" | "hybrid" | "none";

/**
 * Color scheme for the map style.
 *
 * @remarks
 * Ignored for `satellite`, `hybrid`, and `none` basemaps.
 *
 * @alpha
 */
export type GeoColorScheme = "light" | "dark";

/**
 * Returns whether the basemap supports light/dark color variants.
 *
 * @alpha
 */
export function doesGeoBasemapSupportColorScheme(basemap: GeoBasemap): boolean {
    return basemap === "standard" || basemap === "monochrome";
}
