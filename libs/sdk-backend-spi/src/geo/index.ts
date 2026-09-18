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
 * Path prefix under which the backend serves the assets referenced by a geo style document.
 *
 * @alpha
 */
export const GEO_ASSET_PATH = "/api/v1/location/";

/**
 * Matches the `scheme://host[:port]` part of an absolute URL, or the `//host[:port]` part of a
 * protocol-relative one. Deliberately not `new URL()`: that would percent-encode the MapLibre
 * template tokens (`{z}`, `{fontstack}`) a style document carries.
 */
const URL_ORIGIN_PATTERN = /^(?:[a-z][a-z0-9+.-]*:)?\/\/[^/?#]*/i;

/**
 * Returns the path and query of a geo asset URL, with its origin removed; `undefined` when the URL
 * does not point at a geo asset.
 *
 * @remarks
 * A style document can reference assets on third-party hosts, which must keep their URL and must
 * never receive GoodData credentials. The check is anchored at the start of the path, so a
 * third-party URL that only mentions {@link GEO_ASSET_PATH} further in (in a sub-path or a query)
 * does not qualify. The returned path is what a backend implementation loads from its own host,
 * so the origin found in the URL is never contacted with credentials.
 *
 * @param url - absolute or relative URL; may still contain MapLibre template tokens such as `{z}`
 *
 * @alpha
 */
export function getGeoAssetPath(url: string): string | undefined {
    const path = url.replace(URL_ORIGIN_PATTERN, "");

    return path.startsWith(GEO_ASSET_PATH) ? path : undefined;
}

/**
 * Tells whether a URL points to a geo asset served by the GoodData backend.
 *
 * @remarks
 * See {@link getGeoAssetPath} for what qualifies.
 *
 * @param url - absolute or relative URL; may still contain MapLibre template tokens such as `{z}`
 *
 * @alpha
 */
export function isGeoAssetUrl(url: string): boolean {
    return getGeoAssetPath(url) !== undefined;
}

/**
 * Response type requested from {@link IGeoService.getAsset}.
 *
 * @alpha
 */
export type GeoAssetResponseType = "arraybuffer" | "json";

/**
 * Options for {@link IGeoService.getAsset}.
 *
 * @alpha
 */
export interface IGeoAssetOptions {
    /**
     * Shape the payload is returned in. Defaults to `arraybuffer`.
     */
    responseType?: GeoAssetResponseType;

    /**
     * Signal aborting the request when the asset is no longer needed.
     */
    signal?: AbortSignal;
}

/**
 * A single geo asset loaded with the credentials of the current session.
 *
 * @alpha
 */
export interface IGeoAsset {
    /**
     * Asset payload: a parsed object when `json` was requested, raw bytes otherwise.
     */
    data: ArrayBuffer | Record<string, unknown>;

    /**
     * Value of the `Cache-Control` response header, when the backend sent one.
     */
    cacheControl?: string;

    /**
     * Value of the `Expires` response header, when the backend sent one.
     */
    expires?: string;
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
     * Loads a single asset referenced by a style document (vector tile, glyph range, sprite sheet)
     * with the credentials of the current session.
     *
     * @remarks
     * Only the path of the URL is loaded, from the backend this service is bound to; the origin
     * found in the URL is never contacted. Rejects a URL for which {@link isGeoAssetUrl} does not hold.
     *
     * @param url - URL of the asset, as it appears in the style document
     * @param options - response type and abort signal
     */
    getAsset(url: string, options?: IGeoAssetOptions): Promise<IGeoAsset>;

    /**
     * Returns service for managing custom geo collections.
     */
    collections(): IOrganizationGeoCollectionsService;
}
