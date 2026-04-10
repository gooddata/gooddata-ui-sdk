// (C) 2026 GoodData Corporation

import type {
    JsonApiParameterPatchAttributes,
    JsonApiParameterPostOptionalIdAttributes,
} from "@gooddata/api-client-tiger";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertParameterToBackendCreate(
    parameter: IParameterMetadataObjectDefinition,
): JsonApiParameterPostOptionalIdAttributes {
    return {
        title: parameter.title,
        description: parameter.description,
        tags: parameter.tags,
        definition: {
            type: parameter.definition.type,
            defaultValue: parameter.definition.defaultValue,
            constraints: parameter.definition.constraints,
        },
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
            : {
                  definition: {
                      type: parameter.definition.type,
                      defaultValue: parameter.definition.defaultValue,
                      ...(parameter.definition.constraints === undefined
                          ? {}
                          : { constraints: parameter.definition.constraints }),
                  },
              }),
    };
}
