// (C) 2025 GoodData Corporation

import {
    type IBucket,
    type IInsightDefinition,
    insightBucket,
    newAttribute,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { createAttributeRef, getAttributeMetadata, getLatitudeAttribute } from "./geoAttributeHelper.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";

/**
 * Creates all virtual buckets (tooltip, latitude, longitude) based on controls and backend capabilities.
 *
 * @param insight - The insight definition
 * @param controls - Visualization controls containing tooltipText, latitude, longitude
 * @param supportsSeparateLatLong - Whether backend supports separate lat/long labels
 * @returns Array of virtual buckets
 * @internal
 */
export function createVirtualBuckets(
    insight: IInsightDefinition,
    controls: IVisualizationProperties,
): IBucket[] {
    const virtualBuckets: IBucket[] = [];

    // Always add tooltip if configured
    const tooltipBucket = tryCreateVirtualBucket(
        insight,
        controls["tooltipText"],
        BucketNames.TOOLTIP_TEXT,
        "tooltipText_df",
    );
    if (tooltipBucket) {
        virtualBuckets.push(tooltipBucket);
    }

    const latitudeBucket = tryCreateVirtualBucket(
        insight,
        controls["latitude"],
        BucketNames.LATITUDE,
        "latitude_df",
    );
    if (latitudeBucket) {
        virtualBuckets.push(latitudeBucket);
    }

    const longitudeBucket = tryCreateVirtualBucket(
        insight,
        controls["longitude"],
        BucketNames.LONGITUDE,
        "longitude_df",
    );
    if (longitudeBucket) {
        virtualBuckets.push(longitudeBucket);
    }

    return virtualBuckets;
}

/**
 * Attempts to create a virtual bucket if the attribute ID is provided.
 *
 * @param insight - The insight definition
 * @param attributeId - Display form ID or URI to use (undefined if not configured)
 * @param bucketName - Name for the virtual bucket
 * @param localIdentifier - Local identifier for the attribute
 * @returns Virtual bucket or undefined
 * @internal
 */
export function tryCreateVirtualBucket(
    insight: IInsightDefinition,
    attributeId: string | undefined,
    bucketName: string,
    localIdentifier: string,
): IBucket | undefined {
    if (!attributeId) {
        return undefined;
    }
    return createVirtualBucketFromLocationAttribute(insight, bucketName, attributeId, localIdentifier);
}

/**
 * Creates a virtual bucket from the latitude attribute's display form.
 * Virtual buckets are used for tooltip, latitude, and longitude execution attributes.
 *
 * @remarks
 * The latitude attribute is used as the base attribute for resolving related display forms
 * (tooltip text, latitude, longitude) since it represents the primary geo attribute.
 *
 * @param insight - The insight definition
 * @param bucketName - Name for the virtual bucket (e.g., TOOLTIP_TEXT, LATITUDE, LONGITUDE)
 * @param attributeId - Display form ID or URI to use
 * @param attributeLocalIdentifier - Local identifier for the attribute
 * @returns Virtual bucket or undefined if latitude attribute is not present or bucket already exists
 * @internal
 */
export function createVirtualBucketFromLocationAttribute(
    insight: IInsightDefinition,
    bucketName: string,
    attributeId: string,
    attributeLocalIdentifier: string,
): IBucket | undefined {
    // The LOCATION bucket contains the latitude attribute (primary geo attribute)
    const latitudeAttribute = getLatitudeAttribute(insight);
    if (!latitudeAttribute) {
        return undefined;
    }

    // Don't create duplicate virtual buckets
    if (insightBucket(insight, bucketName)) {
        return undefined;
    }

    const ref = createAttributeRef(latitudeAttribute, attributeId);
    const { alias, localId } = getAttributeMetadata(latitudeAttribute, attributeLocalIdentifier);

    return newBucket(
        bucketName,
        newAttribute(ref, (m) => m.localId(localId).alias(alias)),
    );
}
