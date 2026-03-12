// (C) 2025-2026 GoodData Corporation

/**
 * Geo style specification document returned by backend.
 *
 * @alpha
 */
export type IGeoStyleSpecification = Record<string, unknown>;

/**
 * Parameters for the location style endpoint.
 *
 * @alpha
 */
export interface IGeoStyleParams {
    /**
     * Basemap identifier passed as `basemap` query parameter.
     *
     * @remarks
     * Valid values: `standard`, `satellite`, `monochrome`, `hybrid`, `none`.
     */
    basemap?: string;

    /**
     * Color scheme passed as `colorScheme` query parameter.
     *
     * @remarks
     * Valid values: `light`, `dark`. Ignored for `satellite`, `hybrid` and `none` basemaps.
     */
    colorScheme?: string;
}

/**
 * Service allowing access to geo location assets (styles, tiles, glyphs).
 *
 * @alpha
 */
export interface IGeoService {
    /**
     * Loads the MapLibre style configured for the authenticated organization.
     *
     * @param params - Optional basemap and colorScheme query parameters.
     */
    getDefaultStyle(params?: IGeoStyleParams): Promise<IGeoStyleSpecification>;
}
