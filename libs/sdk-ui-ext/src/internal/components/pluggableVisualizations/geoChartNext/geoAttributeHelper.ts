// (C) 2025-2026 GoodData Corporation

import {
    type IAttribute,
    type IInsightDefinition,
    type ObjRef,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    idRef,
    insightBucket,
    insightLayers,
    insightProperties,
    isUriRef,
    uriRef,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type IBucketItem, type IVisualizationProperties } from "../../../interfaces/Visualization.js";

/**
 * Extracts visualization controls from insight properties.
 *
 * @param insight - The insight definition
 * @returns Visualization controls or empty object
 * @internal
 */
export function extractControls(insight: IInsightDefinition): IVisualizationProperties {
    const properties = insightProperties(insight);
    return (properties?.["controls"] as IVisualizationProperties) ?? {};
}

/**
 * Gets the latitude attribute from the insight's LOCATION bucket.
 *
 * @remarks
 * The LOCATION bucket contains the primary geo attribute (latitude label).
 * This is used for backward compatibility with the bucket structure.
 *
 * @param insight - The insight definition
 * @returns Latitude attribute or undefined if not present
 * @internal
 */
export function getLatitudeAttribute(insight: IInsightDefinition): IAttribute | undefined {
    const locationBucket = insightBucket(insight, BucketNames.LOCATION);
    return locationBucket ? bucketAttribute(locationBucket) : undefined;
}

/**
 * Extracts identifier or URI from an ObjRef.
 *
 * @param ref - Object reference to extract from
 * @returns URI string, identifier string, or undefined
 * @internal
 */
export function getRefIdentifier(ref: ObjRef | undefined): string | undefined {
    if (!ref) {
        return undefined;
    }
    return isUriRef(ref) ? ref.uri : ref.identifier;
}

/**
 * Creates an ObjRef for an attribute, using URI or ID based on the location attribute format.
 *
 * @param locationAttribute - The location attribute to match format against
 * @param attributeId - Display form ID or URI to use
 * @returns Object reference (URI or ID based)
 * @internal
 */
export function createAttributeRef(locationAttribute: IAttribute, attributeId: string): ObjRef {
    const displayFormRef = attributeDisplayFormRef(locationAttribute);
    return isUriRef(displayFormRef) ? uriRef(attributeId) : idRef(attributeId, "displayForm");
}

/**
 * Extracts location-related properties for latitude and longitude display forms.
 *
 * @param locationItem - The location bucket item containing display forms
 * @param supportsSeparateLatLong - Whether backend supports separate lat/long labels
 * @returns Object with optional latitude/longitude identifiers
 * @internal
 */
export function getLocationProperties(locationItem: IBucketItem): {
    latitude?: string | undefined;
    longitude?: string | undefined;
} {
    const latitudeDfRef = locationItem.displayForms?.find(
        (displayForm) => displayForm.type === "GDC.geo.pin_latitude",
    )?.ref;
    const longitudeDfRef = locationItem.displayForms?.find(
        (displayForm) => displayForm.type === "GDC.geo.pin_longitude",
    )?.ref;

    return {
        ...(latitudeDfRef ? { latitude: getRefIdentifier(latitudeDfRef) } : {}),
        ...(longitudeDfRef ? { longitude: getRefIdentifier(longitudeDfRef) } : {}),
    };
}

/**
 * Gets the alias and local identifier from a location attribute.
 *
 * @param locationAttribute - The location attribute
 * @param customLocalId - Optional custom local identifier to use
 * @returns Object with alias and localId
 * @internal
 */
export function getAttributeMetadata(
    locationAttribute: IAttribute,
    customLocalId?: string,
): { alias: string | undefined; localId: string } {
    return {
        alias: attributeAlias(locationAttribute),
        localId: customLocalId ?? attributeLocalId(locationAttribute),
    };
}

/**
 * Returns controls attached to the primary pushpin layer in the insight definition.
 *
 * @internal
 */
export function getPrimaryLayerControls(insight: IInsightDefinition): {
    latitude?: string;
    longitude?: string;
} {
    const layers = insightLayers(insight);
    const pushpinLayer = layers.find((layer) => layer.type === "pushpin");
    const controls =
        (pushpinLayer?.properties?.["controls"] as Record<string, unknown> | undefined) ?? undefined;

    const readControl = (key: string) => (typeof controls?.[key] === "string" ? controls[key] : undefined);

    return {
        latitude: readControl("latitude"),
        longitude: readControl("longitude"),
    };
}
