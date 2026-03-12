// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import {
    type GeoBasemap,
    type GeoColorScheme,
    doesGeoBasemapSupportColorScheme,
} from "../../types/map/basemap.js";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type VectorSourceWithTiles = {
    type: "vector";
    tiles?: string[];
} & Record<string, unknown>;

/**
 * Fetches the MapLibre style specification from the backend.
 *
 * @remarks
 * The backend returns a complete MapLibre v8 style with all tile, glyph, and sprite URLs
 * already proxied through the GoodData API. No manual URL construction is needed on the
 * UI side — the returned style JSON can be passed directly to MapLibre.
 *
 * Caching is handled by the caching backend layer. Multiple calls with the same
 * backend instance and params will be deduplicated if the backend is wrapped with `withCaching`.
 *
 * When basemap is `undefined`, no basemap parameter is sent and the backend returns its own
 * default style. In that case `colorScheme` is also omitted because the default basemap does
 * not support explicit color variants.
 *
 * @internal
 */
export async function fetchMapStyle(
    backend: IAnalyticalBackend,
    basemap?: GeoBasemap,
    colorScheme?: GeoColorScheme,
): Promise<StyleSpecification> {
    const colorSchemeParam =
        colorScheme === undefined || basemap === undefined || !doesGeoBasemapSupportColorScheme(basemap)
            ? undefined
            : colorScheme;
    const style = (await backend
        .geo()
        .getDefaultStyle({ basemap, colorScheme: colorSchemeParam })) as unknown;
    assertValidStyle(style);
    return style;
}

function assertValidStyle(style: unknown): asserts style is StyleSpecification {
    if (!style || typeof style !== "object") {
        throw new Error("Geo style payload is not an object.");
    }

    const specification = style as Partial<StyleSpecification>;

    if (typeof specification.version !== "number" || specification.version < 8) {
        throw new Error("Geo style payload must contain a valid style version.");
    }

    if (!specification.sources || typeof specification.sources !== "object") {
        throw new Error("Geo style payload must contain sources.");
    }

    if (typeof specification.glyphs !== "string") {
        throw new Error("Geo style payload must contain glyphs definition.");
    }

    assertAbsoluteUrl(specification.glyphs, "glyphs");

    const vectorSources = Object.entries(specification.sources).filter(
        (entry): entry is [string, VectorSourceWithTiles] => {
            const [, source] = entry;
            return isVectorSourceWithTiles(source);
        },
    );

    for (const [sourceName, source] of vectorSources) {
        const tiles = Array.isArray(source.tiles) ? source.tiles : null;
        if (!tiles || tiles.length === 0) {
            throw new Error(`Geo style source "${sourceName}" must define vector tiles.`);
        }

        tiles.forEach((tileUrl) => assertAbsoluteUrl(tileUrl, `source "${sourceName}" tiles`));
    }
}

function assertAbsoluteUrl(value: string, fieldName: string): void {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        throw new Error(`Geo style ${fieldName} must be an absolute URL.`);
    }
}

function isVectorSourceWithTiles(source: unknown): source is VectorSourceWithTiles {
    if (!source || typeof source !== "object") {
        return false;
    }

    if (!("type" in source)) {
        return false;
    }
    return (source as Partial<VectorSourceWithTiles>).type === "vector";
}
