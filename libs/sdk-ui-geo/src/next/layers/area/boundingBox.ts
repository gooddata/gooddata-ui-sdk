// (C) 2025 GoodData Corporation

import { IGeoJsonFeature } from "@gooddata/sdk-model";

import { isGeoJsonPosition } from "../../utils/guards.js";

type NormalizedBBox = [number, number, number, number];

/**
 * Type guard for geometry types that have coordinates property
 */
type GeometryWithCoordinates = Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>;

function hasCoordinates(geometry: GeoJSON.Geometry): geometry is GeometryWithCoordinates {
    return geometry.type !== "GeometryCollection";
}

function normalizeBoundingBox(bbox?: GeoJSON.BBox): NormalizedBBox | undefined {
    if (!bbox || bbox.length < 4) {
        return undefined;
    }

    const [minLng, minLat, maxLng, maxLat] = bbox;
    const values = [minLng, minLat, maxLng, maxLat];

    if (!values.every((value) => Number.isFinite(value))) {
        return undefined;
    }

    // After Number.isFinite check, values are guaranteed to be numbers
    return [minLng, minLat, maxLng, maxLat];
}

function cloneNormalizedBoundingBox(bbox: NormalizedBBox | undefined): NormalizedBBox | undefined {
    if (!bbox) {
        return undefined;
    }
    const cloned: NormalizedBBox = [bbox[0], bbox[1], bbox[2], bbox[3]];
    return cloned;
}

function mergeNormalizedBoundingBoxes(a?: NormalizedBBox, b?: NormalizedBBox): NormalizedBBox | undefined {
    if (!a) {
        return cloneNormalizedBoundingBox(b);
    }

    if (!b) {
        return cloneNormalizedBoundingBox(a);
    }

    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
}

/**
 * GeoJSON coordinate types for all geometry types.
 */
type GeoJsonCoordinateValue =
    | GeoJSON.Position
    | GeoJSON.Position[]
    | GeoJSON.Position[][]
    | GeoJSON.Position[][][];

function coordsToBoundingBox(value: GeoJsonCoordinateValue): NormalizedBBox | undefined {
    if (!Array.isArray(value) || value.length === 0) {
        return undefined;
    }

    // Check if this is a position [lng, lat]
    if (isGeoJsonPosition(value)) {
        const [lng, lat] = value;
        return [lng, lat, lng, lat];
    }

    // Otherwise it's a nested array of coordinates
    return value.reduce<NormalizedBBox | undefined>((acc, entry) => {
        const child = coordsToBoundingBox(entry as GeoJsonCoordinateValue);
        return mergeNormalizedBoundingBoxes(acc, child);
    }, undefined);
}

function geometryToBoundingBox(geometry?: GeoJSON.Geometry): NormalizedBBox | undefined {
    if (!geometry) {
        return undefined;
    }

    if (geometry.type === "GeometryCollection") {
        return geometry.geometries.reduce<NormalizedBBox | undefined>(
            (acc: NormalizedBBox | undefined, child: GeoJSON.Geometry) => {
                const childBbox = geometryToBoundingBox(child);
                return mergeNormalizedBoundingBoxes(acc, childBbox);
            },
            undefined,
        );
    }

    // Use type guard to narrow geometry to types with coordinates
    if (hasCoordinates(geometry)) {
        return coordsToBoundingBox(geometry.coordinates);
    }

    return undefined;
}

/**
 * Resolves a bounding box for geo collection features.
 *
 * @remarks
 * - Prefers explicit bounding boxes returned by the backend
 * - Falls back to feature-level bbox definitions
 * - Calculates geometry-based bounds when bbox metadata is missing
 *
 * @param features - GeoJSON features returned from the backend
 * @param fallback - Bounding box provided by the backend response
 * @returns Bounding box represented as [minLng, minLat, maxLng, maxLat] or undefined
 *
 * @internal
 */
export function deriveCollectionBoundingBox(
    features: IGeoJsonFeature[] | undefined,
    fallback?: GeoJSON.BBox,
): NormalizedBBox | undefined {
    const initial = normalizeBoundingBox(fallback);

    if (!features || features.length === 0) {
        return cloneNormalizedBoundingBox(initial);
    }

    const resolved = features.reduce<NormalizedBBox | undefined>((acc, feature) => {
        const featureBbox = normalizeBoundingBox(feature.bbox) ?? geometryToBoundingBox(feature.geometry);

        if (!featureBbox) {
            return acc;
        }

        return mergeNormalizedBoundingBoxes(acc, featureBbox);
    }, initial);

    return cloneNormalizedBoundingBox(resolved);
}
