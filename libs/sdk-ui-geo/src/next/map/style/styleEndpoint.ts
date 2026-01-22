// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoTileset } from "../../types/map/tileset.js";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type VectorSourceWithTiles = {
    type: "vector";
    tiles?: string[];
} & Record<string, unknown>;

const RASTER_TILESETS: Array<GeoTileset> = ["satellite"];

/**
 * Fetches the MapLibre style specification from the backend.
 *
 * @remarks
 * Caching is handled by the caching backend layer. Multiple calls with the same
 * backend instance will be deduplicated if the backend is wrapped with `withCaching`.
 *
 * @internal
 */
export async function fetchMapStyle(
    backend: IAnalyticalBackend,
    tileset: GeoTileset,
): Promise<StyleSpecification> {
    const style = (await backend.geo().getDefaultStyle()) as unknown;
    assertValidStyle(style);
    // replace source and layer with raster tileset, we should change this later to fetch the raster style from backend
    if (RASTER_TILESETS.includes(tileset)) {
        return applyRasterTilesetQueryToStyle(style, tileset);
    }
    return style;
}

function applyRasterTilesetQueryToStyle(style: StyleSpecification, tileset: GeoTileset): StyleSpecification {
    const tileUrl = getVectorTileUrl(style);
    if (!tileUrl) {
        return style;
    }

    const rasterTiles = [appendTilesetQuery(tileUrl, tileset)];

    return {
        ...style,
        name: style.name ? `${style.name} (${tileset})` : style.name,
        sources: {
            [tileset]: {
                type: "raster",
                tiles: rasterTiles,
            },
        },
        layers: [
            {
                id: tileset,
                type: "raster",
                source: tileset,
            },
        ],
    };
}

function appendTilesetQuery(tileUrl: string, tileset: string): string {
    if (!tileUrl) {
        return tileUrl;
    }

    return `${tileUrl}?tileset=${encodeURIComponent(tileset)}`;
}

function getVectorTileUrl(style: StyleSpecification): string | undefined {
    const sources = style.sources ?? {};

    for (const source of Object.values(sources)) {
        if (!source || typeof source !== "object" || !("tiles" in source)) {
            continue;
        }

        const tiles = (source as VectorSourceWithTiles).tiles;
        if (Array.isArray(tiles) && tiles.length > 0) {
            return tiles[0];
        }
    }

    return undefined;
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

    if (vectorSources.length === 0) {
        throw new Error("Geo style payload must include at least one vector source.");
    }

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
