// (C) 2021-2024 GoodData Corporation

import {
    JsonApiMetricOutDocument,
    JsonApiMetricOutWithLinks,
    JsonApiMetricOutIncludes,
} from "@gooddata/api-client-tiger";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { idRef, IMeasureMetadataObject } from "@gooddata/sdk-model";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

/**
 * Type guard checking whether object is an instance of JsonApiMetricOutDocument.
 */
function isJsonApiMetricOutDocument(obj: unknown): obj is JsonApiMetricOutDocument {
    return (obj as JsonApiMetricOutDocument).data !== undefined;
}

export function convertMetricFromBackend(
    data: JsonApiMetricOutDocument | JsonApiMetricOutWithLinks,
    included: JsonApiMetricOutIncludes[] = [],
): IMeasureMetadataObject {
    const { id, attributes, object, createdAt, createdBy, modifiedAt, modifiedBy } =
        getPropertiesFromData(data);
    const ref = idRef(id, "measure");

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(id)
            .title(attributes?.title || "")
            .isLocked(isInheritedObject(object))
            .tags(object.attributes.tags ?? [])
            .description(attributes?.description || "")
            .expression(attributes.content.maql)
            .format(attributes.content.format || "")
            .created(createdAt)
            .createdBy(convertUserIdentifier(createdBy, included))
            .updated(modifiedAt)
            .updatedBy(convertUserIdentifier(modifiedBy, included)),
    );
}

function getPropertiesFromData(data: JsonApiMetricOutDocument | JsonApiMetricOutWithLinks) {
    if (isJsonApiMetricOutDocument(data)) {
        return {
            id: data.data.id,
            attributes: data.data.attributes,
            object: data.data,
            createdAt: data.data.attributes.createdAt,
            modifiedAt: data.data.attributes.modifiedAt,
            createdBy: data.data.relationships?.createdBy,
            modifiedBy: data.data.relationships?.modifiedBy,
        };
    }
    return {
        id: data.id,
        attributes: data.attributes,
        object: data,
        createdAt: data.attributes.createdAt,
        modifiedAt: data.attributes.modifiedAt,
        createdBy: data.relationships?.createdBy,
        modifiedBy: data.relationships?.modifiedBy,
    };
}
