// (C) 2025-2026 GoodData Corporation

/**
 * Basemap style identifier passed to the location style endpoint.
 *
 * @remarks
 * The available identifiers are dynamic and fetched from the
 * `GET /api/v1/location/styles` endpoint (e.g. `"standard-light"`, `"satellite"`).
 *
 * @alpha
 */
export type GeoBasemap = string;
