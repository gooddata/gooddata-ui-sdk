// (C) 2025 GoodData Corporation

import { IAttributeDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { isRecord } from "./guards.js";

/**
 * Geo area configuration from backend attribute header.
 *
 * @remarks
 * The AFM API returns geoAreaConfig on attribute headers, but IAttributeDescriptorBody
 * in sdk-model doesn't include this property. We define the expected shape here.
 *
 * @internal
 */
interface IGeoAreaConfig {
    collection: { id: string };
}

/**
 * Type guard for IGeoAreaConfig.
 */
function isGeoAreaConfig(value: unknown): value is IGeoAreaConfig {
    if (!isRecord(value)) {
        return false;
    }
    const collection = value["collection"];
    if (!isRecord(collection)) {
        return false;
    }
    return typeof collection["id"] === "string" && collection["id"].length > 0;
}

/**
 * Extended attribute header that includes geoAreaConfig from AFM API.
 *
 * @remarks
 * IAttributeDescriptorBody doesn't include geoAreaConfig, but the backend returns it.
 */
interface IAttributeHeaderWithGeoConfig {
    geoAreaConfig?: IGeoAreaConfig;
}

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

    const headerWithGeo = descriptor.attributeHeader as IAttributeHeaderWithGeoConfig;
    const geoAreaConfig = headerWithGeo.geoAreaConfig;

    if (!isGeoAreaConfig(geoAreaConfig)) {
        return undefined;
    }

    return {
        collectionId: geoAreaConfig.collection.id,
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
