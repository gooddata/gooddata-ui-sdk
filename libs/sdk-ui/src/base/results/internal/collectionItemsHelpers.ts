// (C) 2019-2026 GoodData Corporation

import { type ICollectionItemsResult, type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type GeoCollectionKind,
    type IAttribute,
    attributeLocalId,
    isAttribute,
    isAttributeDescriptor,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type CollectionItemsRequestOptions = {
    collectionId: string;
    /**
     * Kind of geo collection - STATIC (default) or CUSTOM.
     * STATIC collections are built-in, CUSTOM collections are organization-scoped.
     */
    kind?: GeoCollectionKind;
    limit?: number;
    bbox?: string;
    datetime?: string;
};

export async function fetchCollectionItems(
    dataView: IDataView,
    values: string[],
    options: CollectionItemsRequestOptions,
): Promise<ICollectionItemsResult> {
    const result = await dataView.readCollectionItems({
        collectionId: options.collectionId,
        kind: options.kind,
        limit: options.limit,
        bbox: options.bbox,
        values: values.length ? values : undefined,
    });

    return {
        type: result?.type ?? "FeatureCollection",
        features: result?.features ?? [],
        bbox: result?.bbox,
    };
}

/**
 * Finds the coordinates of an attribute identified by its local identifier.
 *
 * @param dataView - data view to inspect
 * @param attribute - attribute definition or local identifier string
 */
export function findAttributeCoordinates(
    dataView: IDataView,
    attribute: IAttribute | string,
): {
    dimensionIndex: number;
    headerIndex: number;
} {
    const searchLocalId = normalizeAttributeLocalId(attribute);

    if (!searchLocalId) {
        return { dimensionIndex: -1, headerIndex: -1 };
    }

    const dimensions = dataView.result.dimensions ?? [];

    for (let dimIdx = 0; dimIdx < dimensions.length; dimIdx++) {
        const dimension = dimensions[dimIdx];

        for (let headerIdx = 0; headerIdx < dimension.headers.length; headerIdx++) {
            const header = dimension.headers[headerIdx];

            if (isAttributeDescriptor(header) && header.attributeHeader.localIdentifier === searchLocalId) {
                return { dimensionIndex: dimIdx, headerIndex: headerIdx };
            }
        }
    }

    return { dimensionIndex: -1, headerIndex: -1 };
}

export function describeAttribute(attribute: IAttribute | string): string {
    if (isAttribute(attribute)) {
        return attributeLocalId(attribute);
    }

    if (typeof attribute === "string") {
        return attribute;
    }

    return "unknown";
}

function normalizeAttributeLocalId(attribute: IAttribute | string): string | undefined {
    if (isAttribute(attribute)) {
        return attributeLocalId(attribute);
    }

    if (typeof attribute === "string") {
        return attribute;
    }

    return undefined;
}
