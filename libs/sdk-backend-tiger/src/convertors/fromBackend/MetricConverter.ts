// (C) 2021-2023 GoodData Corporation

import { JsonApiMetricOutDocument, JsonApiMetricOutWithLinks } from "@gooddata/api-client-tiger";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { idRef, IMeasureMetadataObject } from "@gooddata/sdk-model";
import { isInheritedObject } from "./ObjectInheritance.js";

/**
 * Type guard checking whether object is an instance of JsonApiMetricOutDocument.
 */
function isJsonApiMetricOutDocument(obj: unknown): obj is JsonApiMetricOutDocument {
    return (obj as JsonApiMetricOutDocument).data !== undefined;
}

export function convertMetricFromBackend(
    data: JsonApiMetricOutDocument | JsonApiMetricOutWithLinks,
): IMeasureMetadataObject {
    const { id, attributes, object } = getPropertiesFromData(data);
    const ref = idRef(id, "measure");

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(id)
            .title(attributes?.title || "")
            .isLocked(isInheritedObject(object))
            .description(attributes?.description || "")
            .expression(attributes.content.maql)
            .format(attributes.content.format || ""),
    );
}

function getPropertiesFromData(data: JsonApiMetricOutDocument | JsonApiMetricOutWithLinks) {
    if (isJsonApiMetricOutDocument(data)) {
        return {
            id: data.data.id,
            attributes: data.data.attributes,
            object: data.data,
        };
    }
    return {
        id: data.id,
        attributes: data.attributes,
        object: data,
    };
}
