// (C) 2026 GoodData Corporation

import {
    type JsonApiParameterOut,
    type JsonApiParameterOutWithLinks,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IParameterDefinition,
    type IParameterMetadataObject,
    idRef,
    throwUnexpected,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

export function convertParameter(
    parameter: JsonApiParameterOut | JsonApiParameterOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IParameterMetadataObject {
    const links = "links" in parameter ? parameter.links : undefined;
    return {
        id: parameter.id,
        uri: links?.self ?? "",
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
    const { type } = definition;
    switch (type) {
        case "NUMBER":
            return {
                type: "NUMBER",
                defaultValue: definition.defaultValue,
                ...(definition.constraints ? { constraints: definition.constraints } : {}),
            };
        case "STRING":
            return {
                type: "STRING",
                defaultValue: definition.defaultValue,
                ...(definition.constraints ? { constraints: definition.constraints } : {}),
            };
        default:
            return throwUnexpected(type);
    }
}
