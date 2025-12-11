// (C) 2025 GoodData Corporation

import { IAttributeDescriptor, IAttributeDisplayFormGeoAreaConfig } from "@gooddata/sdk-model";
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
}

/**
 * Attempts to extract geo collection metadata from an attribute descriptor.
 *
 * @internal
 */
export function resolveGeoCollectionMetadata(
    descriptor: IAttributeDescriptor | undefined,
): IGeoCollectionMetadata | undefined {
    if (!descriptor) {
        return undefined;
    }

    const geoAreaConfig: IAttributeDisplayFormGeoAreaConfig | undefined =
        descriptor.attributeHeader.geoAreaConfig;
    const collectionId = geoAreaConfig?.collectionId;
    if (!collectionId) {
        return undefined;
    }

    return {
        collectionId,
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
