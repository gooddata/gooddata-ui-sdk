// (C) 2026 GoodData Corporation

export interface IGeoMapStyleOptions {
    basemap: string | undefined;
}

function sanitizeLegacyGeoTileset(value: unknown): string | undefined {
    if (value === "satellite") {
        return "satellite";
    }

    return undefined;
}

function sanitizeGeoBasemap(value: unknown): string | undefined {
    if (typeof value === "string" && value.length > 0 && value !== "default") {
        return value;
    }

    return undefined;
}

export function sanitizeGeoMapStyleOptions({
    basemap,
    legacyTileset,
}: {
    basemap: unknown;
    legacyTileset?: unknown;
}): IGeoMapStyleOptions {
    return {
        basemap: sanitizeGeoBasemap(basemap) ?? sanitizeLegacyGeoTileset(legacyTileset),
    };
}
