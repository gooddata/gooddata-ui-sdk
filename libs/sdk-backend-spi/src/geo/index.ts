// (C) 2025 GoodData Corporation

/**
 * Geo style specification document returned by backend.
 *
 * @alpha
 */
export type IGeoStyleSpecification = Record<string, unknown>;

/**
 * Service allowing access to geo location assets (styles, tiles, glyphs).
 *
 * @alpha
 */
export interface IGeoService {
    /**
     * Loads the default MapLibre style configured for the authenticated organization.
     */
    getDefaultStyle(): Promise<IGeoStyleSpecification>;
}
