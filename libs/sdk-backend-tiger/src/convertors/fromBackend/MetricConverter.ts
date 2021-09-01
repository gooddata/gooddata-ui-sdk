// (C) 2021 GoodData Corporation

import {
    JsonApiMetricInAttributes,
    JsonApiMetricOutDocument,
    JsonApiMetricOutWithLinks,
} from "@gooddata/api-client-tiger";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { IMeasureMetadataObject } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { isInheritedObject } from "./utils";

/**
 * Type guard checking whether object is an instance of JsonApiMetricOutDocument.
 */
function isJsonApiMetricOutDocument(obj: unknown): obj is JsonApiMetricOutDocument {
    return (obj as JsonApiMetricOutDocument).data !== undefined;
}

export function convertMetricFromBackend(
    data: JsonApiMetricOutDocument | JsonApiMetricOutWithLinks,
): IMeasureMetadataObject {
    let id: string;
    let attributes: JsonApiMetricInAttributes;
    if (isJsonApiMetricOutDocument(data)) {
        id = data.data.id;
        attributes = data.data.attributes;
    } else {
        id = data.id;
        attributes = data.attributes;
    }
    const ref = idRef(id, "measure");

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(id)
            .title(attributes?.title || "")
            .isLocked(isInheritedObject(id))
            .description(attributes?.description || "")
            .expression(attributes.content.maql)
            .format(attributes.content.format || ""),
    );
}
