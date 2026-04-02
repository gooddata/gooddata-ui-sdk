// (C) 2025-2026 GoodData Corporation

import { type IAnalyticalBackend, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import type { StyleSpecification } from "../../layers/common/mapFacade.js";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

/**
 * All source types recognized by the MapLibre style specification v8.
 * Sources with an unrecognized type trigger a console warning.
 */
const KNOWN_SOURCE_TYPES: ReadonlySet<string> = new Set([
    "vector",
    "raster",
    "raster-dem",
    "geojson",
    "image",
    "video",
    "canvas",
]);

/**
 * Tile-based source types that optionally define data via "tiles" or "url".
 */
const TILE_SOURCE_TYPES: ReadonlySet<string> = new Set(["vector", "raster", "raster-dem"]);

/**
 * Fetches the MapLibre style specification from the backend.
 *
 * @remarks
 * When `basemap` is defined, the style is fetched via `GET /api/v1/location/styles/{basemap}`.
 * When `basemap` is undefined, the backend default style is returned via `GET /api/v1/location/style`.
 *
 * The backend returns a complete MapLibre v8 style with all tile, glyph, and sprite URLs
 * already proxied through the GoodData API. No manual URL construction is needed on the
 * UI side — the returned style JSON can be passed directly to MapLibre.
 *
 * Caching is handled by the caching backend layer. Multiple calls with the same
 * backend instance and params will be deduplicated if the backend is wrapped with `withCaching`.
 *
 * @internal
 */
export async function fetchMapStyle(
    backend: IAnalyticalBackend,
    basemap?: string,
    language?: string,
): Promise<StyleSpecification> {
    const style =
        basemap === undefined
            ? await backend.geo().getDefaultStyle({ language })
            : await fetchMapStyleByIdWithFallback(backend, basemap, language);
    assertValidStyle(style);
    return style;
}

async function fetchMapStyleByIdWithFallback(
    backend: IAnalyticalBackend,
    basemap: string,
    language?: string,
): Promise<unknown> {
    try {
        return (await backend.geo().getStyleById(basemap, { language })) as unknown;
    } catch (error) {
        if (isUnexpectedResponseError(error) && error.httpStatus === 404) {
            return (await backend.geo().getDefaultStyle({ language })) as unknown;
        }

        throw error;
    }
}

function assertValidStyle(style: unknown): asserts style is StyleSpecification {
    if (!isRecord(style)) {
        throw new Error("Geo style payload is not an object.");
    }

    const version = style["version"];
    if (typeof version !== "number" || version < 8) {
        throw new Error("Geo style payload must contain a valid style version.");
    }

    const sources = style["sources"];
    if (!isRecord(sources)) {
        throw new Error("Geo style payload must contain sources.");
    }

    const glyphs = style["glyphs"];
    if (typeof glyphs !== "string") {
        throw new Error("Geo style payload must contain glyphs definition.");
    }

    assertAbsoluteUrl(glyphs, "glyphs");

    for (const sourceName of getReferencedSources(style)) {
        validateSource(sourceName, sources[sourceName]);
    }
}

function validateSource(name: string, source: unknown): void {
    if (!isRecord(source)) {
        console.warn(`[GeoChart] Referenced source "${name}" is missing from the style definition.`);
        return;
    }

    const sourceType = source["type"];
    if (sourceType === undefined) {
        console.warn(`[GeoChart] Source "${name}" is missing a "type" property.`);
        return;
    }

    if (typeof sourceType !== "string" || !KNOWN_SOURCE_TYPES.has(sourceType)) {
        console.warn(`[GeoChart] Source "${name}" has unrecognized type "${String(sourceType)}".`);
        return;
    }

    if (TILE_SOURCE_TYPES.has(sourceType)) {
        validateTileSource(name, sourceType, source);
    } else if (sourceType === "geojson") {
        validateGeoJsonSource(name, source);
    } else if (sourceType === "image") {
        validateImageSource(name, source);
    } else if (sourceType === "video") {
        validateVideoSource(name, source);
    } else if (sourceType === "canvas") {
        validateCanvasSource(name, source);
    }
}

function validateTileSource(name: string, sourceType: string, source: Record<string, unknown>): void {
    const url = source["url"];
    const tiles = getNonEmptyStringArray(source["tiles"]);
    const hasTiles = tiles.length > 0;
    const hasUrl = typeof url === "string" && url.length > 0;

    if (!hasTiles && !hasUrl) {
        console.warn(`[GeoChart] Source "${name}" (type: ${sourceType}) has no "tiles" or "url" defined.`);
        return;
    }

    if (hasTiles) {
        tiles.forEach((tileUrl) => warnNonAbsoluteUrl(tileUrl, `source "${name}" tiles`));
    }

    if (hasUrl) {
        warnNonAbsoluteUrl(url, `source "${name}" url`);
    }
}

function validateGeoJsonSource(name: string, source: Record<string, unknown>): void {
    const data = source["data"];
    if (data === undefined || data === null) {
        console.warn(`[GeoChart] GeoJSON source "${name}" is missing required "data" property.`);
    }
}

function validateImageSource(name: string, source: Record<string, unknown>): void {
    const url = source["url"];
    if (typeof url !== "string" || url.length === 0) {
        console.warn(`[GeoChart] Image source "${name}" is missing required "url" property.`);
    } else {
        warnNonAbsoluteUrl(url, `source "${name}" url`);
    }

    if (!Array.isArray(source["coordinates"])) {
        console.warn(`[GeoChart] Image source "${name}" is missing required "coordinates" property.`);
    }
}

function validateVideoSource(name: string, source: Record<string, unknown>): void {
    if (getNonEmptyStringArray(source["urls"]).length === 0) {
        console.warn(`[GeoChart] Video source "${name}" is missing required "urls" property.`);
    }

    if (!Array.isArray(source["coordinates"])) {
        console.warn(`[GeoChart] Video source "${name}" is missing required "coordinates" property.`);
    }
}

function validateCanvasSource(name: string, source: Record<string, unknown>): void {
    const canvas = source["canvas"];
    if (typeof canvas !== "string" || canvas.length === 0) {
        console.warn(`[GeoChart] Canvas source "${name}" is missing required "canvas" property.`);
    }

    if (!Array.isArray(source["coordinates"])) {
        console.warn(`[GeoChart] Canvas source "${name}" is missing required "coordinates" property.`);
    }
}

function getReferencedSources(style: Record<string, unknown>): ReadonlySet<string> {
    const referencedSources = new Set<string>();
    const layers = style["layers"];

    if (Array.isArray(layers)) {
        for (const layer of layers) {
            if (!isRecord(layer)) {
                continue;
            }

            const source = layer["source"];
            if (typeof source === "string" && source.length > 0) {
                referencedSources.add(source);
            }
        }
    }

    const terrain = style["terrain"];
    if (isRecord(terrain)) {
        const source = terrain["source"];
        if (typeof source === "string" && source.length > 0) {
            referencedSources.add(source);
        }
    }

    return referencedSources;
}

function getNonEmptyStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

function assertAbsoluteUrl(value: string, fieldName: string): void {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        throw new Error(`Geo style ${fieldName} must be an absolute URL.`);
    }
}

function warnNonAbsoluteUrl(value: string, fieldName: string): void {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        console.warn(`[GeoChart] Geo style ${fieldName} should be an absolute URL.`);
    }
}
