// (C) 2025 GoodData Corporation

import {
    type JsonApiAttributeOutWithLinks,
    type JsonApiDatasetOutWithLinks,
    isAttributeItem,
} from "@gooddata/api-client-tiger";
import { newAttributeMetadataObject } from "@gooddata/sdk-backend-base";
import { type IAttributeMetadataObject, type IDataSetMetadataObject, idRef } from "@gooddata/sdk-model";

import { commonMetadataObjectModifications } from "./MetadataConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";

export function convertDataSetItem(
    dataSet: JsonApiDatasetOutWithLinks,
    included?: unknown[],
): IDataSetMetadataObject {
    const converted: IDataSetMetadataObject = {
        id: dataSet.id,
        type: "dataSet",
        title: dataSet.attributes?.title ?? "",
        description: dataSet.attributes?.description ?? "",
        tags: dataSet.attributes?.tags,
        production: true,
        unlisted: false,
        deprecated: false,
        isLocked: isInheritedObject(dataSet),
        uri: dataSet.id,
        ref: {
            identifier: dataSet.id,
        },
    };

    const attributes = resolveIncludedAttributes(dataSet, included);
    if (attributes.length > 0) {
        converted.attributes = attributes;
    }
    return converted;
}

function resolveIncludedAttributes(
    dataSet: JsonApiDatasetOutWithLinks,
    included: unknown[] | undefined,
): IAttributeMetadataObject[] {
    if (!included?.length) {
        return [];
    }

    const includedAttributes = included.filter(isAttributeItem);
    if (includedAttributes.length === 0) {
        return [];
    }

    const attributeMap = new Map(includedAttributes.map((attribute) => [attribute.id, attribute]));
    const relationshipRefs = dataSet.relationships?.attributes?.data ?? [];

    return relationshipRefs
        .map((ref) => attributeMap.get(ref.id))
        .filter((attribute): attribute is JsonApiAttributeOutWithLinks => Boolean(attribute))
        .map(convertIncludedAttributeToMetadataObject);
}

function convertIncludedAttributeToMetadataObject(
    attribute: JsonApiAttributeOutWithLinks,
): IAttributeMetadataObject {
    return newAttributeMetadataObject(idRef(attribute.id, "attribute"), (m) =>
        m
            .modify(commonMetadataObjectModifications(attribute))
            .uri(attribute.links?.self ?? attribute.id)
            .production(true)
            .unlisted(false)
            .deprecated(false)
            .isLocked(isInheritedObject(attribute))
            .displayForms([]),
    );
}
