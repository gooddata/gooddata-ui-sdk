// (C) 2026 GoodData Corporation

import {
    type JsonApiComputedAttributeOut,
    type JsonApiComputedAttributeOutAttributesValueTypeEnum,
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

import { definedOnly } from "../../utils/definedOnly.js";

import { convertCertificationFromBackend } from "./CertificationConverter.js";
import { convertLabelType } from "./LabelTypeConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

/**
 * Fabricates the single display form of a computed attribute.
 *
 * A computed attribute has no real labels on the backend. To mimic the structure of a normal
 * attribute (and thus be usable in the same UI places), exactly one display form is fabricated
 * client-side: it shares the id and title with the computed attribute itself and carries the
 * display form type derived from the value type, so a hyperlink or image computed attribute
 * renders the same way a label of that type does.
 */
export function fabricateComputedAttributeDisplayForm(
    id: string,
    title: string,
    description: string,
    valueType?: JsonApiComputedAttributeOutAttributesValueTypeEnum,
): IAttributeDisplayFormMetadataObject {
    const displayFormType = convertLabelType(valueType);
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
        ...(displayFormType ? { displayFormType } : {}),
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
        isLocked: isInheritedObject(object),
        expression: attributes.content.maql,
        displayForms: [fabricateComputedAttributeDisplayForm(id, title, description, attributes.valueType)],
        // Optional fields are kept only when the backend returned them, so the metadata object
        // carries no explicit undefined keys.
        ...definedOnly({
            isHidden: attributes.isHidden,
            format: attributes.content.format ?? undefined,
            metricType: attributes.content.metricType,
            dataType: attributes.dataType,
            valueType: attributes.valueType,
            isNullable: attributes.isNullable,
            nullValue: attributes.nullValue,
            locale: attributes.locale,
            created: attributes.createdAt ?? undefined,
            createdBy: convertUserIdentifier(relationships?.createdBy, included),
            updated: attributes.modifiedAt ?? undefined,
            updatedBy: convertUserIdentifier(relationships?.modifiedBy, included),
            certification: convertCertificationFromBackend(
                attributes,
                convertUserIdentifier(relationships?.certifiedBy, included),
            ),
        }),
    };
}

export function convertComputedAttributesWithLinks(
    list: JsonApiComputedAttributeOutList,
): IComputedAttributeMetadataObject[] {
    return list.data.map((item) => convertComputedAttributeFromBackend(item, list.included));
}
