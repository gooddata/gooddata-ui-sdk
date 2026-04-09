// (C) 2026 GoodData Corporation

import {
    type JsonApiParameterOutDocument,
    type JsonApiParameterOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IParameterDefinition, type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

export function convertParameterFromBackend(
    data: JsonApiParameterOutDocument | JsonApiParameterOutWithLinks,
): IParameterMetadataObject {
    const parameter = "data" in data ? data.data : data;
    const included = "data" in data ? (data.included ?? []) : [];

    return {
        id: parameter.id,
        uri: data.links?.self ?? parameter.id,
        ref: idRef(parameter.id, "parameter"),
        type: "parameter",
        title: parameter.attributes.title ?? "",
        description: parameter.attributes.description ?? "",
        tags: parameter.attributes.tags ?? [],
        production: true,
        deprecated: false,
        unlisted: false,
        isLocked: isInheritedObject(parameter),
        definition: convertParameterDefinition(parameter.attributes.definition),
        areRelationsValid: parameter.attributes.areRelationsValid,
        created: parameter.attributes.createdAt ?? undefined,
        updated: parameter.attributes.modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(parameter.relationships?.createdBy, included),
        updatedBy: convertUserIdentifier(parameter.relationships?.modifiedBy, included),
    };
}

function convertParameterDefinition(
    definition: JsonApiParameterOutWithLinks["attributes"]["definition"],
): IParameterDefinition {
    return {
        type: definition.type,
        defaultValue: definition.defaultValue,
        ...(definition.constraints ? { constraints: definition.constraints } : {}),
    };
}
