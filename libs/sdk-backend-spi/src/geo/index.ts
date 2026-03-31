// (C) 2025-2026 GoodData Corporation

import { type IOrganizationGeoCollectionsService } from "../organization/geoCollections/index.js";

/**
 * Geo style specification document returned by backend.
 *
 * @alpha
 */
export type IGeoStyleSpecification = Record<string, unknown>;

/**
 * An item in the list of available map styles.
 *
 * @alpha
 */
export interface IGeoStyleListItem {
    /**
     * Unique style identifier (e.g. `standard-light`, `satellite`).
     */
    id: string;

    /**
     * Human-readable title (e.g. `Standard (Light)`).
     */
    title: string;

    /**
     * URL to fetch the full MapLibre style document for this style.
     */
    link: string;
}

/**
 * Parameters for the location style endpoint.
 *
 * @alpha
 */
export interface IGeoStyleParams {
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
     * Loads the default MapLibre style configured for the authenticated organization.
     *
     * @param params - Optional query parameters.
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
     * Lists all available map styles.
     */
    getStyles(): Promise<IGeoStyleListItem[]>;

    /**
     * Loads the MapLibre style for a specific style identifier.
     *
     * @param styleId - Style identifier (e.g. `standard-light`).
     * @param params - Optional query parameters.
     */
    getStyleById(styleId: string, params?: IGeoStyleParams): Promise<IGeoStyleSpecification>;

    /**
     * Returns service for managing custom geo collections.
     */
    collections(): IOrganizationGeoCollectionsService;
}
