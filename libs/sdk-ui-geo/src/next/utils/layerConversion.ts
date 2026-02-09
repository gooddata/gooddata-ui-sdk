// (C) 2025-2026 GoodData Corporation

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type IColorMappingItem,
    type IColorPalette,
    type IInsightLayerDefinition,
    type ObjRef,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    bucketMeasure,
    idRef,
    isAttribute,
    isIdentifierRef,
    isMeasure,
    newAttribute,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IColorMapping, getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";

import { isRecord } from "./guards.js";
import { registerHeaderPredicateKey } from "./predicateFingerprint.js";
import {
    type IGeoLayer,
    type IGeoLayerArea,
    type IGeoLayerConfig,
    type IGeoLayerPushpin,
} from "../types/layers/index.js";

/**
 * Expected shape of geo layer controls in visualization properties.
 *
 * @internal
 */
interface IGeoLayerControls {
    latitude?: string;
    longitude?: string;
}

function isColorMappingItem(value: unknown): value is IColorMappingItem {
    if (!isRecord(value)) {
        return false;
    }
    const id = value["id"];
    const color = value["color"];
    if (typeof id !== "string") {
        return false;
    }
    if (!isRecord(color)) {
        return false;
    }
    return typeof color["type"] === "string";
}

/**
 * `getColorMappingPredicate(id)` returns a new function instance on every call.
 * That makes layer configs look "changed" even if mapping is semantically the same,
 * which then cascades into unnecessary re-syncs (map flicker) on unrelated UI updates.
 *
 * Cache predicate instances per id to keep them referentially stable.
 */
const colorMappingPredicateCache = new Map<string, ReturnType<typeof getColorMappingPredicate>>();

function getStableColorMappingPredicate(id: string): ReturnType<typeof getColorMappingPredicate> {
    const cached = colorMappingPredicateCache.get(id);
    if (cached) {
        registerHeaderPredicateKey(cached, id);
        return cached;
    }
    const created = getColorMappingPredicate(id);
    registerHeaderPredicateKey(created, id);
    colorMappingPredicateCache.set(id, created);
    return created;
}

function getLayerColorMappingFromControls(controls: unknown): IColorMapping[] | undefined {
    if (!isRecord(controls)) {
        return undefined;
    }
    const raw = controls["colorMapping"];
    if (!Array.isArray(raw)) {
        return undefined;
    }

    const items = raw.filter(isColorMappingItem);
    if (items.length === 0) {
        return undefined;
    }

    return items.map((mapItem) => ({
        id: mapItem.id,
        predicate: getStableColorMappingPredicate(mapItem.id),
        color: mapItem.color,
    }));
}

function getLayerColorPaletteFromControls(controls: unknown): IColorPalette | undefined {
    if (!isRecord(controls)) {
        return undefined;
    }
    const raw = controls["colorPalette"];
    if (!Array.isArray(raw)) {
        return undefined;
    }

    // Minimal validation - accept only palette items with guid + fill.
    const palette = raw.filter((item): item is IColorPalette[number] => {
        if (!isRecord(item)) {
            return false;
        }
        return typeof item["guid"] === "string" && isRecord(item["fill"]);
    });

    return palette.length > 0 ? palette : undefined;
}

/**
 * Type guard for IGeoLayerControls.
 */
function isGeoLayerControls(value: unknown): value is IGeoLayerControls {
    if (!isRecord(value)) {
        return false;
    }
    const { latitude, longitude } = value;
    const hasValidLatitude = latitude === undefined || typeof latitude === "string";
    const hasValidLongitude = longitude === undefined || typeof longitude === "string";
    return hasValidLatitude && hasValidLongitude;
}

/**
 * Layer type constants for geo visualizations
 *
 * @internal
 */
export const GEO_LAYER_TYPES = {
    PUSHPIN: "pushpin",
    AREA: "area",
} as const;

/**
 * Normalizes an ObjRef to ensure it has the correct type for display forms.
 *
 * @remarks
 * When storing insights, display form references may have type "attribute" instead of "displayForm".
 * This function normalizes the reference to use the correct type for execution.
 *
 * @param ref - The object reference to normalize
 * @returns The normalized reference with type "displayForm"
 *
 * @internal
 */
function normalizeDisplayFormRef(ref: ObjRef): ObjRef {
    if (!isIdentifierRef(ref)) {
        return ref;
    }

    // If the type is "attribute", change it to "displayForm" for execution
    // This handles cases where insights are stored with "attribute" type for display forms
    if (ref.type === "attribute") {
        return idRef(ref.identifier, "displayForm");
    }

    return ref;
}

