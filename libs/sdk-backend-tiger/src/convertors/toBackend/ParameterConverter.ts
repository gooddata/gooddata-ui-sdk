// (C) 2026 GoodData Corporation

import type {
    JsonApiParameterOutAttributesDefinition,
    JsonApiParameterPatchAttributes,
    JsonApiParameterPostOptionalIdAttributes,
} from "@gooddata/api-client-tiger";
import {
    type IParameterDefinition,
    type IParameterMetadataObjectDefinition,
    throwUnexpected,
} from "@gooddata/sdk-model";

function convertParameterDefinitionToBackend(
    definition: IParameterDefinition,
): JsonApiParameterOutAttributesDefinition {
    const { type } = definition;
    switch (type) {
        case "NUMBER":
            return {
                type: "NUMBER",
                defaultValue: definition.defaultValue,
                ...(definition.constraints === undefined ? {} : { constraints: definition.constraints }),
            };
        case "STRING":
            return {
                type: "STRING",
                defaultValue: definition.defaultValue,
                ...(definition.constraints === undefined ? {} : { constraints: definition.constraints }),
            };
        default:
            return throwUnexpected(type);
    }
}

export function convertParameterToBackendCreate(
    parameter: IParameterMetadataObjectDefinition,
): JsonApiParameterPostOptionalIdAttributes {
    return {
        title: parameter.title,
        description: parameter.description,
        tags: parameter.tags,
        definition: convertParameterDefinitionToBackend(parameter.definition),
    };
}

export function convertParameterToBackendUpdate(
    parameter: Partial<IParameterMetadataObjectDefinition>,
): JsonApiParameterPatchAttributes {
    return {
        ...(parameter.title === undefined ? {} : { title: parameter.title }),
        ...(parameter.description === undefined ? {} : { description: parameter.description }),
        ...(parameter.tags === undefined ? {} : { tags: parameter.tags }),
        ...(parameter.definition === undefined
            ? {}
            : { definition: convertParameterDefinitionToBackend(parameter.definition) }),
    };
}
