// (C) 2025 GoodData Corporation

import { IGeoJsonFeature } from "@gooddata/sdk-model";

type NormalizedBBox = [number, number, number, number];

function normalizeBoundingBox(bbox?: number[]): NormalizedBBox | undefined {
    if (!bbox || bbox.length < 4) {
        return undefined;
    }

    const [minLng, minLat, maxLng, maxLat] = bbox;
    const values = [minLng, minLat, maxLng, maxLat];

    if (!values.every((value) => Number.isFinite(value))) {
        return undefined;
    }

    return [minLng as number, minLat as number, maxLng as number, maxLat as number];
}

function cloneNormalizedBoundingBox(bbox: NormalizedBBox | undefined): NormalizedBBox | undefined {
    return bbox ? ([...bbox] as NormalizedBBox) : undefined;
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

function coordsToBoundingBox(value: unknown): NormalizedBBox | undefined {
    if (!Array.isArray(value) || value.length === 0) {
        return undefined;
    }

    const typed = value as unknown[];
    const looksLikePosition =
        typed.length >= 2 && typed.every((entry) => typeof entry === "number" && Number.isFinite(entry));

    if (looksLikePosition) {
        const [lng, lat] = typed as GeoJSON.Position;

        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
            return undefined;
        }

        const normalizedLng = lng as number;
        const normalizedLat = lat as number;

        return [normalizedLng, normalizedLat, normalizedLng, normalizedLat];
    }

    return typed.reduce<NormalizedBBox | undefined>((acc, entry) => {
        const child = coordsToBoundingBox(entry);
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

    return coordsToBoundingBox((geometry as Extract<GeoJSON.Geometry, { coordinates: unknown }>).coordinates);
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
    fallback?: number[],
): number[] | undefined {
    const initial = normalizeBoundingBox(fallback);

    if (!features || features.length === 0) {
        return cloneNormalizedBoundingBox(initial);
    }

    const resolved = features.reduce<NormalizedBBox | undefined>((acc, feature) => {
        const featureBbox =
            normalizeBoundingBox(feature.bbox as number[] | undefined) ??
            geometryToBoundingBox(feature.geometry);

        if (!featureBbox) {
            return acc;
        }

        return mergeNormalizedBoundingBoxes(acc, featureBbox);
    }, initial);

    return cloneNormalizedBoundingBox(resolved);
}
