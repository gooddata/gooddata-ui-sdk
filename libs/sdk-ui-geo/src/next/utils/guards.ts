// (C) 2025 GoodData Corporation

export type RecordLike = Record<string, unknown>;
export type LngLatTuple = [number, number];
export type LngLatTupleBounds = [LngLatTuple, LngLatTuple];

/**
 * Type for JSON-serializable values that can appear in GeoJSON properties.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function isRecord(value: unknown): value is RecordLike {
    return typeof value === "object" && value !== null;
}

export function asRecord(value: unknown): RecordLike | undefined {
    return isRecord(value) ? value : undefined;
}

export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export function isLngLatTuple(value: unknown): value is LngLatTuple {
    return (
        Array.isArray(value) && value.length === 2 && value.every((coordinate) => isFiniteNumber(coordinate))
    );
}

export function isLngLatTupleBounds(value: unknown): value is LngLatTupleBounds {
    return Array.isArray(value) && value.length === 2 && isLngLatTuple(value[0]) && isLngLatTuple(value[1]);
}

export function isGeoJsonPosition(value: unknown): value is GeoJSON.Position {
    return Array.isArray(value) && value.length >= 2 && isFiniteNumber(value[0]) && isFiniteNumber(value[1]);
}

export function isGeoJsonPoint(value: unknown): value is GeoJSON.Point {
    if (!isRecord(value) || value["type"] !== "Point") {
        return false;
    }

    const coordinates = value["coordinates"];
    return isGeoJsonPosition(coordinates);
}

export function isGeoJsonPolygonLike(value: unknown): value is GeoJSON.Polygon | GeoJSON.MultiPolygon {
    if (!isRecord(value)) {
        return false;
    }

    if (value["type"] === "Polygon") {
        const coordinates = value["coordinates"];
        return Array.isArray(coordinates) && coordinates.every((ring) => Array.isArray(ring));
    }

    if (value["type"] === "MultiPolygon") {
        const coordinates = value["coordinates"];
        return Array.isArray(coordinates) && coordinates.every((poly) => Array.isArray(poly));
    }

    return false;
}