/**
 * Normalizes an attribute to ensure its display form reference has the correct type.
 *
 * @remarks
 * When loading insight layers, attribute display form references may have type "attribute"
 * instead of "displayForm" (label). This function creates a new attribute with the
 * normalized display form reference to ensure proper execution.
 *
 * @param attribute - The attribute to normalize
 * @returns A new attribute with normalized display form reference
 *
 * @internal
 */
function normalizeAttribute(attribute: IAttribute): IAttribute {
    const displayFormRef = attributeDisplayFormRef(attribute);
    const normalizedRef = normalizeDisplayFormRef(displayFormRef);

    // If the ref didn't change, return the original attribute
    if (normalizedRef === displayFormRef) {
        return attribute;
    }

    // Create a new attribute with the normalized display form ref
    return newAttribute(normalizedRef, (builder) => builder.localId(attributeLocalId(attribute)));
}

/**
 * Extracts an attribute from a bucket by name
 *
 * @param buckets - Array of buckets to search
 * @param bucketName - Name of the bucket to find
 * @returns The attribute if found, undefined otherwise
 *
 * @internal
 */
function getAttributeFromBucket(buckets: IBucket[], bucketName: string): IAttribute | undefined {
    const bucket = buckets.find((b) => b.localIdentifier === bucketName);
    if (!bucket) {
        return undefined;
    }
    const attr = bucketAttribute(bucket);
    return attr && isAttribute(attr) ? normalizeAttribute(attr) : undefined;
}

/**
 * Extracts an attribute or measure from a bucket by name
 *
 * @param buckets - Array of buckets to search
 * @param bucketName - Name of the bucket to find
 * @returns The attribute or measure if found, undefined otherwise
 *
 * @internal
 */
function getAttributeOrMeasureFromBucket(
    buckets: IBucket[],
    bucketName: string,
): IAttributeOrMeasure | undefined {
    const bucket = buckets.find((b) => b.localIdentifier === bucketName);
    if (!bucket) {
        return undefined;
    }

    // Try attribute first
    const attr = bucketAttribute(bucket);
    if (attr && isAttribute(attr)) {
        return normalizeAttribute(attr);
    }

    // Try measure
    const measure = bucketMeasure(bucket);
    if (measure && isMeasure(measure)) {
        return measure;
    }

    return undefined;
}

/**
 * Creates an attribute from a display form identifier.
 *
 * @param displayFormId - The display form identifier to use
 * @param localId - The local identifier for the new attribute
 * @returns A new attribute or undefined if displayFormId is not provided
 *
 * @internal
 */
function createAttributeFromDisplayFormId(
    displayFormId: string | undefined,
    localId: string,
): IAttribute | undefined {
    if (!displayFormId) {
        return undefined;
    }

    const displayFormRef = idRef(displayFormId, "displayForm");
    return newAttribute(displayFormRef, (builder) => builder.localId(localId));
}

/**
 * Converts an IInsightLayerDefinition to IGeoLayerPushpin
 *
 * @param insightLayer - The insight layer definition
 * @returns A pushpin geo layer configuration or null if lat/long not available
 *
 * @remarks
 * For pushpin layers, latitude and longitude attributes are required.
 * These can be provided in two ways:
 * 1. Explicitly as latitude/longitude buckets in the layer
 * 2. As properties.latitude and properties.longitude identifiers in the layer
 *
 * If the layer has a location bucket, the latitude and longitude must be resolved
 * from the layer properties (controls.latitude and controls.longitude).
 *
 * @internal
 */
