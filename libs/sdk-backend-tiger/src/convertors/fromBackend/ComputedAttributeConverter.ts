// (C) 2026 GoodData Corporation

import {
    type JsonApiComputedAttributeOut,
    type JsonApiComputedAttributeOutDocument,
    type JsonApiComputedAttributeOutIncludes,
    type JsonApiComputedAttributeOutList,
    type JsonApiComputedAttributeOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IAttributeDisplayFormMetadataObject,
    type IComputedAttributeMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { convertCertificationFromBackend } from "./CertificationConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

/**
 * Fabricates the single display form of a computed attribute.
 *
 * A computed attribute has no real labels on the backend. To mimic the structure of a normal
 * attribute (and thus be usable in the same UI places), exactly one display form is fabricated
 * client-side: it shares the id and title with the computed attribute itself.
 */
export function fabricateComputedAttributeDisplayForm(
    id: string,
    title: string,
    description: string,
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        // The ref carries the COMPUTED ATTRIBUTE type, not "displayForm": this ref is what ends up
        // in the insight and what the AFM converter turns into an object qualifier, and the backend
        // expects an attribute item to reference a computed attribute by its own type rather than as
        // a label (a computed attribute has no real labels).
        ref: idRef(id, "computedAttribute"),
        id,
        uri: id,
        title,
        description,
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(id, "computedAttribute"),
        isDefault: true,
        isPrimary: true,
    };
}

function isJsonApiComputedAttributeOutDocument(obj: unknown): obj is JsonApiComputedAttributeOutDocument {
    return (obj as JsonApiComputedAttributeOutDocument).data !== undefined;
}

export function convertComputedAttributeFromBackend(
    data: JsonApiComputedAttributeOutDocument | JsonApiComputedAttributeOutWithLinks,
    included: JsonApiComputedAttributeOutIncludes[] = [],
): IComputedAttributeMetadataObject {
    const object = isJsonApiComputedAttributeOutDocument(data) ? data.data : data;
    const { id, attributes, relationships } = object as JsonApiComputedAttributeOut;
    const title = attributes.title ?? "";
    const description = attributes.description ?? "";

    return {
        type: "computedAttribute",
        ref: idRef(id, "computedAttribute"),
        id,
        uri: id,
        title,
        description,
        tags: attributes.tags ?? [],
        production: true,
        deprecated: false,
        unlisted: false,
        isHidden: attributes.isHidden,
        isLocked: isInheritedObject(object),
        expression: attributes.content.maql,
        format: attributes.content.format ?? undefined,
        metricType: attributes.content.metricType,
        dataType: attributes.dataType,
        isNullable: attributes.isNullable,
        nullValue: attributes.nullValue,
        locale: attributes.locale,
        displayForms: [fabricateComputedAttributeDisplayForm(id, title, description)],
        created: attributes.createdAt ?? undefined,
        createdBy: convertUserIdentifier(relationships?.createdBy, included),
        updated: attributes.modifiedAt ?? undefined,
        updatedBy: convertUserIdentifier(relationships?.modifiedBy, included),
        certification: convertCertificationFromBackend(
            attributes,
            convertUserIdentifier(relationships?.certifiedBy, included),
        ),
    };
}

export function convertComputedAttributesWithLinks(
    list: JsonApiComputedAttributeOutList,
): IComputedAttributeMetadataObject[] {
    return list.data.map((item) => convertComputedAttributeFromBackend(item, list.included));
}
