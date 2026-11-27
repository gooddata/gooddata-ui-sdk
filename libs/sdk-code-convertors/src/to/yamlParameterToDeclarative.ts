// (C) 2026 GoodData Corporation

import {
    type DateRangeParameterDefinition,
    type NumberParameterDefinition,
    type StringParameterDefinition,
} from "@gooddata/api-client-tiger";
import type {
    Parameter,
    DateRangeParameterDefinition as YamlDateRangeDefinition,
    NumberParameterDefinition as YamlNumberDefinition,
    StringParameterDefinition as YamlStringDefinition,
} from "@gooddata/sdk-code-schemas/v1";

import {
    type DeclarativeCodeParameter,
    optionalConstraints,
    toAllowedValue,
    toDateRangeValue,
} from "../utils/parameterUtils.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

/** @public */
export function yamlParameterToDeclarative(input: Parameter): DeclarativeCodeParameter {
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        description: input.description ?? "",
        tags: input.tags ?? [],
        content: yamlParameterDefinitionToDeclarative(input.definition),
    } as DeclarativeCodeParameter;
}

function yamlParameterDefinitionToDeclarative(
    definition: Parameter["definition"],
): DeclarativeCodeParameter["content"] {
    switch (definition.type) {
        case "STRING":
            return yamlStringDefinitionToDeclarative(definition);
        case "NUMBER":
            return yamlNumberDefinitionToDeclarative(definition);
        case "DATE_RANGE":
            return yamlDateRangeDefinitionToDeclarative(definition);
    }
}

function yamlStringDefinitionToDeclarative(definition: YamlStringDefinition): StringParameterDefinition {
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

function yamlNumberDefinitionToDeclarative(definition: YamlNumberDefinition): NumberParameterDefinition {
    const { min, max } = definition.constraints ?? {};

    return {
        type: "NUMBER",
        defaultValue: definition.defaultValue,
        ...optionalConstraints({ min, max }),
    };
}

function yamlDateRangeDefinitionToDeclarative(
    definition: YamlDateRangeDefinition,
): DateRangeParameterDefinition {
    return {
        type: "DATE_RANGE",
        defaultValue: toDateRangeValue(definition.defaultValue),
    };
}
