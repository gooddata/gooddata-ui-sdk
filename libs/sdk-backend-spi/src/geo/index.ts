// (C) 2025-2026 GoodData Corporation

import { type IOrganizationGeoCollectionsService } from "../organization/geoCollections/index.js";

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

    /**
     * Language tag passed as `language` query parameter.
     *
     * @remarks
     * Two-letter ISO 639-1 code (e.g. `en`, `de`, `fr`).
     * When provided, map labels are returned in the requested language.
     */
    language?: string;
}

/**
 * Service allowing access to geo location assets (styles, tiles, glyphs)
 * and management of custom geo collections.
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

    /**
     * Loads icon names from the sprite sheet used by the default geo style.
     *
     * @remarks
     * Returns an empty array when the organization does not have a sprite sheet configured.
     */
    getDefaultStyleSpriteIcons(): Promise<string[]>;

    /**
     * Returns service for managing custom geo collections.
     */
    collections(): IOrganizationGeoCollectionsService;
}
