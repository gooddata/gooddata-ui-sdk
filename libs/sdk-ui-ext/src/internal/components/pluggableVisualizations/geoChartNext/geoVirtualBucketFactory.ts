// (C) 2025 GoodData Corporation

import { IBucket, IInsightDefinition, insightBucket, newAttribute, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { createAttributeRef, getAttributeMetadata, getLocationAttribute } from "./geoAttributeHelper.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";

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
    supportsSeparateLatLong: boolean,
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

    // Add latitude/longitude only if backend supports it
    if (supportsSeparateLatLong) {
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
 * Creates a virtual bucket from the location attribute's display form.
 * Virtual buckets are used for tooltip, latitude, and longitude execution attributes.
 *
 * @param insight - The insight definition
 * @param bucketName - Name for the virtual bucket (e.g., TOOLTIP_TEXT, LATITUDE, LONGITUDE)
 * @param attributeId - Display form ID or URI to use
 * @param attributeLocalIdentifier - Local identifier for the attribute
 * @returns Virtual bucket or undefined if location attribute is not present or bucket already exists
 * @internal
 */
export function createVirtualBucketFromLocationAttribute(
    insight: IInsightDefinition,
    bucketName: string,
    attributeId: string,
    attributeLocalIdentifier: string,
): IBucket | undefined {
    const locationAttribute = getLocationAttribute(insight);
    if (!locationAttribute) {
        return undefined;
    }

    // Don't create duplicate virtual buckets
    if (insightBucket(insight, bucketName)) {
        return undefined;
    }

    const ref = createAttributeRef(locationAttribute, attributeId);
    const { alias, localId } = getAttributeMetadata(locationAttribute, attributeLocalIdentifier);

    return newBucket(
        bucketName,
        newAttribute(ref, (m) => m.localId(localId).alias(alias)),
    );
}