function convertToPushpinLayer(insightLayer: IInsightLayerDefinition): IGeoLayerPushpin | null {
    const { id, name, buckets, filters, sorts, properties } = insightLayer;

    let latitude = getAttributeFromBucket(buckets, BucketNames.LATITUDE);
    let longitude = getAttributeFromBucket(buckets, BucketNames.LONGITUDE);
    const location = getAttributeFromBucket(buckets, BucketNames.LOCATION);

    const controls = properties?.["controls"];

    if (isGeoLayerControls(controls) && !latitude && !longitude && controls.latitude && controls.longitude) {
        // Keep localId of the original LOCATION attribute so MVF/ranking filters that reference it
        // (via localIdRef in dimensionality) do not become dangling when LOCATION is resolved to LAT/LNG.
        const latitudeLocalId = location ? attributeLocalId(location) : "latitude_df";
        latitude = createAttributeFromDisplayFormId(controls.latitude, latitudeLocalId);
        longitude = createAttributeFromDisplayFormId(controls.longitude, "longitude_df");
    }

    const size = getAttributeOrMeasureFromBucket(buckets, BucketNames.SIZE);
    const color = getAttributeOrMeasureFromBucket(buckets, BucketNames.COLOR);
    const segmentBy = getAttributeFromBucket(buckets, BucketNames.SEGMENT);
    const colorMapping = getLayerColorMappingFromControls(controls);
    const colorPalette = getLayerColorPaletteFromControls(controls);
    const layerConfig: IGeoLayerConfig | undefined = colorPalette || colorMapping ? {} : undefined;
    if (layerConfig && colorPalette) {
        layerConfig.colorPalette = colorPalette;
    }
    if (layerConfig && colorMapping) {
        layerConfig.colorMapping = colorMapping;
    }

    if (!latitude || !longitude) {
        return null;
    }

    // If LOCATION exists, keep its localId for the effective "location" attribute (latitude).
    // This ensures MVF dimensionality localIdRef(locationLocalId) continues to work even if the layer
    // stores explicit LATITUDE/LONGITUDE buckets or derives them from controls.
    if (location && attributeLocalId(latitude) !== attributeLocalId(location)) {
        latitude = newAttribute(attributeDisplayFormRef(latitude), (builder) =>
            builder.localId(attributeLocalId(location)),
        );
    }

    return {
        id,
        name,
        type: "pushpin",
        latitude,
        longitude,
        size,
        color,
        segmentBy,
        ...(layerConfig ? { config: layerConfig } : {}),
        filters,
        sortBy: sorts,
    };
}

/**
 * Converts an IInsightLayerDefinition to IGeoLayerArea
 *
 * @param insightLayer - The insight layer definition
 * @returns An area geo layer configuration or null if area attribute is missing
 *
 * @internal
 */
function convertToAreaLayer(insightLayer: IInsightLayerDefinition): IGeoLayerArea | null {
    const { id, name, buckets, filters, sorts, properties } = insightLayer;

    const area = getAttributeFromBucket(buckets, BucketNames.AREA);

    if (!area) {
        return null;
    }

    const controls = properties?.["controls"];
    const color = getAttributeOrMeasureFromBucket(buckets, BucketNames.COLOR);
    const segmentBy = getAttributeFromBucket(buckets, BucketNames.SEGMENT);
    const colorMapping = getLayerColorMappingFromControls(controls);
    const colorPalette = getLayerColorPaletteFromControls(controls);
    const layerConfig: IGeoLayerConfig | undefined = colorPalette || colorMapping ? {} : undefined;
    if (layerConfig && colorPalette) {
        layerConfig.colorPalette = colorPalette;
    }
    if (layerConfig && colorMapping) {
        layerConfig.colorMapping = colorMapping;
    }

    return {
        id,
        name,
        type: "area",
        area,
        color,
        segmentBy,
        ...(layerConfig ? { config: layerConfig } : {}),
        filters,
        sortBy: sorts,
    };
}

/**
 * Converts an IInsightLayerDefinition to an IGeoLayer based on its type
 *
 * @param insightLayer - The insight layer definition to convert
 * @returns The converted geo layer, or null if the layer type is not supported
 *
 * @remarks
 * Supported layer types:
 * - "pushpin" - Converts to IGeoLayerPushpin
 * - "area" - Converts to IGeoLayerArea (requires area attribute)
 *
 * @internal
 */
export function insightLayerToGeoLayer(insightLayer: IInsightLayerDefinition): IGeoLayer | null {
    const { type } = insightLayer;

    switch (type) {
        case GEO_LAYER_TYPES.PUSHPIN:
            return convertToPushpinLayer(insightLayer);
        case GEO_LAYER_TYPES.AREA:
            return convertToAreaLayer(insightLayer);
        default:
            return null;
    }
}

/**
 * Converts an array of IInsightLayerDefinition to IGeoLayer array
 *
 * @param insightLayers - Array of insight layer definitions
 * @returns Array of converted geo layers (excluding unsupported types)
 *
 * @remarks
 * Layers with unsupported types or invalid configurations are filtered out.
 *
 * @internal
 */
export function insightLayersToGeoLayers(insightLayers: IInsightLayerDefinition[]): IGeoLayer[] {
    return insightLayers.map(insightLayerToGeoLayer).filter((layer): layer is IGeoLayer => layer !== null);
}
