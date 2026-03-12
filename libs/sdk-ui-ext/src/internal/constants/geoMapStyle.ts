// (C) 2026 GoodData Corporation

import { type GeoBasemap, type GeoColorScheme, doesGeoBasemapSupportColorScheme } from "@gooddata/sdk-ui-geo";

export interface IGeoMapStyleOptions {
    basemap: GeoBasemap | undefined;
    colorScheme: GeoColorScheme | undefined;
}

function sanitizeLegacyGeoTileset(value: unknown): GeoBasemap | undefined {
    if (value === "satellite") {
        return "satellite";
    }

    return undefined;
}

function sanitizeGeoBasemap(value: unknown): GeoBasemap | undefined {
    if (
        value === "standard" ||
        value === "monochrome" ||
        value === "satellite" ||
        value === "hybrid" ||
        value === "none"
    ) {
        return value;
    }

    return undefined;
}

function sanitizeGeoColorScheme(value: unknown): GeoColorScheme | undefined {
    if (value === "light" || value === "dark") {
        return value;
    }

    return undefined;
}

export function sanitizeGeoMapStyleOptions({
    basemap,
    legacyTileset,
    colorScheme,
}: {
    basemap: unknown;
    legacyTileset?: unknown;
    colorScheme: unknown;
}): IGeoMapStyleOptions {
    const sanitizedBasemap = sanitizeGeoBasemap(basemap) ?? sanitizeLegacyGeoTileset(legacyTileset);
    const sanitizedColorScheme =
        sanitizedBasemap !== undefined && doesGeoBasemapSupportColorScheme(sanitizedBasemap)
            ? sanitizeGeoColorScheme(colorScheme)
            : undefined;

    return {
        basemap: sanitizedBasemap,
        colorScheme: sanitizedColorScheme,
    };
}
