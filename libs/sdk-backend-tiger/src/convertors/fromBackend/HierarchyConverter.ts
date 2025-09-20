// (C) 2023-2025 GoodData Corporation

import { compact } from "lodash-es";

import {
    JsonApiAttributeHierarchyOut,
    JsonApiAttributeHierarchyOutAttributes,
    JsonApiAttributeHierarchyOutWithLinks,
    ObjectLinks,
} from "@gooddata/api-client-tiger";
import { ICatalogAttributeHierarchy, ObjectType, idRef } from "@gooddata/sdk-model";

export function convertAttributeHierarchy(
    hierarchyOut: JsonApiAttributeHierarchyOutWithLinks,
): ICatalogAttributeHierarchy {
    const { id, type, attributes, links } = hierarchyOut;
    return convertToCatalogAttributeHierarchy(id, type, attributes, links);
}

export function convertAttributeHierarchyWithoutLinks(
    hierarchyOut: JsonApiAttributeHierarchyOut,
): ICatalogAttributeHierarchy {
    const { id, type, attributes } = hierarchyOut;
    return convertToCatalogAttributeHierarchy(id, type, attributes);
}

function convertToCatalogAttributeHierarchy(
    id: string,
    type: ObjectType,
    attributes?: JsonApiAttributeHierarchyOutAttributes,
    links?: ObjectLinks,
): ICatalogAttributeHierarchy {
    const orderedAttributes = (attributes?.content as any)?.attributes ?? [];
    const convertedAttributes = orderedAttributes.map(
        (attribute: { identifier: { id: string; type: ObjectType } }) => {
            // content is free-form, so we need to make sure that all wanted properties are present
            if (!attribute.identifier?.id || !attribute.identifier?.type) {
                return undefined;
            }

            return idRef(attribute.identifier.id, attribute.identifier.type);
        },
    );

    return {
        type: "attributeHierarchy",
        attributeHierarchy: {
            type: "attributeHierarchy",
            id,
            uri: links?.self ?? "",
            ref: idRef(id, type),
            title: attributes?.title ?? "",
            description: attributes?.description ?? "",
            attributes: compact(convertedAttributes),
            production: true,
            deprecated: false,
            unlisted: false,
        },
    };
}
