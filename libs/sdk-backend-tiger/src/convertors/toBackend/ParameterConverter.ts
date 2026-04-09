// (C) 2026 GoodData Corporation

import type { JsonApiParameterPostOptionalIdAttributes } from "@gooddata/api-client-tiger";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertParameterToBackend(
    parameter: IParameterMetadataObjectDefinition,
): JsonApiParameterPostOptionalIdAttributes {
    return {
        ...(parameter.title === undefined ? {} : { title: parameter.title }),
        ...(parameter.description === undefined ? {} : { description: parameter.description }),
        ...(parameter.tags === undefined ? {} : { tags: parameter.tags }),
        definition: {
            type: parameter.definition.type,
            defaultValue: parameter.definition.defaultValue,
            ...(parameter.definition.constraints === undefined
                ? {}
                : { constraints: parameter.definition.constraints }),
        },
    };
}
