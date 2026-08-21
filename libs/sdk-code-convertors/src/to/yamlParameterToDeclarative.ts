// (C) 2026 GoodData Corporation

import { type StringParameterDefinition } from "@gooddata/api-client-tiger";
import type { Parameter } from "@gooddata/sdk-code-schemas/v1";

import {
    type DeclarativeStringParameter,
    optionalConstraints,
    toAllowedValue,
} from "../utils/parameterUtils.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

/** @public */
export function yamlParameterToDeclarative(input: Parameter): DeclarativeStringParameter {
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        description: input.description ?? "",
        tags: input.tags ?? [],
        content: yamlParameterDefinitionToDeclarative(input.definition),
    };
}

function yamlParameterDefinitionToDeclarative(
    definition: Parameter["definition"],
): StringParameterDefinition {
    const { minLength, maxLength, allowedValues } = definition.constraints ?? {};

    return {
        type: "STRING",
        defaultValue: definition.defaultValue,
        ...optionalConstraints({
            minLength,
            maxLength,
            allowedValues: allowedValues?.length ? allowedValues.map(toAllowedValue) : undefined,
        }),
    };
}
