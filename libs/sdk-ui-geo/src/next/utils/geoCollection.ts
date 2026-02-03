// (C) 2025-2026 GoodData Corporation

import {
    type GeoCollectionKind,
    type IAttributeDescriptor,
    type IAttributeDisplayFormGeoAreaConfig,
} from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Metadata describing a geo collection binding for an attribute.
 *
 * @internal
 */
export interface IGeoCollectionMetadata {
    /**
     * Identifier of the geo collection to query.
     */
    collectionId: string;

    /**
     * Kind of geo collection - STATIC (default) or CUSTOM.
     * STATIC collections are built-in, CUSTOM collections are organization-scoped.
     */
    kind?: GeoCollectionKind;
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
        kind: geoAreaConfig.kind,
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
 * @internal
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
