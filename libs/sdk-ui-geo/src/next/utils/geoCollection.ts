// (C) 2025 GoodData Corporation

import { IAttributeDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Metadata describing a geo collection binding for an attribute.
 *
 * @alpha
 */
export interface IGeoCollectionMetadata {
    /**
     * Identifier of the geo collection to query.
     */
    collectionId: string;
    /**
     * Optional bounding box describing the collection extent.
     */
    bbox?: number[];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function resolveString(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function resolveNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function resolveBBoxFromCorners(value: Record<string, unknown> | undefined): number[] | undefined {
    if (!value) {
        return undefined;
    }

    const minLng =
        resolveNumber(value["minLng"]) ?? resolveNumber(value["west"]) ?? resolveNumber(value["minX"]);
    const minLat =
        resolveNumber(value["minLat"]) ?? resolveNumber(value["south"]) ?? resolveNumber(value["minY"]);
    const maxLng =
        resolveNumber(value["maxLng"]) ?? resolveNumber(value["east"]) ?? resolveNumber(value["maxX"]);
    const maxLat =
        resolveNumber(value["maxLat"]) ?? resolveNumber(value["north"]) ?? resolveNumber(value["maxY"]);

    if ([minLng, minLat, maxLng, maxLat].every((entry) => entry !== undefined)) {
        return [minLng as number, minLat as number, maxLng as number, maxLat as number];
    }

    const southWest = asRecord(value["southWest"]);
    const northEast = asRecord(value["northEast"]);
    const swLng = resolveNumber(southWest?.["lng"]);
    const swLat = resolveNumber(southWest?.["lat"]);
    const neLng = resolveNumber(northEast?.["lng"]);
    const neLat = resolveNumber(northEast?.["lat"]);

    if ([swLng, swLat, neLng, neLat].every((entry) => entry !== undefined)) {
        return [
            Math.min(swLng as number, neLng as number),
            Math.min(swLat as number, neLat as number),
            Math.max(swLng as number, neLng as number),
            Math.max(swLat as number, neLat as number),
        ];
    }

    return undefined;
}

function resolveBoundingBox(value: unknown): number[] | undefined {
    if (Array.isArray(value) && value.length >= 4) {
        const coords = value.slice(0, 4);
        if (coords.every((entry) => typeof entry === "number" && Number.isFinite(entry))) {
            return coords as number[];
        }
    }

    return resolveBBoxFromCorners(asRecord(value));
}

/**
 * Attempts to extract geo collection metadata from an attribute descriptor.
 *
 * The backend may expose the metadata under different shapes as the contract evolves. This helper probes
 * the known variants and gracefully falls back when the metadata is not available.
 *
 * @internal
 */
export function resolveGeoCollectionMetadata(
    descriptor: IAttributeDescriptor | undefined,
): IGeoCollectionMetadata | undefined {
    if (!descriptor) {
        return undefined;
    }

    const header = descriptor.attributeHeader as unknown as Record<string, unknown>;
    const geoAreaConfig = asRecord(header["geoAreaConfig"]);
    const collectionFromGeoConfig = asRecord(geoAreaConfig?.["collection"]);
    const legacyCollection = asRecord(header["collection"]);
    const bboxCandidate =
        collectionFromGeoConfig?.["bbox"] ??
        geoAreaConfig?.["bbox"] ??
        legacyCollection?.["bbox"] ??
        header["collectionBBox"] ??
        header["bbox"];

    const collectionId =
        resolveString(collectionFromGeoConfig?.["id"]) ??
        resolveString(legacyCollection?.["id"]) ??
        resolveString(header["collectionId"]);
    const bbox = resolveBoundingBox(bboxCandidate);

    if (!collectionId) {
        return undefined;
    }

    return {
        collectionId,
        bbox,
    };
}

/**
 * Resolves geo collection metadata for the area location attribute.
 *
 * @remarks
 * Area executions always expose the location attribute as the first attribute descriptor.
 * If the metadata is absent, the function returns undefined.
 *
 * @param dataView - Data view facade containing the execution result metadata
 * @returns geo collection metadata or undefined when not available
 *
 * @alpha
 */
export function getLocationCollectionMetadata(
    dataView: DataViewFacade | null,
): IGeoCollectionMetadata | undefined {
    if (!dataView) {
        return undefined;
    }

    const descriptors = dataView.meta().attributeDescriptors();
    if (descriptors.length === 0) {
        return undefined;
    }

    return resolveGeoCollectionMetadata(descriptors[0]);
}
