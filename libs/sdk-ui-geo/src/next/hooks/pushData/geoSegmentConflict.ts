// (C) 2025-2026 GoodData Corporation

import { type IGeoLayerData } from "../../context/GeoLayersContext.js";
import { isAreaGeoData } from "../../types/geoData/typeGuards.js";

function normalizeSegmentValue(value: string | undefined): string {
    return value?.trim() ?? "";
}

export function hasOneToManySegmentRelationship(
    keys: string[],
    segmentValues: string[],
    segmentIdentifiers: string[] = segmentValues,
): boolean {
    // Detect 1:M conflicts: the same location/area key is paired with multiple segment elements.
    const keyToSegments = new Map<string, Set<string>>();

    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (!key) {
            continue;
        }

        const segmentValue = normalizeSegmentValue(segmentValues[index]);
        if (!segmentValue) {
            continue;
        }

        const segmentIdentifier = normalizeSegmentValue(segmentIdentifiers[index] ?? segmentValue);
        if (!segmentIdentifier) {
            continue;
        }

        let segments = keyToSegments.get(key);
        if (!segments) {
            segments = new Set<string>();
            keyToSegments.set(key, segments);
        }
        segments.add(segmentIdentifier);
    }

    for (const segments of keyToSegments.values()) {
        if (segments.size > 1) {
            return true;
        }
    }

    return false;
}

function hasAreaSegmentConflict(layer: IGeoLayerData): boolean {
    const { geoData } = layer;
    if (!geoData || !isAreaGeoData(geoData)) {
        return false;
    }

    const areaValues = geoData.area?.data ?? [];
    const areaUris = geoData.area?.uris ?? [];
    const segmentValues = geoData.segment?.data ?? [];
    const segmentIdentifiers = geoData.segment?.uris ?? segmentValues;
    if (areaValues.length === 0 || segmentValues.length === 0) {
        return false;
    }

    // Area conflict is evaluated on area element URIs (with value fallback for legacy payloads).
    const areaKeys = areaValues.map((areaValue, index) => areaUris[index] ?? areaValue);

    return hasOneToManySegmentRelationship(areaKeys, segmentValues, segmentIdentifiers);
}

export function hasGeoSegmentConflict(layers: Map<string, IGeoLayerData>): boolean {
    // Recommendation is shown when at least one area layer contains a segment conflict.
    for (const layer of layers.values()) {
        if (hasAreaSegmentConflict(layer)) {
            return true;
        }
    }

    return false;
}
